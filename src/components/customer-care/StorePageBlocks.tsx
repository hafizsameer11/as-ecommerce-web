import type { StorePageBlock } from "@/lib/cms-page";

function RichBody({ html }: { html: string }) {
  return (
    <div
      className="text-[13px] text-foreground/80 leading-relaxed space-y-2 [&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:underline"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export function StorePageBlocks({ blocks }: { blocks: StorePageBlock[] }) {
  return (
    <div className="space-y-6">
      {blocks.map((b) => {
        if (b.type === "rich_text" && b.body) {
          return (
            <section key={b.id} className="space-y-2">
              {b.title ? <h2 className="font-semibold text-[16px]">{b.title}</h2> : null}
              <RichBody html={b.body} />
            </section>
          );
        }
        if (b.type === "quote" && b.body) {
          return (
            <blockquote key={b.id} className="border-l-2 border-amber-500 pl-4 text-[13px] italic text-foreground/80">
              {b.body.replace(/<[^>]+>/g, "")}
            </blockquote>
          );
        }
        if ((b.type === "columns" || b.type === "faq") && b.items?.length) {
          return (
            <section key={b.id} className="space-y-3">
              {b.title ? <h2 className="font-semibold text-[16px]">{b.title}</h2> : null}
              {b.items.map((item, i) => (
                <div key={i} className="space-y-1">
                  {item.title ? <div className="font-semibold text-[14px]">{item.title}</div> : null}
                  {item.body ? <RichBody html={item.body} /> : null}
                  {item.value ? <div className="text-[13px]">{item.value}</div> : null}
                </div>
              ))}
            </section>
          );
        }
        if (b.body && typeof b.body === "string") {
          return (
            <section key={b.id} className="space-y-2">
              {b.title ? <h2 className="font-semibold text-[16px]">{b.title}</h2> : null}
              <RichBody html={b.body} />
            </section>
          );
        }
        return null;
      })}
    </div>
  );
}

export function ContentUnavailable() {
  return (
    <p className="text-[13px] text-muted-foreground leading-relaxed py-6 text-center">
      Content unavailable. Please check back later or contact customer care.
    </p>
  );
}
