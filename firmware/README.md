# Sadak Setu — ESP32 Telematics Firmware

This firmware turns an **ESP32 DevKit** into a live road condition survey node. It samples road surface vibration (MPU6050 accelerometer & gyroscope), vehicle GPS speed/position (NEO-6M), and road profile ground clearance (dual HC-SR04 ultrasonic sensors), transmitting structured JSON telemetry to the Sadak Setu backend ingestion engine.

---

## 1. Hardware Bill of Materials (BOM) & Pin Mapping

| Peripheral | Sensor / Module | ESP32 GPIO | Description | Voltage |
|---|---|---|---|---|
| **IMU (6-DOF)** | MPU6050 SDA | **GPIO 21** | I2C Data line | 3.3V |
| **IMU (6-DOF)** | MPU6050 SCL | **GPIO 22** | I2C Clock line | 3.3V |
| **GPS (UART2)** | NEO-6M TX | **GPIO 16** | HardwareSerial2 RX | 3.3V / 5V |
| **GPS (UART2)** | NEO-6M RX | **GPIO 17** | HardwareSerial2 TX | 3.3V / 5V |
| **Ultrasonic 1**| HC-SR04 Trig | **GPIO 5** | Trigger pulse output | 5V |
| **Ultrasonic 1**| HC-SR04 Echo | **GPIO 18** | Echo return (via voltage divider) | 3.3V (divided) |
| **Ultrasonic 2**| HC-SR04 Trig | **GPIO 19** | Trigger pulse output | 5V |
| **Ultrasonic 2**| HC-SR04 Echo | **GPIO 23** | Echo return (via voltage divider) | 3.3V (divided) |
| **Status LED**  | Built-in LED | **GPIO 2** | Network & TX heartbeat | Built-in |

> **Hardware Note for HC-SR04**: The HC-SR04 Echo pin outputs 5V TTL logic. Use a simple voltage divider (1kΩ + 2kΩ resistors) or 3.3V compatible sensor (e.g. RCWL-1601 / HC-SR04P) before connecting to ESP32 GPIO 18/23.

---

## 2. Required Libraries

When compiling via **Arduino IDE**, install the following libraries via the Library Manager (`Ctrl+Shift+I`):
1. **ArduinoJson** by Benoît Blanchon (`>= 6.20.0` or `7.x`)
2. **TinyGPSPlus** by Mikal Hart (`>= 1.0.3`)
3. **ESP32 Arduino Core** (`>= 2.0.0` / `3.x`) — includes `WiFi.h`, `HTTPClient.h`, `WiFiClientSecure.h`, `Wire.h`.

When compiling via **PlatformIO**, libraries are automatically managed via `firmware/platformio.ini`.

---

## 3. Configuration & Credential Setup

1. Copy the configuration template:
   ```bash
   cp firmware/config.h.example firmware/config.h
   ```
2. Open `firmware/config.h` and update:
   - `WIFI_SSID` & `WIFI_PASSWORD`
   - `BACKEND_TELEMETRY_URL` (e.g. `http://<your-server-ip>:5000/api/v1/iot/telemetry`)
   - `DEVICE_ID` (must match a registered `Device` in NeonDB, e.g. `ESP32-SURV-001`)
   - `DEVICE_SECRET` (the secret key whose bcrypt hash is stored in `apiKeyHash`)

---

## 4. Flashing Instructions

### Method A: Arduino IDE
1. Open Arduino IDE.
2. Go to **File -> Preferences** and add the ESP32 board manager URL:
   ```
   https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
   ```
3. In **Tools -> Board**, select **ESP32 Dev Module** (or your specific DevKit board).
4. Set:
   - **Upload Speed**: `921600` (or `115200` if connection is unstable)
   - **CPU Frequency**: `240MHz`
   - **Flash Frequency**: `80MHz`
   - **Port**: Select the COM port assigned to the CP2102 / CH340 USB-to-UART chip.
5. Open `firmware/sadak_setu_esp32.ino`.
6. Click **Upload** (`Ctrl+U`). Hold the `BOOT` button on the ESP32 if the serial bootloader does not automatically trigger.
7. Open Serial Monitor (`Ctrl+Shift+M`) at `115200 baud` to view live telemetry logs.

### Method B: PlatformIO (VS Code)
1. Open the project folder in VS Code with PlatformIO extension installed.
2. Connect the ESP32 via USB.
3. In the PlatformIO sidebar or bottom toolbar, run:
   ```bash
   pio run --target upload
   ```
4. Start serial monitoring:
   ```bash
   pio device monitor -b 115200
   ```

---

## 5. Telemetry Schema Match

The firmware generates JSON matching the Sadak Setu backend validator:

```json
{
  "deviceId": "ESP32-SURV-001",
  "timestamp": "2026-09-09T10:30:00.000Z",
  "latitude": 27.492500,
  "longitude": 77.673900,
  "speed": 48.5,
  "accel_x": 1.450,
  "accel_y": -0.820,
  "accel_z": 14.200,
  "gyro_x": 0.120,
  "gyro_y": -0.340,
  "gyro_z": 0.050,
  "distance_1": 45.2,
  "distance_2": 38.1
}
```

- If GPS is not locked: `"latitude": null`, `"longitude": null`, `"speed": 0.0`
- If ultrasonic times out: `"distance_1": null`
- If MPU6050 fails: `"accel_x": null`, etc.
