interface LogoProps {
  className?: string;
  showText?: boolean;
}

export function Logo({ className = '', showText = true }: LogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-jg-black shadow-lg shadow-jg-red/20 transition-transform duration-300 hover:scale-105">
        <img src="/logo.svg" alt="ClickMotores" className="h-full w-full object-cover" />
      </div>
      {showText && (
        <div className="flex flex-col leading-none">
          <span className="font-display text-base font-bold uppercase italic tracking-wide text-white">
            ClickMotores
          </span>
          <span className="text-[9px] font-medium uppercase tracking-[0.15em] text-jg-red">
            Comercializadora Virtual
          </span>
        </div>
      )}
    </div>
  );
}
