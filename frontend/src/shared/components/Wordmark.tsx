type WordmarkProps = {
  className?: string;
};

export function Wordmark({ className = "" }: WordmarkProps) {
  return (
    <p className={`flex items-baseline gap-2.5 ${className}`}>
      <span className="sr-only">Chiga Tech</span>
      {/* La i va sin punto (ı) para reemplazarlo por el cuadrado de acento */}
      <span
        className="font-display text-[28px] leading-none font-extrabold tracking-[-0.04em] lg:text-[34px]"
        aria-hidden="true"
      >
        ch
        <span className="relative inline-block">
          ı
          <span className="absolute top-[-0.02em] left-1/2 size-[0.21em] -translate-x-1/2 rounded-xs bg-accent" />
        </span>
        ga
      </span>
      <span
        className="text-xs font-semibold tracking-[0.16em] uppercase opacity-60"
        aria-hidden="true"
      >
        tech
      </span>
    </p>
  );
}
