import { describe, it, expect } from 'vitest';
import { GeoUtil } from '../../src/utils/geo';
import { DeviceAdapter } from '../../src/integrations/iot/device-adapter';

describe('Geo & IoT Fusion Utilities', () => {
  it('should accurately calculate Haversine distance', () => {
    // 2 points ~111 meters apart on meridian
    const lat1 = 28.6139;
    const lon1 = 77.209;
    const lat2 = 28.6149;
    const lon2 = 77.209;

    const dist = GeoUtil.distanceMeters(lat1, lon1, lat2, lon2);
    expect(dist).toBeGreaterThan(100);
    expect(dist).toBeLessThan(125);
  });

  it('should correctly detect nearby points within threshold', () => {
    const isClose = GeoUtil.isNearby(28.6139, 77.209, 28.61395, 77.20905, 25);
    expect(isClose).toBe(true);

    const isFar = GeoUtil.isNearby(28.6139, 77.209, 28.625, 77.22, 25);
    expect(isFar).toBe(false);
  });

  it('should compute vibration intensity from raw accelerometer vectors', () => {
    // 1G baseline: ax=0, ay=0, az=9.8 -> vibration intensity = 0
    const baseline = DeviceAdapter.normalize({
      deviceId: 'TEST-01',
      latitude: 28.61,
      longitude: 77.2,
      accelerometerX: 0,
      accelerometerY: 0,
      accelerometerZ: 9.8,
    });
    expect(baseline.vibrationIntensity).toBeLessThanOrEqual(0.01);

    // Bump anomaly: az=15.2, ax=3.0 -> vibration should spike
    const spike = DeviceAdapter.normalize({
      deviceId: 'TEST-01',
      latitude: 28.61,
      longitude: 77.2,
      accelerometerX: 3.0,
      accelerometerY: 2.0,
      accelerometerZ: 15.2,
    });
    expect(spike.vibrationIntensity).toBeGreaterThan(5.0);
  });
});
