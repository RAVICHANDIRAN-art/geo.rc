export function formatNumber(val: number, decimals: number = 2): string {
  if (isNaN(val) || val === undefined || val === null) return '0';
  return val.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

export function formatCoordinate(lat: number, lng: number): { latStr: string; lngStr: string } {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lngDir = lng >= 0 ? 'E' : 'W';
  return {
    latStr: `${Math.abs(lat).toFixed(6)}° ${latDir}`,
    lngStr: `${Math.abs(lng).toFixed(6)}° ${lngDir}`
  };
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
