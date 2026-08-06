export function formatCountdown(secondsStr: string): string {
    if (!secondsStr || !secondsStr.trim()) return 'Unknown';
    const cleanedStr = secondsStr.replace(/[^\d-]/g, '');
    if (!cleanedStr) return 'Unknown';
    const seconds = parseInt(cleanedStr);
    if (isNaN(seconds)) return 'Unknown';
    if (seconds < 0) return 'Already released';
    const days = Math.floor(seconds / (24 * 3600));
    const remainingSeconds = seconds % (24 * 3600);
    const hours = Math.floor(remainingSeconds / 3600);
    const minutes = Math.floor((remainingSeconds % 3600) / 60);
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    else if (hours > 0) return `${hours}h ${minutes}m`;
    else return `${minutes}m`;
}

export function formatReleaseTime(timestampStr: string): string {
    if (!timestampStr || !timestampStr.trim()) return 'Unknown';
    const cleanedStr = timestampStr.replace(/[^\d]/g, '');
    if (!cleanedStr) return 'Unknown';
    let timestamp = parseInt(cleanedStr);
    if (timestamp > 253402300800) timestamp = Math.floor(timestamp / 1000);
    try {
        const dt = new Date(timestamp * 1000);
        const hours = dt.getHours().toString().padStart(2, '0');
        const minutes = dt.getMinutes().toString().padStart(2, '0');
        return `At ${hours}:${minutes}`;
    } catch {
        return 'Unknown';
    }
}
