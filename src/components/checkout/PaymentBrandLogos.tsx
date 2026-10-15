import { Landmark } from "lucide-react";
import visaAsset from "@/assets/visa.png.asset.json";
import mastercardAsset from "@/assets/mastercard.png.asset.json";
import verveAsset from "@/assets/verve.png.asset.json";

export const paymentBrands = [
  { name: "Visa", src: visaAsset.url },
  { name: "Mastercard", src: mastercardAsset.url },
  { name: "Verve", src: verveAsset.url },
];

export function PaymentBrandLogos({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {paymentBrands.map((b) => (
        <img
          key={b.name}
          src={b.src}
          alt={`${b.name} accepted`}
          loading="lazy"
          className="h-6 w-auto object-contain"
        />
      ))}
      <Landmark
        className="h-6 w-6 text-muted-foreground"
        strokeWidth={1.5}
        aria-label="Bank transfer accepted"
      />
    </div>
  );
}
