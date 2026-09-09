/**
 * ==============================================================================
 * SADAK SETU — ESP32 ROAD CONDITION & TELEMETRICS FIRMWARE
 * ==============================================================================
 * Hardware Supported:
 *   - ESP32 WROOM-32 / DevKit v1
 *   - NEO-6M GPS Module (UART Serial2: RX=16, TX=17)
 *   - MPU6050 6-Axis IMU (I2C: SDA=21, SCL=22)
 *   - HC-SR04 Dual Ultrasonic Sensors (Road clearance profiling)
 *       Sensor 1: Trig=5, Echo=18
 *       Sensor 2: Trig=19, Echo=23
 *   - Status LED: GPIO 2
 *
 * Telemetry Contract:
 *   Endpoint: POST /api/v1/iot/telemetry
 *   Headers:
 *     X-Device-Id: <DEVICE_ID>
 *     X-Device-Secret: <DEVICE_SECRET>
 *     Content-Type: application/json
 * ==============================================================================
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>
#include <Wire.h>
#include <time.h>
#include <sys/time.h>
#include <TinyGPSPlus.h>
#include <ArduinoJson.h>

#include "config.h"

// --- Global Objects ---
TinyGPSPlus gps;
HardwareSerial gpsSerial(2);

// --- MPU6050 I2C Definitions ---
#define MPU6050_I2C_ADDR    0x68
#define MPU6050_SMPLRT_DIV  0x19
#define MPU6050_CONFIG      0x1A
#define MPU6050_GYRO_CONFIG 0x1B
#define MPU6050_ACCEL_CONFIG 0x1C
#define MPU6050_ACCEL_XOUT_H 0x3B
#define MPU6050_PWR_MGMT_1  0x6B
#define MPU6050_WHO_AM_I    0x75

// --- Sensor State Flags ---
bool mpuAvailable = false;
bool ntpSynced = false;
unsigned long lastTelemetryMillis = 0;

// ==============================================================================
// 1. SENSOR INITIALIZATION HELPERS
// ==============================================================================

/**
 * Initializes MPU6050 over I2C and configures accelerometer and gyro scales.
 * Full scale ranges: Accel ±8g (4096 LSB/g), Gyro ±500 deg/s (65.5 LSB/(deg/s)).
 */
bool initMPU6050() {
  Wire.begin(I2C_SDA_PIN, I2C_SCL_PIN, 400000); // 400kHz Fast I2C

  // Probe MPU6050 WHO_AM_I register
  Wire.beginTransmission(MPU6050_I2C_ADDR);
  Wire.write(MPU6050_WHO_AM_I);
  if (Wire.endTransmission(false) != 0) {
    Serial.println(F("[WARN] MPU6050 I2C communication failed. Device not responding."));
    return false;
  }

  Wire.requestFrom((uint8_t)MPU6050_I2C_ADDR, (size_t)1);
  if (!Wire.available()) {
    Serial.println(F("[WARN] MPU6050 WHO_AM_I read error."));
    return false;
  }

  uint8_t whoami = Wire.read();
  if (whoami != 0x68 && whoami != 0x70 && whoami != 0x72) {
    Serial.printf("[WARN] Unexpected MPU6050 ID: 0x%02X\n", whoami);
    return false;
  }

  // Wake up MPU6050 (clear SLEEP bit in PWR_MGMT_1)
  Wire.beginTransmission(MPU6050_I2C_ADDR);
  Wire.write(MPU6050_PWR_MGMT_1);
  Wire.write(0x01); // Clock source: PLL with X-axis gyro reference
  Wire.endTransmission(true);
  delay(20);

  // Set sample rate divider to 4 (1 kHz / (1 + 4) = 200 Hz sample rate)
  Wire.beginTransmission(MPU6050_I2C_ADDR);
  Wire.write(MPU6050_SMPLRT_DIV);
  Wire.write(0x04);
  Wire.endTransmission(true);

  // Configure Digital Low Pass Filter (DLPF) to ~44 Hz bandwidth
  Wire.beginTransmission(MPU6050_I2C_ADDR);
  Wire.write(MPU6050_CONFIG);
  Wire.write(0x03);
  Wire.endTransmission(true);

  // Configure Accelerometer full-scale range to ±8g (0x10)
  Wire.beginTransmission(MPU6050_I2C_ADDR);
  Wire.write(MPU6050_ACCEL_CONFIG);
  Wire.write(0x10);
  Wire.endTransmission(true);

  // Configure Gyroscope full-scale range to ±500 deg/s (0x08)
  Wire.beginTransmission(MPU6050_I2C_ADDR);
  Wire.write(MPU6050_GYRO_CONFIG);
  Wire.write(0x08);
  Wire.endTransmission(true);

  Serial.println(F("[INFO] MPU6050 6-Axis IMU successfully initialized (±8g, ±500dps)."));
  return true;
}

/**
 * Initializes HC-SR04 ultrasonic sensor pins.
 */
void initUltrasonics() {
  pinMode(TRIG_PIN_1, OUTPUT);
  pinMode(ECHO_PIN_1, INPUT);
  digitalWrite(TRIG_PIN_1, LOW);

  pinMode(TRIG_PIN_2, OUTPUT);
  pinMode(ECHO_PIN_2, INPUT);
  digitalWrite(TRIG_PIN_2, LOW);

  Serial.println(F("[INFO] Dual HC-SR04 ultrasonic sensors initialized."));
}

/**
 * Reads distance from a single HC-SR04 sensor in centimeters.
 * Returns -1.0 if sensor times out (echo not received or object out of range).
 */
float readUltrasonicDistance(uint8_t trigPin, uint8_t echoPin) {
  // Clear trigger
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);

  // Emit 10 microsecond trigger pulse
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  // Measure echo pulse width (timeout 25000 us ~= 4.3 meters max distance)
  unsigned long duration = pulseIn(echoPin, HIGH, 25000);
  if (duration == 0) {
    return -1.0f; // Sensor failure or out of range
  }

  // Sound velocity = 343 m/s = 0.0343 cm/us; round-trip divided by 2
  float distanceCm = (float)duration * 0.0343f / 2.0f;

  // HC-SR04 valid range: 2 cm to 400 cm
  if (distanceCm < 2.0f || distanceCm > 400.0f) {
    return -1.0f;
  }
  return distanceCm;
}

/**
 * Reads 14 bytes burst data from MPU6050 registers (Accel X, Y, Z + Temp + Gyro X, Y, Z).
 * Returns true if successful, false on I2C error.
 */
bool readMPU6050Data(float &ax, float &ay, float &az, float &gx, float &gy, float &gz) {
  if (!mpuAvailable) {
    return false;
  }

  Wire.beginTransmission(MPU6050_I2C_ADDR);
  Wire.write(MPU6050_ACCEL_XOUT_H);
  if (Wire.endTransmission(false) != 0) {
    return false;
  }

  if (Wire.requestFrom((uint8_t)MPU6050_I2C_ADDR, (size_t)14) != 14) {
    return false;
  }

  int16_t rawAx = (Wire.read() << 8) | Wire.read();
  int16_t rawAy = (Wire.read() << 8) | Wire.read();
  int16_t rawAz = (Wire.read() << 8) | Wire.read();
  Wire.read(); Wire.read(); // Skip temperature registers
  int16_t rawGx = (Wire.read() << 8) | Wire.read();
  int16_t rawGy = (Wire.read() << 8) | Wire.read();
  int16_t rawGz = (Wire.read() << 8) | Wire.read();

  // Convert accelerometer from LSB to m/s^2 (at ±8g sensitivity: 4096 LSB/g)
  const float accelScale = 9.80665f / 4096.0f;
  ax = (float)rawAx * accelScale;
  ay = (float)rawAy * accelScale;
  az = (float)rawAz * accelScale;

  // Convert gyroscope from LSB to rad/s (at ±500 deg/s sensitivity: 65.5 LSB/(deg/s))
  const float gyroScale = (3.1415926535f / 180.0f) / 65.5f;
  gx = (float)rawGx * gyroScale;
  gy = (float)rawGy * gyroScale;
  gz = (float)rawGz * gyroScale;

  return true;
}

// ==============================================================================
// 2. NETWORK & NTP MANAGEMENT
// ==============================================================================

/**
 * Connects or reconnects to configured Wi-Fi AP.
 */
void checkWiFiConnection() {
  if (WiFi.status() == WL_CONNECTED) {
    return;
  }

  Serial.printf("[WIFI] Connecting to SSID: %s ...\n", WIFI_SSID);
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  unsigned long start = millis();
  while (WiFi.status() != WL_CONNECTED && (millis() - start) < WIFI_CONNECT_TIMEOUT) {
    delay(500);
    digitalWrite(STATUS_LED_PIN, !digitalRead(STATUS_LED_PIN));
    Serial.print('.');
  }

  if (WiFi.status() == WL_CONNECTED) {
    digitalWrite(STATUS_LED_PIN, HIGH);
    Serial.printf("\n[WIFI] Connected! IP: %s | RSSI: %d dBm\n",
                  WiFi.localIP().toString().c_str(), WiFi.RSSI());

    // Configure NTP time synchronization (UTC timezone)
    if (!ntpSynced) {
      configTime(0, 0, "pool.ntp.org", "time.nist.gov", "time.google.com");
      ntpSynced = true;
    }
  } else {
    digitalWrite(STATUS_LED_PIN, LOW);
    Serial.println(F("\n[WARN] Wi-Fi connection timed out. Will retry next loop."));
  }
}

/**
 * Formats current UTC time as ISO 8601 string: YYYY-MM-DDTHH:MM:SS.sssZ.
 * Falls back to GPS time if NTP is unavailable.
 */
String getISO8601Timestamp() {
  struct timeval tv;
  gettimeofday(&tv, NULL);
  time_t now = tv.tv_sec;

  // Check if system clock is synchronized (valid year >= 2025)
  if (now > 1735689600) { // 2025-01-01 00:00:00 UTC
    struct tm timeinfo;
    gmtime_r(&now, &timeinfo);
    char buf[32];
    snprintf(buf, sizeof(buf), "%04d-%02d-%02dT%02d:%02d:%02d.%03ldZ",
             timeinfo.tm_year + 1900,
             timeinfo.tm_mon + 1,
             timeinfo.tm_mday,
             timeinfo.tm_hour,
             timeinfo.tm_min,
             timeinfo.tm_sec,
             tv.tv_usec / 1000);
    return String(buf);
  }

  // Secondary fallback: TinyGPSPlus date & time
  if (gps.date.isValid() && gps.time.isValid() && gps.date.year() >= 2025) {
    char buf[32];
    snprintf(buf, sizeof(buf), "%04d-%02d-%02dT%02d:%02d:%02d.%03dZ",
             gps.date.year(),
             gps.date.month(),
             gps.date.day(),
             gps.time.hour(),
             gps.time.minute(),
             gps.time.second(),
             gps.time.centisecond() * 10);
    return String(buf);
  }

  return ""; // Blank timestamp: backend will automatically assign arrival time
}

// ==============================================================================
// 3. TELEMETRY INGESTION DISPATCH
// ==============================================================================

/**
 * Collects sensor data, serializes JSON matching backend contract, and sends HTTP/HTTPS POST.
 */
void transmitTelemetry() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println(F("[HTTP] Skipped: Wi-Fi offline."));
    return;
  }

  // 1. Read MPU6050
  float ax = 0.0f, ay = 0.0f, az = 0.0f;
  float gx = 0.0f, gy = 0.0f, gz = 0.0f;
  bool accelOk = readMPU6050Data(ax, ay, az, gx, gy, gz);

  // 2. Read Dual Ultrasonics
  float dist1 = readUltrasonicDistance(TRIG_PIN_1, ECHO_PIN_1);
  float dist2 = readUltrasonicDistance(TRIG_PIN_2, ECHO_PIN_2);

  // 3. Read GPS
  bool hasGpsFix = gps.location.isValid() && gps.location.age() < 5000;
  double latitude = hasGpsFix ? gps.location.lat() : 0.0;
  double longitude = hasGpsFix ? gps.location.lng() : 0.0;
  float speedKmph = (hasGpsFix && gps.speed.isValid()) ? gps.speed.kmph() : 0.0f;

  // 4. Get Timestamp
  String timestamp = getISO8601Timestamp();

  // 5. Build JSON Payload matching Backend Contract
  StaticJsonDocument<512> doc;
  doc["deviceId"] = DEVICE_ID;

  if (timestamp.length() > 0) {
    doc["timestamp"] = timestamp;
  }

  // GPS coordinates (null if no fix available)
  if (hasGpsFix) {
    doc["latitude"] = latitude;
    doc["longitude"] = longitude;
    doc["speed"] = speedKmph;
  } else {
    doc["latitude"] = nullptr;
    doc["longitude"] = nullptr;
    doc["speed"] = 0.0f;
  }

  // Accelerometer measurements (snake_case matching backend validator)
  if (accelOk) {
    doc["accel_x"] = serialized(String(ax, 3));
    doc["accel_y"] = serialized(String(ay, 3));
    doc["accel_z"] = serialized(String(az, 3));
    doc["gyro_x"]  = serialized(String(gx, 3));
    doc["gyro_y"]  = serialized(String(gy, 3));
    doc["gyro_z"]  = serialized(String(gz, 3));
  } else {
    doc["accel_x"] = nullptr;
    doc["accel_y"] = nullptr;
    doc["accel_z"] = nullptr;
    doc["gyro_x"]  = nullptr;
    doc["gyro_y"]  = nullptr;
    doc["gyro_z"]  = nullptr;
  }

  // Ultrasonic distance measurements (cm)
  if (dist1 >= 0.0f) {
    doc["distance_1"] = serialized(String(dist1, 1));
  } else {
    doc["distance_1"] = nullptr;
  }

  if (dist2 >= 0.0f) {
    doc["distance_2"] = serialized(String(dist2, 1));
  } else {
    doc["distance_2"] = nullptr;
  }

  String jsonPayload;
  serializeJson(doc, jsonPayload);

  // 6. Transmit HTTP / HTTPS Request
  HTTPClient http;
  WiFiClient client;
  WiFiClientSecure secureClient;

  String url = String(BACKEND_TELEMETRY_URL);
  bool isHttps = url.startsWith("https://");

  if (isHttps) {
    secureClient.setInsecure(); // Accept server certificate without CA bundling
    http.begin(secureClient, url);
  } else {
    http.begin(client, url);
  }

  http.setTimeout(HTTP_REQUEST_TIMEOUT);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("X-Device-Id", DEVICE_ID);
  http.addHeader("X-Device-Secret", DEVICE_SECRET);

  unsigned long httpStart = millis();
  int httpCode = http.POST(jsonPayload);
  unsigned long httpDuration = millis() - httpStart;

  if (httpCode == HTTP_CODE_CREATED || httpCode == HTTP_CODE_OK) {
    Serial.printf("[HTTP %d] Telemetry ingested (%lu ms) | Payload: %s\n",
                  httpCode, httpDuration, jsonPayload.c_str());

    // Blink indicator LED on successful transmission
    digitalWrite(STATUS_LED_PIN, LOW);
    delay(40);
    digitalWrite(STATUS_LED_PIN, HIGH);
  } else {
    String responseBody = http.getString();
    Serial.printf("[HTTP ERROR %d] (%lu ms) - Response: %s\n",
                  httpCode, httpDuration, responseBody.c_str());
  }

  http.end();
}

// ==============================================================================
// 4. ARDUINO SETUP & LOOP
// ==============================================================================

void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println(F("\n========================================================"));
  Serial.println(F("SADAK SETU — ESP32 ROAD SURVEILLANCE TELEMETRY NODE"));
  Serial.printf(F("Device ID: %s | Firmware: v2.4.2-live\n"), DEVICE_ID);
  Serial.println(F("========================================================"));

  pinMode(STATUS_LED_PIN, OUTPUT);
  digitalWrite(STATUS_LED_PIN, LOW);

  // Initialize hardware sensors
  initUltrasonics();
  mpuAvailable = initMPU6050();

  // Initialize GPS UART
  gpsSerial.begin(GPS_BAUDRATE, SERIAL_8N1, GPS_RX_PIN, GPS_TX_PIN);
  Serial.printf("[INFO] NEO-6M GPS UART initialized on RX=%d, TX=%d @ %d baud.\n",
                GPS_RX_PIN, GPS_TX_PIN, GPS_BAUDRATE);

  // Connect to Wi-Fi
  checkWiFiConnection();
}

void loop() {
  // Feed incoming GPS UART characters to TinyGPSPlus parser
  while (gpsSerial.available() > 0) {
    gps.encode(gpsSerial.read());
  }

  // Periodic telemetry transmission loop
  unsigned long currentMillis = millis();
  if (currentMillis - lastTelemetryMillis >= TELEMETRY_INTERVAL_MS) {
    lastTelemetryMillis = currentMillis;

    // Ensure Wi-Fi link remains active
    checkWiFiConnection();

    // Ingest sample
    transmitTelemetry();
  }
}
