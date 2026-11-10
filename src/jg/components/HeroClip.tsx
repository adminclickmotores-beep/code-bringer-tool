const FONDO =
  'https://images.pexels.com/photos/38570/lamborghini-car-speed-prestige-38570.jpeg?auto=compress&cs=tinysrgb&w=1600';

// Fondo animado con código (sin video): foto cinematográfica con zoom lento,
// haces de luz rojos en movimiento y destello de faros. Liviano y sin pantalla negra.
const ESTILOS = `
@keyframes hero-zoom { from { transform: scale(1.05) translate3d(0,0,0); } to { transform: scale(1.18) translate3d(-1.5%, -1%, 0); } }
@keyframes hero-racha { 0% { transform: translate3d(-130%,0,0); opacity: 0; } 15% { opacity: 1; } 85% { opacity: 1; } 100% { transform: translate3d(130%,0,0); opacity: 0; } }
@keyframes hero-respira { 0%,100% { opacity: .35; } 50% { opacity: .75; } }
.hero-zoom { animation: hero-zoom 22s ease-in-out infinite alternate; will-change: transform; }
.hero-racha { animation: hero-racha 5.5s cubic-bezier(.4,0,.2,1) infinite; will-change: transform, opacity; }
.hero-respira { animation: hero-respira 6s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) { .hero-zoom, .hero-racha, .hero-respira { animation: none; } }
`;

const RACHAS = [
  { top: '22%', ancho: '38%', delay: '0s', dur: '5.5s' },
  { top: '38%', ancho: '55%', delay: '1.8s', dur: '4.6s' },
  { top: '56%', ancho: '30%', delay: '3.2s', dur: '6.2s' },
  { top: '72%', ancho: '48%', delay: '0.9s', dur: '5s' },
];

export function HeroClip() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#070707]" aria-hidden="true">
      <style>{ESTILOS}</style>

      <img
        src={FONDO}
        alt=""
        loading="eager"
        className="hero-zoom absolute inset-0 h-full w-full object-cover"
      />

      {/* Rachas de luz rojas cruzando la pantalla */}
      {RACHAS.map((r) => (
        <span
          key={r.top}
          className="hero-racha absolute left-0 h-px bg-gradient-to-r from-transparent via-[#FF1E27] to-transparent shadow-[0_0_18px_2px_rgba(255,30,39,0.55)]"
          style={{ top: r.top, width: r.ancho, animationDelay: r.delay, animationDuration: r.dur }}
        />
      ))}

      {/* Resplandor que respira, como faros en la oscuridad */}
      <div className="hero-respira absolute -right-24 top-1/3 h-80 w-80 rounded-full bg-[#FF1E27]/25 blur-3xl" />

      {/* Máscaras para que el texto se lea bien */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/45" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.5)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#FF1E27]/15 to-transparent" />
      <div className="absolute inset-0 grid-pattern opacity-20" />
    </div>
  );
}
