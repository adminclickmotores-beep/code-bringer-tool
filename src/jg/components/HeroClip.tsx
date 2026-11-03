const POSTER =
  'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=1600';
const FALLBACK_IMG =
  'https://images.pexels.com/photos/38570/lamborghini-car-speed-prestige-38570.jpeg?auto=compress&cs=tinysrgb&w=1600';

// Video cinematográfico nocturno (Pexels): manejo de noche con luces LED.
// Si el archivo no carga, el póster + overlay mantienen el Hero sin pantalla negra.
const VIDEO_SRC =
  'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=1600';

export function HeroClip() {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Imagen de respaldo (siempre visible si el video falla) */}
      <img
        src={FALLBACK_IMG}
        alt=""
        loading="eager"
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* Video edge-to-edge */}
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        poster={POSTER}
        className="absolute inset-0 h-full w-full object-cover"
        onError={(e) => {
          (e.target as HTMLVideoElement).style.display = 'none';
        }}
      >
        <source src={VIDEO_SRC} type="video/mp4" />
      </video>

      {/* Máscara de penumbra: el video se intuye al fondo sin opacar el texto */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/40" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.45)_100%)]" />
      {/* Acento rojo eléctrico sutil abajo */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#FF1E27]/15 to-transparent" />
      <div className="absolute inset-0 grid-pattern opacity-20" />
    </div>
  );
}
