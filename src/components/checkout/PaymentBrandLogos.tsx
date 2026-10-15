import { Landmark } from "lucide-react";
import visaAsset from "@/assets/visa.png";
import mastercardAsset from "@/assets/mastercard.png";
import verveAsset from "@/assets/verve.png";

export const paymentBrands = [
  { name: "Visa", src: visaAsset },
  { name: "Mastercard", src: mastercardAsset },
  { name: "Verve", src: verveAsset },
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
