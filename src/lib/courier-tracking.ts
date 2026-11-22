/**
 * Public courier tracking pages for the carriers the backend supports
 * (DHL, FedEx, UPS, GIG, Aramex). Local / in-house shipments have no public page.
 */
export function courierTrackingUrl(
  carrier?: string | null,
  trackingNumber?: string | null,
  explicitUrl?: string | null
): string | null {
  if (explicitUrl && /^https?:\/\//i.test(explicitUrl)) return explicitUrl;
  const num = trackingNumber?.trim();
  if (!carrier || !num) return null;
  const n = encodeURIComponent(num);
  const c = carrier.toLowerCase();
  if (c.includes("dhl")) return `https://www.dhl.com/global-en/home/tracking/tracking-express.html?submit=1&tracking-id=${n}`;
  if (c.includes("fedex")) return `https://www.fedex.com/fedextrack/?trknbr=${n}`;
  if (c.includes("ups")) return `https://www.ups.com/track?loc=en_US&tracknum=${n}`;
  if (c.includes("aramex")) return `https://www.aramex.com/track/results?ShipmentNumber=${n}`;
  if (c.includes("gig")) return `https://giglogistics.com/track-shipment/?tracking_number=${n}`;
  return null;
}

export function openCourierTracking(url: string) {
  if (typeof window !== "undefined") window.open(url, "_blank", "noopener,noreferrer");
}
