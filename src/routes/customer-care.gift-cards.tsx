import { createFileRoute, Link } from "@tanstack/react-router";
import { GiftCardBalance } from "@/components/gift-cards/GiftCardBalance";

export const Route = createFileRoute("/customer-care/gift-cards")({
  head: () => ({
    meta: [{ title: "Gift Cards - ASL ORIGINALS" }],
  }),
  component: GiftCardsPage,
});

function GiftCardsPage() {
  return (
    <div className="max-w-xl mx-auto px-4 py-10 space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Gift cards</h1>
        <p className="text-[13px] text-muted-foreground mt-2">
          ASL ORIGINALS gift cards work online, in the app, and at our stores. Cards are issued at checkout in store or with our team — enter your code below to see your balance.
        </p>
      </div>
      <GiftCardBalance />
      <p className="text-[12px] text-muted-foreground">
        Applying a card at checkout?{" "}
        <Link to="/checkout/payment" className="font-semibold underline text-ink">
          Go to payment
        </Link>
        {" "}and enter your code under Gift card.
      </p>
    </div>
  );
}