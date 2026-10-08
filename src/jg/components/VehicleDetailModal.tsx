import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Bike, Car, Calendar, Gauge, Fuel, Settings2, ImageIcon, ShieldCheck, Instagram, MapPin, CalendarClock } from 'lucide-react';
import { Vehicle, formatCOP, STATUS_CONFIG, TAG_CONFIG, whatsappLink, logConsulta, maskPlaca } from '@/jg/lib/supabase';

interface VehicleDetailModalProps {
  vehicle: Vehicle | null;
  onClose: () => void;
}

export function VehicleDetailModal({ vehicle, onClose }: VehicleDetailModalProps) {
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    setCurrentImage(0);
  }, [vehicle]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (vehicle) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEsc);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleEsc);
    };
  }, [vehicle, onClose]);

  if (!vehicle) return null;

  const status = STATUS_CONFIG[vehicle.status];
  const tag = vehicle.tag ? TAG_CONFIG[vehicle.tag] : null;
  const images = vehicle.image_urls?.length ? vehicle.image_urls : [];
  const canBuy = vehicle.status === 'disponible' || vehicle.status === 'aliado';

  const nextImage = () => setCurrentImage((prev) => (prev + 1) % Math.max(images.length, 1));
  const prevImage = () => setCurrentImage((prev) => (prev - 1 + Math.max(images.length, 1)) % Math.max(images.length, 1));

  const specs = [
    { icon: Calendar, label: 'Año', value: vehicle.year.toString() },
    { icon: Gauge, label: 'Kilometraje', value: vehicle.mileage != null ? `${vehicle.mileage.toLocaleString('es-CO')} km` : 'N/A' },
    vehicle.displacement && { icon: Gauge, label: 'Cilindraje', value: vehicle.displacement },
    vehicle.fuel && { icon: Fuel, label: 'Combustible', value: vehicle.fuel },
    vehicle.transmission && { icon: Settings2, label: 'Transmisión', value: vehicle.transmission },
    vehicle.ciudad && { icon: MapPin, label: 'Ciudad', value: vehicle.ciudad },
  ].filter(Boolean) as { icon: typeof Calendar; label: string; value: string }[];

  const handleWaClick = () => {
    logConsulta('whatsapp_click', vehicle.title);
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-4xl animate-scale-in overflow-y-auto rounded-2xl border border-jg-border-light bg-jg-surface"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition-all hover:bg-jg-red hover:text-white"
          aria-label="Cerrar"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2">
          <div className="relative aspect-[4/3] bg-jg-surface-2 lg:aspect-auto">
            {images.length > 0 ? (
              <>
                <img
                  src={images[currentImage]}
                  alt={vehicle.title}
                  className="h-full w-full object-cover"
                />
                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition-all hover:bg-jg-red"
                      aria-label="Anterior"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition-all hover:bg-jg-red"
                      aria-label="Siguiente"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                    <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
                      {images.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentImage(idx)}
                          className={`h-2 rounded-full transition-all ${
                            idx === currentImage ? 'w-6 bg-jg-red' : 'w-2 bg-white/40'
                          }`}
                          aria-label={`Imagen ${idx + 1}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <ImageIcon className="h-16 w-16 text-gray-300" />
              </div>
            )}
            <div className="absolute top-3 left-3 flex flex-col gap-1.5">
              <span className={`badge ${status.class}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                {status.label}
              </span>
              {tag && (
                <span className={`badge ${tag.class}`}>{tag.label}</span>
              )}
              <span className="badge border border-black/10 bg-white/80 backdrop-blur-sm text-jg-text-dark">
                {vehicle.type === 'moto' ? <Bike className="h-3.5 w-3.5" /> : <Car className="h-3.5 w-3.5" />}
                {vehicle.type === 'moto' ? 'Moto' : 'Carro'}
              </span>
            </div>
          </div>

          <div className="flex flex-col p-6">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-jg-text-muted">
                {vehicle.brand} · {vehicle.model}
              </p>
              <h2 className="mt-1 font-display text-2xl font-bold text-jg-text-dark">
                {vehicle.title}
              </h2>
            </div>

            <div className="mt-4">
              <p className="text-xs text-jg-text-muted">Precio</p>
              <p className="font-display text-3xl font-bold text-gradient">{formatCOP(vehicle.price)}</p>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              {specs.map((spec) => (
                <div key={spec.label} className="rounded-lg border border-jg-border-light bg-jg-surface-2 p-3">
                  <div className="flex items-center gap-2 text-xs text-jg-text-muted">
                    <spec.icon className="h-3.5 w-3.5" />
                    {spec.label}
                  </div>
                  <p className="mt-1 text-sm font-semibold text-jg-text-dark">{spec.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-3">
              <p className="text-xs text-jg-text-muted">{maskPlaca(vehicle.placa_completa)}</p>
            </div>

            {vehicle.description && (
              <div className="mt-5">
                <h3 className="mb-2 font-display text-sm font-bold uppercase tracking-wide text-jg-text-muted">
                  Descripción
                </h3>
                <p className="text-sm leading-relaxed text-jg-text-dark">{vehicle.description}</p>
              </div>
            )}

            <div className="mt-5 rounded-lg border border-green-500/20 bg-green-500/5 p-3">
              <div className="flex items-center gap-2 text-xs text-green-700">
                <ShieldCheck className="h-4 w-4" />
                <span className="font-semibold">Verificado JG - Listo para Traspaso</span>
              </div>
              <p className="mt-1 pl-6 text-xs text-jg-text-muted">
                Vehículo 100% verificado, sin chicharrones. Trámite de traspaso legal incluido a nombre del nuevo dueño.
              </p>
            </div>

            {vehicle.consignado && (
              <div className="mt-3 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3">
                <div className="flex items-center gap-2 text-xs text-yellow-700">
                  <MapPin className="h-4 w-4" />
                  <span className="font-semibold">Ubicación y Exhibición</span>
                </div>
                <p className="mt-1 pl-6 text-xs text-jg-text-muted">
                  Al ser un vehículo consignado, puede no encontrarse físicamente en la sede. Es necesario agendar cita previa.
                </p>
                <a
                  href={whatsappLink(`Hola JG Motors, me gustaría agendar una cita para ver el vehículo: ${vehicle.title}.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 flex items-center gap-1.5 rounded-lg bg-yellow-500/15 px-3 py-2 text-xs font-semibold text-yellow-700 transition-all hover:bg-yellow-500/25"
                >
                  <CalendarClock className="h-3.5 w-3.5" />
                  Agendar Cita para Ver Vehículo
                </a>
              </div>
            )}

            {vehicle.instagram_url && (
              <a
                href={vehicle.instagram_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 flex items-center justify-center gap-2 rounded-lg border border-pink-500/30 bg-pink-500/10 px-4 py-2.5 text-sm font-semibold text-pink-600 transition-all hover:bg-pink-500/20"
              >
                <Instagram className="h-4 w-4" />
                Ver Video en Instagram
              </a>
            )}

            <div className="mt-auto pt-5">
              {canBuy ? (
                <a
                  href={whatsappLink(`Hola JG Motors, estoy interesado en el vehículo: ${vehicle.title} - ${formatCOP(vehicle.price)}. ¿Me puedes dar más información?`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleWaClick}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-500 px-6 py-3.5 text-sm font-semibold text-white transition-all hover:bg-green-600 active:scale-95"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  Consultar por WhatsApp
                </a>
              ) : (
                <div className="rounded-lg border border-jg-border-light bg-jg-surface-2 px-6 py-3.5 text-center text-sm text-jg-text-muted">
                  Este vehículo {vehicle.status === 'vendido' ? 'ya fue vendido' : 'no está disponible actualmente'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
