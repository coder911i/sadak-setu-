export class GeoUtil {
  /**
   * Calculates Haversine distance between two GPS points in meters.
   */
  static distanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371000; // Radius of Earth in meters
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private static toRadians(deg: number): number {
    return deg * (Math.PI / 180);
  }

  /**
   * Check if two points are within a threshold distance (default 25 meters).
   */
  static isNearby(lat1: number, lon1: number, lat2: number, lon2: number, thresholdMeters = 25): boolean {
    return this.distanceMeters(lat1, lon1, lat2, lon2) <= thresholdMeters;
  }
}
