import { Package } from "lucide-react";

const ITEMS = [
  { name: "Mouse inalámbrico", price: "$ 18.500" },
  { name: "Teclado mecánico", price: "$ 64.900" },
  { name: "SSD 1 TB", price: "$ 89.000" },
];

export function ReceiptPreview() {
  return (
    <div className="relative h-82 w-82" aria-hidden="true">
      <div className="absolute top-5 left-1.5 flex w-75 -rotate-4 flex-col gap-3.5 rounded-2xl bg-surface p-5.5 pb-5 text-ink shadow-[0_24px_48px_rgb(0_0_0/.32),0_2px_6px_rgb(0_0_0/.2)]">
        <div className="flex items-baseline justify-between">
          <span className="font-display text-[15px] font-bold">Venta</span>
          <span className="text-[11px] text-muted tabular-nums">0001-00004217</span>
        </div>
        <ul className="flex flex-col gap-2.5 border-y border-dashed border-line-strong py-3 text-[13px]">
          {ITEMS.map(({ name, price }) => (
            <li key={name} className="flex justify-between gap-3">
              <span>{name}</span>
              <span className="tabular-nums">{price}</span>
            </li>
          ))}
        </ul>
        <div className="flex items-baseline justify-between">
          <span className="text-[13px] text-muted">Total</span>
          <span className="text-lg font-semibold tabular-nums">$ 172.400</span>
        </div>
        <span className="self-start rounded-full bg-accent/40 px-2.5 py-1 text-xs font-semibold text-primary">
          Cuenta corriente · Gómez
        </span>
      </div>

      <div className="absolute -right-2 bottom-2 flex rotate-5 items-center gap-2.5 rounded-xl border border-accent/35 bg-brand px-4 py-3 text-white shadow-[0_16px_32px_rgb(0_0_0/.35)]">
        <Package className="text-accent" size={18} strokeWidth={2} />
        <span className="text-[13px] font-medium">SSD 1 TB · quedan 11</span>
      </div>
    </div>
  );
}
