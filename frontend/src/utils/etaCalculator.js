/**
 * Calculate estimated time of arrival based on distance and average speed
 */
export const calculateETA = (distanceKm, averageSpeedKph = 50) => {
  if (!distanceKm || distanceKm <= 0) return null;
  
  const timeHours = distanceKm / averageSpeedKph;
  const timeMinutes = Math.round(timeHours * 60);
  
  const now = new Date();
  const eta = new Date(now.getTime() + timeMinutes * 60 * 1000);
  
  return {
    eta,
    timeMinutes,
    timeHours: Math.round(timeHours * 10) / 10,
    formatted: formatETA(eta)
  };
};

/**
 * Format ETA for display
 */
export const formatETA = (date) => {
  const now = new Date();
  const diffMs = date - now;
  const diffMins = Math.round(diffMs / (1000 * 60));
  
  if (diffMins < 60) {
    return `${diffMins} min${diffMins !== 1 ? 's' : ''}`;
  } else if (diffMins < 1440) {
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `${hours}h ${mins}m`;
  } else {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
};

/**
 * Calculate distance between two points using Haversine formula
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};
