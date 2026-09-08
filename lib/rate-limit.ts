// In-memory rate limiter per IP address
// Default: 10 requests per 60 seconds

const requestCounts = new Map<string, { count: number; resetAt: number }>();

// Cleanup expired entries every 5 minutes to prevent unbounded Map growth
// (entries are only removed on-demand otherwise — C2-GAP-02 fix)
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of requestCounts.entries()) {
      if (entry.resetAt < now) {
        requestCounts.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}


export function rateLimit(ip: string, maxRequests = 10, windowMs = 60_000): {
  allowed: boolean;
  remaining: number;
  resetInSeconds: number;
} {
  const now = Date.now();
  const entry = requestCounts.get(ip);

  // Bersihkan entry jika sudah kedaluwarsa
  if (!entry || entry.resetAt < now) {
    requestCounts.set(ip, { count: 1, resetAt: now + windowMs });
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetInSeconds: Math.ceil(windowMs / 1000),
    };
  }

  if (entry.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetInSeconds: Math.max(0, Math.ceil((entry.resetAt - now) / 1000)),
    };
  }

  entry.count++;
  return {
    allowed: true,
    remaining: maxRequests - entry.count,
    resetInSeconds: Math.max(0, Math.ceil((entry.resetAt - now) / 1000)),
  };
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return req.headers.get("x-real-ip") || "127.0.0.1";
}
