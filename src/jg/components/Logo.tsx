interface LogoProps {
  className?: string;
  showText?: boolean;
}

export function Logo({ className = '', showText = true }: LogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <img src="/favicon.svg" alt="ClickMotores" className="h-10 w-10 shrink-0 rounded-xl" />
      {showText && (
        <div className="flex flex-col leading-none">
          <span className="font-display text-lg font-extrabold tracking-tight text-white">
            Click<span className="text-jg-red">Motores</span>
          </span>
          <span className="mt-1 text-[9px] font-medium uppercase tracking-[0.15em] text-gray-400">
            Vitrina digital de vehículos
          </span>
        </div>
      )}
    </div>
  );
}
