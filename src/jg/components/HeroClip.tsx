const FOTOS = [
  'https://images.pexels.com/photos/38570/lamborghini-car-speed-prestige-38570.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/1592384/pexels-photo-1592384.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
];

export function HeroClip() {
  return (
    <div className="absolute inset-0" aria-hidden="true">
      <style>{`
        @keyframes cm-clip-fade {
          0% { opacity: 0; transform: scale(1.12); }
          8% { opacity: 1; }
          33% { opacity: 1; transform: scale(1.02); }
          42% { opacity: 0; transform: scale(1); }
          100% { opacity: 0; transform: scale(1.12); }
        }
        @keyframes cm-clip-sweep {
          0% { transform: translateX(-130%) skewX(-18deg); opacity: 0; }
          12% { opacity: 1; }
          50% { transform: translateX(230%) skewX(-18deg); opacity: 1; }
          62%, 100% { transform: translateX(230%) skewX(-18deg); opacity: 0; }
        }
        @keyframes cm-clip-glow {
          0%, 100% { opacity: 0.45; }
          50% { opacity: 1; }
        }
        .cm-clip-foto {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0;
          animation: cm-clip-fade 24s ease-in-out infinite;
          will-change: opacity, transform;
        }
        .cm-clip-bar {
          position: absolute;
          top: -10%;
          bottom: -10%;
          width: 34%;
          background: linear-gradient(90deg, transparent, rgba(255,30,39,0.22) 45%, rgba(255,255,255,0.10) 55%, transparent);
          filter: blur(6px);
          animation: cm-clip-sweep 9s ease-in-out infinite;
          will-change: transform, opacity;
        }
        .cm-clip-punto {
          position: absolute;
          border-radius: 9999px;
          background: rgba(255,30,39,0.9);
          filter: blur(1px);
          animation: cm-clip-glow 3.2s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .cm-clip-foto, .cm-clip-bar, .cm-clip-punto { animation: none; }
          .cm-clip-foto:first-child { opacity: 1; }
        }
      `}</style>

      {FOTOS.map((src, i) => (
        <img
          key={src}
          src={src}
          alt=""
          loading={i === 0 ? 'eager' : 'lazy'}
          className="cm-clip-foto"
          style={{ animationDelay: `${i * 8}s` }}
        />
      ))}

      {/* video real si algun dia lo subes a public/videos/showroom.mp4 */}
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="none"
        poster={FOTOS[0]}
        className="absolute inset-0 hidden h-full w-full object-cover"
        onError={(e) => {
          (e.target as HTMLVideoElement).style.display = 'none';
        }}
      >
        <source src="/videos/showroom.mp4" type="video/mp4" />
      </video>

      <div className="cm-clip-bar" />
      <span className="cm-clip-punto left-[12%] top-[22%] h-1.5 w-1.5" />
      <span className="cm-clip-punto left-[68%] top-[64%] h-1 w-1" style={{ animationDelay: '1.1s' }} />
      <span className="cm-clip-punto left-[82%] top-[30%] h-2 w-2 opacity-70" style={{ animationDelay: '2s' }} />

      <div className="absolute inset-0 bg-gradient-to-r from-jg-black via-jg-black/85 to-jg-black/40" />
      <div className="absolute inset-0 bg-gradient-to-t from-jg-black via-jg-black/20 to-jg-black/60" />
      <div className="absolute inset-0 grid-pattern opacity-30" />
    </div>
  );
}
