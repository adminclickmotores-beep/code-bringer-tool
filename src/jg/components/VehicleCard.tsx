import { useState } from 'react';
import { Bike, Car, Gauge, Calendar, Fuel, Settings2, ImageIcon, ShieldCheck, Instagram, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { Vehicle, formatCOP, STATUS_CONFIG, TAG_CONFIG, whatsappLink, whatsappLinkTo, logConsulta, maskPlaca } from '@/jg/lib/supabase';
import { contactTarget } from '@/jg/lib/plans';
import { InterestCaptureModal } from '@/jg/components/InterestCaptureModal';

interface VehicleCardProps {
  vehicle: Vehicle;
  onClick: () => void;
}

export function VehicleCard({ vehicle, onClick }: VehicleCardProps) {
  const status = STATUS_CONFIG[vehicle.status];
  const tag = vehicle.tag ? TAG_CONFIG[vehicle.tag] : null;
  const images = vehicle.image_urls?.filter(Boolean) ?? [];
  const [currentImage, setCurrentImage] = useState(0);
  const contact = contactTarget(vehicle);
  const isExpiredThirdParty = vehicle.listing_owner === 'tercero' && contact === 'none' && vehicle.status !== 'vendido' && vehicle.status !== 'no_disponible';
  const [showInterest, setShowInterest] = useState(false);
  const waHref = contact === 'owner'
    ? whatsappLinkTo(vehicle.owner_phone, `Hola${vehicle.owner_name ? ` ${vehicle.owner_name}` : ''}, vi tu vehículo ${vehicle.title} (${maskPlaca(vehicle.placa_completa)}) publicado en ClickMotores y me interesa. ¿Sigue disponible?`)
    : whatsappLink(`Hola, estoy interesado en el vehículo: ${vehicle.title} (${formatCOP(vehicle.price)}). ¿Me puedes dar más información?`);

  const handleWaClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    logConsulta('whatsapp_click', vehicle.title);
    setShowInterest(true);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImage((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <article
      onClick={onClick}
      className="card card-hover group cursor-pointer overflow-hidden"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-jg-surface-2">
        {images.length > 0 ? (
          <img
            src={images[currentImage]}
            alt={vehicle.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <ImageIcon className="h-12 w-12 text-gray-600" />
          </div>
        )}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          <span className={`badge ${status.class}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
            {status.label}
          </span>
          {isExpiredThirdParty && (
            <span className="badge border border-red-500/30 bg-red-500/15 text-red-700">
              Anuncio expirado
            </span>
          )}
          {tag && (
            <span className={`badge ${tag.class}`}>
              {tag.label}
            </span>
          )}
        </div>
        <div className="absolute top-3 right-3">
          <span className="badge border border-black/10 bg-white/80 backdrop-blur-sm text-jg-text-dark">
            {vehicle.type === 'moto' ? (
              <Bike className="h-3.5 w-3.5" />
            ) : (
              <Car className="h-3.5 w-3.5" />
            )}
            {vehicle.type === 'moto' ? 'Moto' : 'Carro'}
          </span>
        </div>
        <div className="absolute bottom-3 right-3">
          <span className="badge border border-green-500/30 bg-green-500/15 backdrop-blur-sm text-green-700">
            <ShieldCheck className="h-3 w-3" />
            Verificado JG
          </span>
        </div>
        {vehicle.featured && (
          <div className="absolute bottom-3 left-3">
            <span className="badge bg-jg-red/90 text-white backdrop-blur-sm">
              Destacado
            </span>
          </div>
        )}

        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100"
              aria-label="Foto anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100"
              aria-label="Foto siguiente"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <div className="absolute bottom-1 left-1/2 flex -translate-x-1/2 gap-1">
              {images.slice(0, 6).map((_, idx) => (
                <span
                  key={idx}
                  className={`h-1.5 w-1.5 rounded-full transition-all ${
                    idx === currentImage ? 'bg-white' : 'bg-white/40'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-display text-lg font-bold text-jg-text-dark line-clamp-1 group-hover:text-jg-red transition-colors">
          {vehicle.title}
        </h3>
        <p className="mt-0.5 text-sm text-jg-text-muted">
          {vehicle.brand} · {vehicle.model}
        </p>

        <div className="mt-3 flex flex-wrap gap-3 text-xs text-jg-text-muted">
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" /> {vehicle.year}
          </span>
          {vehicle.displacement && (
            <span className="flex items-center gap-1">
              <Gauge className="h-3.5 w-3.5" /> {vehicle.displacement}
            </span>
          )}
          {vehicle.mileage != null && (
            <span className="flex items-center gap-1">
              <Gauge className="h-3.5 w-3.5" /> {vehicle.mileage.toLocaleString('es-CO')} km
            </span>
          )}
          {vehicle.fuel && (
            <span className="flex items-center gap-1">
              <Fuel className="h-3.5 w-3.5" /> {vehicle.fuel}
            </span>
          )}
          {vehicle.ciudad && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" /> {vehicle.ciudad}
            </span>
          )}
        </div>

        <p className="mt-2 text-xs text-jg-text-muted">
          {maskPlaca(vehicle.placa_completa)}
        </p>

        {vehicle.consignado && (
          <div className="mt-2 flex items-center gap-1.5 rounded-md bg-yellow-500/10 px-2 py-1 text-[10px] text-yellow-700">
            <MapPin className="h-3 w-3" />
            Vehículo consignado · puede no estar en sede
          </div>
        )}

        <div className="mt-4 flex items-center justify-between border-t border-jg-border-light pt-3">
          <div>
            <p className="text-xs text-jg-text-muted">Precio</p>
            <p className="font-display text-xl font-bold text-gradient">{formatCOP(vehicle.price)}</p>
          </div>
          <div className="flex items-center gap-1.5">
            {vehicle.instagram_url && (
              <a
                href={vehicle.instagram_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="rounded-lg bg-pink-500/15 p-2.5 text-pink-600 transition-all hover:bg-pink-500 hover:text-jg-text-dark"
                aria-label="Ver video en Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
            )}
            {contact !== 'none' && (
            <button
              type="button"
              onClick={handleWaClick}
              className="rounded-lg bg-green-500/15 p-2.5 text-green-600 transition-all hover:bg-green-500 hover:text-white"
              aria-label={contact === 'owner' ? 'Contactar al propietario por WhatsApp' : 'Consultar por WhatsApp'}
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
            </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
