import React, { useMemo, useRef, useState } from 'react';

import {
  Plus,
  Trash2,
  ShieldCheck,
  Users,
  FileSpreadsheet,
  Loader2,
  Car,
  Bike,
  FileText,
  Printer,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Pencil,
  Search,
  X,
  LogOut,
  Download,
  Eye,
  RefreshCw,
} from 'lucide-react';
import {
  ALLOWED_IMAGE_TYPES,
  MAX_UPLOAD_BYTES,
  MAX_VEHICLE_PHOTOS,
} from '@/jg/lib/vehicle-submission';
import { ListingBadge } from '@/jg/components/ListingBadge';
import { BuyerInterestsPanel } from '@/jg/components/BuyerInterestsPanel';
import {
  Vehicle,
  VehicleAdminInput,
  uploadVehiclePhoto,
} from '@/jg/lib/supabase';

type VehicleType = 'carro' | 'moto';
type VehicleStatus = Vehicle['status'];
type VehicleTag = NonNullable<Vehicle['tag']>;

type VehicleForm = {
  title: string;
  type: VehicleType;
  brand: string;
  model: string;
  year: number;
  price: string;
  mileage: string;
  transmission: string;
  fuel: string;
  city: string;
  tag: VehicleTag;
  status: VehicleStatus;
  internal_status: InternalStatus;
  listing_owner: 'jg' | 'tercero';
  owner_name: string;
  owner_phone: string;
  image_urls: string[];
};

type InternalStatus = 'reservado' | 'propio' | 'consignacion' | 'retirado';
const INTERNAL_STATUSES: InternalStatus[] = ['propio', 'consignacion', 'reservado', 'retirado'];
const INTERNAL_LABELS: Record<InternalStatus, string> = {
  propio: 'Propio',
  consignacion: 'Consignación',
  reservado: 'Reservado',
  retirado: 'Retirado',
};

interface AdminPageProps {
  vehicles: Vehicle[];
  loading: boolean;
  onRefresh: () => Promise<void>;
  onLogout: () => Promise<void>;
  onUpdateVehicleStatus: (id: string, status: VehicleStatus) => Promise<void>;
  onDeleteVehicle: (id: string) => Promise<void>;
  onAddVehicle: (vehicle: VehicleAdminInput) => Promise<void>;
  onUpdateVehicle: (id: string, vehicle: VehicleAdminInput) => Promise<void>;
  userEmail: string;
  stats?: Record<string, number>;
}

const TAGS: VehicleTag[] = [
  'recien_ingresado',
  'precio_rebajado',
  'separado',
];
const TAG_FILTERS: ('all' | VehicleTag)[] = ['all', ...TAGS];

const VEHICLE_STATUSES: VehicleStatus[] = [
  'disponible',
  'no_disponible',
  'vendido',
  'aliado',
];

const STATUS_LABELS: Record<VehicleStatus, string> = {
  disponible: 'Disponible',
  no_disponible: 'No disponible',
  vendido: 'Vendido',
  aliado: 'Aliado',
};

const INITIAL_FORM: VehicleForm = {
  title: '',
  type: 'carro',
  brand: '',
  model: '',
  year: new Date().getFullYear(),
  price: '',
  mileage: '',
  transmission: 'Automática',
  fuel: 'Gasolina',
  city: 'Yumbo',
  tag: 'recien_ingresado',
  status: 'disponible',
  internal_status: 'propio',
  listing_owner: 'jg',
  owner_name: '',
  owner_phone: '',
  image_urls: [],
};

const formatCOP = (value: unknown) => {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return '$0 COP';
  }

  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(number);
};

const normalizeText = (value: unknown) =>
  String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

const escapeHtml = (value: unknown) =>
  String(value ?? '').replace(/[&<>"']/g, (character: string): string => {
  const entities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };

  return entities[character] ?? character;
});

function escapeCSV(value: unknown) {
  return `"${String(value ?? '').replace(/"/g, '""')}"`;
}

const getVehicleTitle = (vehicle: Vehicle) =>
  vehicle.title ||
  `${vehicle.brand || ''} ${vehicle.model || ''}`.trim() ||
  'Vehículo sin título';

const getVehicleDate = (vehicle: Vehicle & { createdAt?: string }) =>
  vehicle.created_at || vehicle.createdAt || '';

const getImageUrls = (vehicle: {
  image_urls?: string[] | string | null;
  image_url?: string;
}): string[] => {
  if (Array.isArray(vehicle.image_urls)) {
    return vehicle.image_urls.filter(
      (url: unknown): url is string =>
        typeof url === 'string' && url.trim().length > 0,
    );
  }

  if (typeof vehicle.image_urls === 'string') {
    try {
      const parsed = JSON.parse(vehicle.image_urls);

      if (Array.isArray(parsed)) {
        return parsed.filter(
          (url): url is string =>
            typeof url === 'string' && url.trim().length > 0,
        );
      }
    } catch {
      if (vehicle.image_urls.trim()) {
        return [vehicle.image_urls.trim()];
      }
    }
  }

  if (typeof vehicle.image_url === 'string' && vehicle.image_url.trim()) {
    return [vehicle.image_url.trim()];
  }

  return [];
};

export function AdminPage({
  vehicles = [],
  loading = false,
  onRefresh,
  onLogout,
  onUpdateVehicleStatus,
  onDeleteVehicle,
  onAddVehicle,
  onUpdateVehicle,
  userEmail,
  stats,
}: AdminPageProps) {
  const [activeTab, setActiveTab] = useState<
    'requests' | 'inventory' | 'interests' | 'brochure'
  >('inventory');

  const [tagFilter, setTagFilter] = useState<'all' | VehicleTag>('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | VehicleStatus>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [brochureType, setBrochureType] =
    useState<VehicleType>('carro');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<VehicleForm>({ ...INITIAL_FORM });

  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [actionError, setActionError] = useState('');
  const [isUploadingPhotos, setIsUploadingPhotos] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /*
   * La autenticación debe gestionarse mediante Supabase Auth
   * y las políticas RLS de la base de datos.
   *
   * Este componente no considera una contraseña escrita en React
   * como una protección de seguridad.
   */

  const activeVehicles = useMemo(
    () => vehicles.filter((vehicle) => vehicle.status === 'disponible'),
    [vehicles],
  );

  const pendingVehicles = useMemo(
    () => vehicles.filter((vehicle) => vehicle.status === 'no_disponible'),
    [vehicles],
  );

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((vehicle) => {
      const normalizedTag = normalizeText(vehicle.tag || INITIAL_FORM.tag);
      const normalizedType = normalizeText(vehicle.type || 'carro');
      const normalizedStatus = normalizeText(vehicle.status);

      const search = normalizeText(searchTerm);

      const matchesSearch =
        !search ||
        [
          vehicle.title,
          vehicle.brand,
          vehicle.model,
          vehicle.year,
          vehicle.ciudad,
          vehicle.tag,
        ].some((value) => normalizeText(value).includes(search));

      const matchesTag =
        tagFilter === 'all' || normalizedTag === normalizeText(tagFilter);

      const matchesType =
        typeFilter === 'all' ||
        normalizedType === normalizeText(typeFilter);

      const matchesStatus =
        statusFilter === 'all' || normalizedStatus === statusFilter;

      return (
        matchesSearch &&
        matchesTag &&
        matchesType &&
        matchesStatus
      );
    });
  }, [
    vehicles,
    searchTerm,
    tagFilter,
    typeFilter,
    statusFilter,
  ]);

  const resetForm = () => {
    setForm({ ...INITIAL_FORM });
    setEditingId(null);
    setIsFormOpen(false);
    setFormError('');
    setFormSuccess('');
  };

  const openCreateForm = () => {
    setForm({ ...INITIAL_FORM });
    setEditingId(null);
    setFormError('');
    setFormSuccess('');
    setIsFormOpen(true);
  };

  const openEditForm = (vehicle: Vehicle) => {
    setForm({
      title: vehicle.title || getVehicleTitle(vehicle),
      type: normalizeText(vehicle.type) === 'moto' ? 'moto' : 'carro',
      brand: vehicle.brand || '',
      model: vehicle.model || '',
      year: Number(vehicle.year) || new Date().getFullYear(),
      price: String(vehicle.price ?? ''),
      mileage: String(vehicle.mileage ?? ''),
      transmission: vehicle.transmission || 'Automática',
      fuel: vehicle.fuel || 'Gasolina',
      city: vehicle.ciudad || 'Yumbo',
      tag: vehicle.tag || INITIAL_FORM.tag,
      status: vehicle.status || 'disponible',
      internal_status: (vehicle.internal_status as InternalStatus) || 'propio',
      listing_owner: vehicle.listing_owner === 'tercero' ? 'tercero' : 'jg',
      owner_name: vehicle.owner_name || '',
      owner_phone: vehicle.owner_phone || '',
      image_urls: getImageUrls(vehicle),
    });

    setEditingId(String(vehicle.id));
    setFormError('');
    setFormSuccess('');
    setIsFormOpen(true);
  };

  const updateForm = <K extends keyof VehicleForm>(
    field: K,
    value: VehicleForm[K],
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handlePhotoSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    if (files.length > MAX_VEHICLE_PHOTOS - form.image_urls.length) {
      setFormError(
        `Puedes subir hasta ${MAX_VEHICLE_PHOTOS} fotografías por vehículo.`,
      );
      event.target.value = '';
      return;
    }

    const invalidFile = files.find(
      (file) =>
        !ALLOWED_IMAGE_TYPES.includes(
          file.type as (typeof ALLOWED_IMAGE_TYPES)[number],
        ) || file.size > MAX_UPLOAD_BYTES,
    );
    if (invalidFile) {
      setFormError('Cada foto debe ser JPG, PNG o WebP y pesar máximo 10 MB.');
      event.target.value = '';
      return;
    }

    setFormError('');
    setIsUploadingPhotos(true);
    try {
      for (const file of files) {
        const url = await uploadVehiclePhoto(file);
        setForm((previous) => ({
          ...previous,
          image_urls: [...previous.image_urls, url],
        }));
      }
    } catch (error) {
      console.error('Error subiendo fotografías del vehículo:', error);
      setFormError(
        error instanceof Error
          ? `No se pudo subir la fotografía: ${error.message}`
          : 'No se pudo subir la fotografía. Revisa la conexión y los permisos de almacenamiento.',
      );
    } finally {
      setIsUploadingPhotos(false);
      event.target.value = '';
    }
  };

  const handleLogout = async () => {
    setActionError('');
    try {
      await onLogout();
    } catch (error) {
      console.error('Error cerrando sesión:', error);
      setActionError(
        error instanceof Error
          ? `No se pudo cerrar la sesión: ${error.message}`
          : 'No se pudo cerrar la sesión. Intenta nuevamente.',
      );
    }
  };

  const handleRefresh = async () => {
    setActionError('');
    try {
      await onRefresh();
    } catch (error) {
      console.error('Error actualizando inventario:', error);
      setActionError(
        error instanceof Error
          ? `No se pudo actualizar el inventario: ${error.message}`
          : 'No se pudo actualizar el inventario. Intenta nuevamente.',
      );
    }
  };

  const handleSaveVehicle = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setFormError('');
    setFormSuccess('');

    if (
      !form.title.trim() ||
      !form.brand.trim() ||
      !form.model.trim() ||
      !form.price.trim()
    ) {
      setFormError(
        'Completa el título, la marca, el modelo y el precio.',
      );
      return;
    }

    const price = Number(form.price);
    const year = Number(form.year);
    const mileage =
      form.mileage.trim() === '' ? null : Number(form.mileage);

    if (!Number.isFinite(price) || price <= 0) {
      setFormError('Ingresa un precio válido mayor que cero.');
      return;
    }

    if (
      !Number.isInteger(year) ||
      year < 1900 ||
      year > new Date().getFullYear() + 2
    ) {
      setFormError('Ingresa un año válido.');
      return;
    }

    if (
      mileage !== null &&
      (!Number.isFinite(mileage) || mileage < 0)
    ) {
      setFormError('El kilometraje debe ser un número válido.');
      return;
    }

    const vehicleData: VehicleAdminInput = {
      title: form.title.trim(),
      type: form.type,
      brand: form.brand.trim(),
      model: form.model.trim(),
      year,
      price,
      mileage,
      transmission: form.transmission,
      fuel: form.fuel,
      ciudad: form.city.trim() || 'Yumbo',
      tag: form.tag,
      status: form.status,
      internal_status: form.internal_status,
      consignado: form.internal_status === 'consignacion',
      listing_owner: form.listing_owner,
      owner_name: form.listing_owner === 'tercero' ? form.owner_name.trim() || null : null,
      owner_phone: form.listing_owner === 'tercero' ? form.owner_phone.trim() || null : null,
      image_urls: form.image_urls,
    };

    try {
      if (editingId) {
        await Promise.resolve(
          onUpdateVehicle(editingId, vehicleData),
        );
      } else {
        await Promise.resolve(onAddVehicle(vehicleData));
      }

      setFormSuccess(
        editingId
          ? 'Solicitud de actualización enviada.'
          : 'Solicitud de creación enviada.',
      );

      resetForm();
    } catch (error) {
      console.error('Error guardando vehículo:', error);

      setFormError(
        error instanceof Error
          ? `No fue posible guardar el vehículo: ${error.message}`
          : 'No fue posible guardar el vehículo. Verifica la conexión y los datos.',
      );
    }
  };

  const handleStatusChange = async (
    vehicle: Vehicle,
    status: VehicleStatus,
  ) => {
    setActionError('');

    try {
      await Promise.resolve(
        onUpdateVehicleStatus(String(vehicle.id), status),
      );
    } catch (error) {
      console.error('Error cambiando estado:', error);

      setActionError(
        error instanceof Error
          ? `No se pudo actualizar el estado: ${error.message}`
          : 'No se pudo actualizar el estado. Intenta nuevamente.',
      );
    }
  };

  const handleDelete = async (vehicle: Vehicle) => {
    const confirmed = window.confirm(
      `¿Seguro que deseas eliminar "${getVehicleTitle(vehicle)}"? Esta acción puede ser irreversible.`,
    );

    if (!confirmed) {
      return;
    }

    setActionError('');

    try {
      await Promise.resolve(onDeleteVehicle(String(vehicle.id)));
    } catch (error) {
      console.error('Error eliminando vehículo:', error);

      setActionError(
        error instanceof Error
          ? `No se pudo eliminar el vehículo: ${error.message}`
          : 'No se pudo eliminar el vehículo. Verifica los permisos de acceso.',
      );
    }
  };

  const handleExportCSV = () => {
    if (vehicles.length === 0) {
      window.alert('No hay vehículos para exportar.');
      return;
    }

    const headers = [
      'ID',
      'Título',
      'Tipo',
      'Marca',
      'Modelo',
      'Año',
      'Precio COP',
      'Kilometraje',
      'Transmisión',
      'Combustible',
      'Ciudad',
      'Etiqueta',
      'Estado',
      'Fecha de creación',
    ];

    const rows = vehicles.map((vehicle) => [
      vehicle.id,
      getVehicleTitle(vehicle),
      vehicle.type,
      vehicle.brand,
      vehicle.model,
      vehicle.year,
      vehicle.price,
      vehicle.mileage,
      vehicle.transmission,
      vehicle.fuel,
      vehicle.ciudad,
      vehicle.tag,
      vehicle.status,
      getVehicleDate(vehicle),
    ]);

    const csv = [
      headers.map(escapeCSV).join(';'),
      ...rows.map((row) => row.map(escapeCSV).join(';')),
    ].join('\r\n');

    // El BOM ayuda a Excel a interpretar correctamente los caracteres
    // acentuados en español.
    const blob = new Blob(['\uFEFF', csv], {
      type: 'text/csv;charset=utf-8;',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = 'inventario-jg-motors.csv';

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  };

  const handlePrintVehicle = (vehicle: Vehicle) => {
    const printWindow = window.open('', '_blank');

    if (!printWindow) {
      window.alert(
        'El navegador bloqueó la ventana. Permite las ventanas emergentes para imprimir.',
      );
      return;
    }

    const title = escapeHtml(getVehicleTitle(vehicle));

    const specs = [
      ['Tipo', vehicle.type || 'Carro'],
      ['Marca', vehicle.brand],
      ['Modelo', vehicle.model],
      ['Año', vehicle.year],
      ['Kilometraje', vehicle.mileage],
      ['Transmisión', vehicle.transmission],
      ['Combustible', vehicle.fuel],
      ['Ciudad', vehicle.ciudad || 'Yumbo'],
      ['Etiqueta comercial', vehicle.tag || INITIAL_FORM.tag],
      ['Estado', STATUS_LABELS[vehicle.status]],
    ];

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Ficha técnica - ${title}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            color: #111827;
            padding: 32px;
          }
          header {
            border-bottom: 3px solid #dc2626;
            padding-bottom: 16px;
            margin-bottom: 24px;
          }
          h1 { color: #dc2626; margin-bottom: 8px; }
          .grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 12px;
          }
          .item {
            background: #f3f4f6;
            border-radius: 8px;
            padding: 12px;
          }
          .label {
            display: block;
            color: #6b7280;
            font-size: 12px;
            margin-bottom: 4px;
          }
          .price {
            font-size: 25px;
            color: #15803d;
            font-weight: bold;
            margin-top: 24px;
          }
          footer {
            margin-top: 40px;
            border-top: 1px solid #ddd;
            padding-top: 16px;
            color: #6b7280;
            font-size: 12px;
          }
          @media print {
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <header>
          <h1>JG Motors &amp; ClickMotores</h1>
          <p>Ficha técnica del vehículo</p>
          <p>Fecha: ${escapeHtml(new Date().toLocaleDateString('es-CO'))}</p>
        </header>

        <h2>${title}</h2>

        <div class="grid">
          ${specs
            .map(
              ([label, value]) => `
                <div class="item">
                  <span class="label">${escapeHtml(label)}</span>
                  <strong>${escapeHtml(value ?? 'No registrado')}</strong>
                </div>
              `,
            )
            .join('')}
        </div>

        <div class="price">
          Precio: ${escapeHtml(formatCOP(vehicle.price))}
        </div>

        <footer>
          <p>JG Motors &amp; ClickMotores</p>
          <p>WhatsApp comercial: +57 333 276 5584</p>
          <p>Documento informativo. Las características deben verificarse antes de la compra.</p>
        </footer>
      </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();

    printWindow.onload = () => {
      printWindow.print();
    };
  };

  const handleGenerateBrochure = () => {
    const brochureVehicles = activeVehicles.filter((vehicle) => {
      const type = normalizeText(vehicle.type || 'carro');

      const isCorrectType =
        type === normalizeText(brochureType);

      return isCorrectType;
    });

    if (brochureVehicles.length === 0) {
      window.alert(
        `No hay ${brochureType === 'carro' ? 'carros' : 'motos'} publicados para generar el catálogo.`,
      );
      return;
    }

    const printWindow = window.open('', '_blank');

    if (!printWindow) {
      window.alert(
        'Permite las ventanas emergentes para generar el catálogo.',
      );
      return;
    }

    const cards = brochureVehicles
      .map((vehicle) => {
        const images = getImageUrls(vehicle);
        const firstImage = images[0];

        const imageHtml = firstImage
          ? `<img src="${escapeHtml(firstImage)}" alt="${escapeHtml(getVehicleTitle(vehicle))}" />`
          : `<div class="no-image">Fotografía no disponible</div>`;

        return `
          <article class="card">
            ${imageHtml}
            <div class="details">
              <span class="tag">${escapeHtml(vehicle.tag || INITIAL_FORM.tag)}</span>
              <h2>${escapeHtml(getVehicleTitle(vehicle))}</h2>
              <p>
                ${escapeHtml(vehicle.year || '')}
                · ${escapeHtml(vehicle.ciudad || 'Yumbo')}
              </p>
              <p>Transmisión: ${escapeHtml(vehicle.transmission || 'No especificada')}</p>
              <p>Combustible: ${escapeHtml(vehicle.fuel || 'No especificado')}</p>
              <p class="price">${escapeHtml(formatCOP(vehicle.price))}</p>
            </div>
          </article>
        `;
      })
      .join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Catálogo ${escapeHtml(brochureType)} - ClickMotores</title>
        <style>
          * { box-sizing: border-box; }
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 24px;
            color: #111827;
          }
          header {
            border-bottom: 3px solid #dc2626;
            padding-bottom: 16px;
            margin-bottom: 24px;
          }
          header h1 { color: #dc2626; margin: 0 0 8px; }
          .catalog {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 18px;
          }
          .card {
            border: 1px solid #d1d5db;
            border-radius: 10px;
            overflow: hidden;
            break-inside: avoid;
          }
          .card img {
            display: block;
            width: 100%;
            height: 190px;
            object-fit: cover;
          }
          .no-image {
            height: 120px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f3f4f6;
            color: #6b7280;
          }
          .details { padding: 14px; }
          .details h2 { font-size: 18px; margin: 8px 0; }
          .details p { font-size: 13px; margin: 7px 0; }
          .tag {
            display: inline-block;
            padding: 4px 8px;
            background: #fee2e2;
            color: #b91c1c;
            border-radius: 5px;
            font-size: 11px;
            text-transform: uppercase;
          }
          .price {
            font-size: 19px !important;
            color: #15803d;
            font-weight: bold;
          }
          footer {
            margin-top: 30px;
            padding-top: 16px;
            border-top: 1px solid #ddd;
            text-align: center;
            font-size: 12px;
          }
          @media print {
            body { padding: 10px; }
            .catalog { gap: 10px; }
          }
        </style>
      </head>
      <body>
        <header>
          <h1>JG Motors &amp; ClickMotores</h1>
          <p>Catálogo comercial de ${brochureType === 'carro' ? 'carros' : 'motocicletas'}</p>
          <p>Fecha: ${escapeHtml(new Date().toLocaleDateString('es-CO'))}</p>
        </header>

        <main class="catalog">${cards}</main>

        <footer>
          <p>WhatsApp comercial: +57 333 276 5584</p>
          <p>Los precios y la disponibilidad están sujetos a confirmación.</p>
        </footer>
      </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();

    printWindow.onload = () => {
      printWindow.print();
    };
  };

  const tabs = [
    { id: 'requests' as const, label: 'Leads y moderación', icon: Users },
    { id: 'inventory' as const, label: 'Inventario', icon: Car },
    { id: 'interests' as const, label: 'Interesados', icon: MessageSquare },
    { id: 'brochure' as const, label: 'Catálogos y fichas', icon: Printer },
  ];

  const statCards = [
    {
      label: 'Total de vehículos',
      value: vehicles.length,
      icon: Car,
    },
    {
      label: 'Disponibles',
      value: activeVehicles.length,
      icon: CheckCircle2,
    },
    {
      label: 'No disponibles',
      value: pendingVehicles.length,
      icon: RefreshCw,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-950 p-4 text-white sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col justify-between gap-4 rounded-2xl border border-gray-800 bg-gray-900 p-6 shadow-xl sm:flex-row sm:items-center">
          <div>
            <h1 className="flex items-center gap-3 text-2xl font-bold sm:text-3xl">
              <ShieldCheck className="h-8 w-8 text-jg-red" />
              Administración JG Motors
            </h1>
            <p className="mt-2 text-sm text-gray-400">
              Panel de control de ClickMotores
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {userEmail && (
              <span className="text-sm text-gray-400">{userEmail}</span>
            )}
            <button
              type="button"
              onClick={handleRefresh}
              className="flex items-center justify-center gap-2 rounded-lg bg-gray-800 px-4 py-3 text-sm font-medium transition hover:bg-gray-700"
            >
              <RefreshCw className="h-4 w-4" />
              Actualizar
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 rounded-lg bg-gray-800 px-4 py-3 text-sm font-medium transition hover:bg-gray-700"
            >
              <LogOut className="h-4 w-4" />
              Cerrar sesión
            </button>
            <button
              type="button"
              onClick={handleExportCSV}
              className="flex items-center justify-center gap-2 rounded-lg bg-green-700 px-4 py-3 text-sm font-medium transition hover:bg-green-600"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Exportar inventario
              <Download className="h-4 w-4" />
            </button>
          </div>
        </header>

        {actionError && (
          <div
            role="alert"
            className="mb-5 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300"
          >
            {actionError}
          </div>
        )}

        <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {statCards.map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="rounded-xl border border-gray-800 bg-gray-900 p-5"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">{label}</span>
                <Icon className="h-5 w-5 text-jg-red" />
              </div>

              <p className="mt-3 text-3xl font-bold">
                {value}
              </p>
            </div>
          ))}
        </section>

        {stats && (
          <p className="mb-4 text-xs text-gray-500">
            Los indicadores anteriores se calculan a partir de los vehículos
            recibidos por este componente.
          </p>
        )}

        <nav className="mb-6 flex flex-wrap gap-2 border-b border-gray-800">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition ${
                activeTab === id
                  ? 'border-jg-red text-white'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </nav>

        <main className="rounded-2xl border border-gray-800 bg-gray-900 p-4 shadow-xl sm:p-6">
          {activeTab === 'inventory' && (
            <section>
              <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-xl font-bold">
                    Inventario de vehículos
                  </h2>
                  <p className="mt-1 text-sm text-gray-400">
                    Consulta, registra y administra tus carros y motos.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={openCreateForm}
                  className="flex items-center justify-center gap-2 rounded-lg bg-jg-red px-4 py-3 text-sm font-medium hover:bg-red-700"
                >
                  <Plus className="h-4 w-4" />
                  Nuevo vehículo
                </button>
              </div>

              <div className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                  <input
                    type="search"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Buscar marca o modelo..."
                    className="w-full rounded-lg border border-gray-700 bg-gray-950 py-3 pl-10 pr-3 text-sm text-white outline-none focus:border-red-500"
                  />
                </div>

                <select
                  value={typeFilter}
                  onChange={(event) => setTypeFilter(event.target.value)}
                  className="rounded-lg border border-gray-700 bg-gray-950 px-3 py-3 text-sm text-white"
                >
                  <option value="all">Todos los tipos</option>
                  <option value="carro">Carros</option>
                  <option value="moto">Motocicletas</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(
                      event.target.value === 'all'
                        ? 'all'
                        : (event.target.value as VehicleStatus),
                    )
                  }
                  className="rounded-lg border border-gray-700 bg-gray-950 px-3 py-3 text-sm text-white"
                >
                  <option value="all">Todos los estados</option>
                  {VEHICLE_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {STATUS_LABELS[status]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-5 flex flex-wrap gap-2">
                {TAG_FILTERS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setTagFilter(tag)}
                    className={`rounded-lg px-3 py-2 text-xs font-medium uppercase transition ${
                      tagFilter === tag
                        ? 'bg-jg-red text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    {tag === 'all'
                      ? 'Todas las etiquetas'
                      : tag.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>

              {isFormOpen && (
                <form
                  onSubmit={handleSaveVehicle}
                  className="mb-8 rounded-xl border border-gray-700 bg-gray-950 p-5"
                >
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <h3 className="text-lg font-bold">
                      {editingId ? 'Editar vehículo' : 'Registrar vehículo'}
                    </h3>

                    <button
                      type="button"
                      onClick={resetForm}
                      disabled={isUploadingPhotos}
                      className="rounded-lg p-2 text-gray-400 hover:bg-gray-800 hover:text-white"
                      aria-label="Cerrar formulario"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  {formError && (
                    <p
                      role="alert"
                      className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300"
                    >
                      {formError}
                    </p>
                  )}

                  {formSuccess && (
                    <p className="mb-4 rounded-lg bg-green-500/10 p-3 text-sm text-green-300">
                      {formSuccess}
                    </p>
                  )}

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <label className="text-sm text-gray-300">
                      Título *
                      <input
                        value={form.title}
                        onChange={(event) =>
                          updateForm('title', event.target.value)
                        }
                        required
                        maxLength={150}
                        placeholder="Mazda 3 Touring"
                        className="mt-2 w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-3 text-white outline-none focus:border-red-500"
                      />
                    </label>

                    <label className="text-sm text-gray-300">
                      Tipo *
                      <select
                        value={form.type}
                        onChange={(event) =>
                          updateForm('type', event.target.value as VehicleType)
                        }
                        className="mt-2 w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-3 text-white"
                      >
                        <option value="carro">Carro</option>
                        <option value="moto">Motocicleta</option>
                      </select>
                    </label>

                    <label className="text-sm text-gray-300">
                      Marca *
                      <input
                        value={form.brand}
                        onChange={(event) =>
                          updateForm('brand', event.target.value)
                        }
                        required
                        maxLength={80}
                        className="mt-2 w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-3 text-white"
                      />
                    </label>

                    <label className="text-sm text-gray-300">
                      Modelo *
                      <input
                        value={form.model}
                        onChange={(event) =>
                          updateForm('model', event.target.value)
                        }
                        required
                        maxLength={100}
                        className="mt-2 w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-3 text-white"
                      />
                    </label>

                    <label className="text-sm text-gray-300">
                      Año *
                      <input
                        type="number"
                        value={form.year}
                        onChange={(event) =>
                          updateForm('year', Number(event.target.value))
                        }
                        min={1900}
                        max={new Date().getFullYear() + 2}
                        required
                        className="mt-2 w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-3 text-white"
                      />
                    </label>

                    <label className="text-sm text-gray-300">
                      Precio en COP *
                      <input
                        type="number"
                        value={form.price}
                        onChange={(event) =>
                          updateForm('price', event.target.value)
                        }
                        min={1}
                        step={1}
                        required
                        placeholder="75000000"
                        className="mt-2 w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-3 text-white"
                      />
                    </label>

                    <label className="text-sm text-gray-300">
                      Kilometraje
                      <input
                        type="number"
                        value={form.mileage}
                        onChange={(event) =>
                          updateForm('mileage', event.target.value)
                        }
                        min={0}
                        placeholder="45000"
                        className="mt-2 w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-3 text-white"
                      />
                    </label>

                    <label className="text-sm text-gray-300">
                      Transmisión
                      <select
                        value={form.transmission}
                        onChange={(event) =>
                          updateForm('transmission', event.target.value)
                        }
                        className="mt-2 w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-3 text-white"
                      >
                        <option>Automática</option>
                        <option>Mecánica</option>
                        <option>CVT</option>
                        <option>Otra</option>
                      </select>
                    </label>

                    <label className="text-sm text-gray-300">
                      Combustible
                      <select
                        value={form.fuel}
                        onChange={(event) =>
                          updateForm('fuel', event.target.value)
                        }
                        className="mt-2 w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-3 text-white"
                      >
                        <option>Gasolina</option>
                        <option>Diésel</option>
                        <option>Eléctrico</option>
                        <option>Híbrido</option>
                        <option>Gasolina / gas</option>
                        <option>Otro</option>
                      </select>
                    </label>

                    <label className="text-sm text-gray-300">
                      Ciudad
                      <input
                        value={form.city}
                        onChange={(event) =>
                          updateForm('city', event.target.value)
                        }
                        className="mt-2 w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-3 text-white"
                      />
                    </label>

                    <label className="text-sm text-gray-300">
                      Etiqueta comercial
                      <select
                        value={form.tag}
                        onChange={(event) =>
                          updateForm('tag', event.target.value as VehicleTag)
                        }
                        className="mt-2 w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-3 text-white"
                      >
                        {TAGS.map((tag) => (
                          <option key={tag} value={tag}>
                            {tag.replace(/_/g, ' ')}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="text-sm text-gray-300">
                      Estado de publicación
                      <select
                        value={form.status}
                        onChange={(event) =>
                          updateForm(
                            'status',
                            event.target.value as VehicleStatus,
                          )
                        }
                        className="mt-2 w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-3 text-white"
                      >
                        {VEHICLE_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {STATUS_LABELS[status]}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="text-sm text-gray-300">
                      Estado interno (solo visible para ti)
                      <select
                        value={form.internal_status}
                        onChange={(event) =>
                          updateForm(
                            'internal_status',
                            event.target.value as InternalStatus,
                          )
                        }
                        className="mt-2 w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-3 text-white"
                      >
                        {INTERNAL_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {INTERNAL_LABELS[s]}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="text-sm text-gray-300">
                      Dueño del aviso
                      <select
                        value={form.listing_owner}
                        onChange={(event) =>
                          updateForm('listing_owner', event.target.value as 'jg' | 'tercero')
                        }
                        className="mt-2 w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-3 text-white"
                      >
                        <option value="jg">JG Motors (propio, aliado o consignación) · sin vencimiento</option>
                        <option value="tercero">Tercero (publicación gratis) · vence a los 20 días</option>
                      </select>
                    </label>

                    {form.listing_owner === 'tercero' && (
                      <>
                        <label className="text-sm text-gray-300">
                          Nombre del propietario
                          <input
                            type="text"
                            value={form.owner_name}
                            onChange={(event) => updateForm('owner_name', event.target.value)}
                            placeholder="Nombre de quien publica"
                            className="mt-2 w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-3 text-white"
                          />
                        </label>
                        <label className="text-sm text-gray-300">
                          WhatsApp del propietario
                          <input
                            type="tel"
                            value={form.owner_phone}
                            onChange={(event) => updateForm('owner_phone', event.target.value)}
                            placeholder="Ej: 3001234567"
                            className="mt-2 w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-3 text-white"
                          />
                          <span className="mt-1 block text-xs text-gray-500">
                            Los interesados contactarán directamente a este número mientras el anuncio esté activo.
                          </span>
                        </label>
                      </>
                    )}

                    <label className="col-span-full text-sm text-gray-300">
                      Fotografías del vehículo
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept={ALLOWED_IMAGE_TYPES.join(',')}
                        multiple
                        onChange={handlePhotoSelect}
                        disabled={
                          isUploadingPhotos ||
                          form.image_urls.length >= MAX_VEHICLE_PHOTOS
                        }
                        className="sr-only"
                      />
                      <div className="mt-2 flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={
                            isUploadingPhotos ||
                            form.image_urls.length >= MAX_VEHICLE_PHOTOS
                          }
                          className="rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-sm text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isUploadingPhotos
                            ? 'Subiendo fotografías...'
                            : 'Seleccionar fotografías'}
                        </button>
                        <span className="text-xs text-gray-500">
                          JPG, PNG o WebP; máximo 10 MB cada una y{' '}
                          {MAX_VEHICLE_PHOTOS} por vehículo.
                        </span>
                      </div>
                      {form.image_urls.length > 0 && (
                        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                          {form.image_urls.map((url, index) => (
                            <div
                              key={`${url}-${index}`}
                              className="relative overflow-hidden rounded-lg border border-gray-700"
                            >
                              <img
                                src={url}
                                alt={`Fotografía ${index + 1} del vehículo`}
                                className="h-28 w-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  updateForm(
                                    'image_urls',
                                    form.image_urls.filter(
                                      (_, imageIndex) => imageIndex !== index,
                                    ),
                                  )
                                }
                                className="absolute right-2 top-2 rounded-full bg-black/70 p-1.5 text-white hover:bg-red-700"
                                aria-label={`Quitar fotografía ${index + 1}`}
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </label>
                  </div>

                  <div className="mt-5 flex flex-wrap justify-end gap-3">
                    <button
                      type="button"
                      onClick={resetForm}
                      disabled={isUploadingPhotos}
                      className="rounded-lg bg-gray-800 px-4 py-3 text-sm hover:bg-gray-700"
                    >
                      Cancelar
                    </button>

                    <button
                      type="submit"
                      disabled={isUploadingPhotos}
                      className="rounded-lg bg-jg-red px-5 py-3 text-sm font-bold hover:bg-red-700"
                    >
                      {isUploadingPhotos
                        ? 'Espera a que terminen las cargas'
                        : editingId
                          ? 'Guardar cambios'
                          : 'Registrar vehículo'}
                    </button>
                  </div>
                </form>
              )}

              {loading ? (
                <div className="flex justify-center py-16">
                  <Loader2 className="h-8 w-8 animate-spin text-jg-red" />
                </div>
              ) : filteredVehicles.length === 0 ? (
                <div className="py-16 text-center text-gray-400">
                  <Car className="mx-auto mb-3 h-10 w-10 opacity-50" />
                  <p>No se encontraron vehículos.</p>
                  <p className="mt-2 text-sm">
                    Prueba con otros filtros o registra un vehículo nuevo.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-gray-800">
                  <table className="w-full min-w-[950px] text-left">
                    <thead className="bg-gray-950 text-xs uppercase text-gray-400">
                      <tr>
                        <th className="px-4 py-4">Vehículo</th>
                        <th className="px-4 py-4">Tipo</th>
                        <th className="px-4 py-4">Precio</th>
                        <th className="px-4 py-4">Etiqueta</th>
                        <th className="px-4 py-4">Publicación</th>
                        <th className="px-4 py-4">Acciones</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-800 text-sm">
                      {filteredVehicles.map((vehicle) => (
                        <tr
                          key={vehicle.id}
                          className="transition hover:bg-gray-800/50"
                        >
                          <td className="px-4 py-4">
                            <div className="font-semibold">
                              {getVehicleTitle(vehicle)}
                            </div>
                            <div className="mt-1 text-xs text-gray-400">
                              {vehicle.year || 'Año sin registrar'} ·{' '}
                              {vehicle.ciudad || 'Ciudad sin registrar'}
                            </div>
                          </td>

                          <td className="px-4 py-4">
                            <span className="inline-flex items-center gap-2">
                              {normalizeText(vehicle.type) === 'moto' ? (
                                <Bike className="h-4 w-4 text-jg-red" />
                              ) : (
                                <Car className="h-4 w-4 text-jg-red" />
                              )}
                              {vehicle.type || 'carro'}
                            </span>
                          </td>

                          <td className="whitespace-nowrap px-4 py-4 font-semibold">
                            {formatCOP(vehicle.price)}
                          </td>

                          <td className="px-4 py-4">
                            <span className="rounded-full bg-gray-800 px-2.5 py-1 text-xs">
                              {String(vehicle.tag || INITIAL_FORM.tag).replace(
                                /_/g,
                                ' ',
                              )}
                            </span>
                          </td>

                          <td className="px-4 py-4">
                            {vehicle.status === 'disponible' ? (
                              <span className="inline-flex items-center gap-1 text-xs text-green-400">
                                <CheckCircle2 className="h-4 w-4" />
                                {STATUS_LABELS[vehicle.status]}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs text-yellow-400">
                                <RefreshCw className="h-4 w-4" />
                                {STATUS_LABELS[vehicle.status]}
                              </span>
                            )}
                            <span className="mt-1 block text-[11px] font-semibold uppercase text-blue-400">
                              🔒 {INTERNAL_LABELS[(vehicle.internal_status as InternalStatus) || 'propio']}
                            </span>
                            <ListingBadge vehicle={vehicle} onRenewed={onRefresh} />
                          </td>

                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                title="Editar"
                                aria-label="Editar vehículo"
                                onClick={() => openEditForm(vehicle)}
                                className="rounded-lg bg-blue-500/10 p-2 text-blue-400 hover:bg-blue-500/20"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>

                              <button
                                type="button"
                                title="Ficha técnica"
                                aria-label="Imprimir ficha técnica"
                                onClick={() => handlePrintVehicle(vehicle)}
                                className="rounded-lg bg-gray-800 p-2 text-gray-300 hover:bg-gray-700"
                              >
                                <FileText className="h-4 w-4" />
                              </button>

                              {vehicle.status !== 'disponible' ? (
                                <button
                                  type="button"
                                  title="Marcar disponible"
                                  aria-label="Marcar vehículo disponible"
                                  onClick={() =>
                                    handleStatusChange(vehicle, 'disponible')
                                  }
                                  className="rounded-lg bg-green-500/10 p-2 text-green-400 hover:bg-green-500/20"
                                >
                                  <CheckCircle2 className="h-4 w-4" />
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  title="Marcar no disponible"
                                  aria-label="Marcar vehículo no disponible"
                                  onClick={() =>
                                    handleStatusChange(
                                      vehicle,
                                      'no_disponible',
                                    )
                                  }
                                  className="rounded-lg bg-yellow-500/10 p-2 text-yellow-400 hover:bg-yellow-500/20"
                                >
                                  <XCircle className="h-4 w-4" />
                                </button>
                              )}

                              <button
                                type="button"
                                title="Eliminar"
                                aria-label="Eliminar vehículo"
                                onClick={() => handleDelete(vehicle)}
                                className="rounded-lg bg-red-500/10 p-2 text-red-400 hover:bg-red-500/20"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="border-t border-gray-800 px-4 py-3 text-xs text-gray-400">
                    Mostrando {filteredVehicles.length} de {vehicles.length}{' '}
                    vehículos.
                  </div>
                </div>
              )}
            </section>
          )}

          {activeTab === 'requests' && (
            <section>
              <div className="mb-6">
                <h2 className="text-xl font-bold">
                  Moderación de publicaciones
                </h2>
                <p className="mt-2 text-sm text-gray-400">
                  Revisa los vehículos pendientes y administra sus estados.
                  Esta sección muestra vehículos, no una tabla independiente
                  de leads de clientes.
                </p>
              </div>

              {loading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-jg-red" />
                </div>
              ) : vehicles.length === 0 ? (
                <p className="py-12 text-center text-gray-400">
                  No hay vehículos registrados.
                </p>
              ) : (
                <div className="space-y-3">
                  {vehicles.map((vehicle) => (
                    <article
                      key={vehicle.id}
                      className="flex flex-col justify-between gap-4 rounded-xl border border-gray-800 bg-gray-950 p-4 md:flex-row md:items-center"
                    >
                      <div>
                        <h3 className="font-semibold">
                          {getVehicleTitle(vehicle)}
                        </h3>
                        <p className="mt-1 text-sm text-gray-400">
                          {vehicle.year || 'Año sin registrar'} ·{' '}
                          {formatCOP(vehicle.price)}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          Estado: {STATUS_LABELS[vehicle.status]}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <a
                          href={`https://wa.me/573332765584?text=${encodeURIComponent(
                            `Hola, estoy interesado en ${getVehicleTitle(vehicle)}.`,
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 rounded-lg bg-green-700 px-3 py-2 text-xs font-medium hover:bg-green-600"
                        >
                          <MessageSquare className="h-4 w-4" />
                          WhatsApp
                        </a>

                        <button
                          type="button"
                          onClick={() => handlePrintVehicle(vehicle)}
                          className="flex items-center gap-2 rounded-lg bg-gray-800 px-3 py-2 text-xs hover:bg-gray-700"
                        >
                          <Printer className="h-4 w-4" />
                          Ficha
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleStatusChange(
                              vehicle,
                              vehicle.status === 'disponible'
                                ? 'no_disponible'
                                : 'disponible',
                            )
                          }
                          className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs ${
                            vehicle.status === 'disponible'
                              ? 'bg-yellow-500/10 text-yellow-400'
                              : 'bg-green-500/10 text-green-400'
                          }`}
                        >
                          {vehicle.status === 'disponible'
                            ? 'Marcar no disponible'
                            : 'Marcar disponible'}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(vehicle)}
                          className="rounded-lg bg-red-500/10 p-2 text-red-400 hover:bg-red-500/20"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          )}

          {activeTab === 'interests' && <BuyerInterestsPanel />}

          {activeTab === 'brochure' && (
            <section className="mx-auto max-w-2xl py-8 text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 text-jg-red">
                <Printer className="h-8 w-8" />
              </div>

              <h2 className="text-2xl font-bold">
                Catálogos comerciales
              </h2>

              <p className="mt-3 text-sm leading-6 text-gray-400">
                Genera una versión imprimible del inventario publicado,
                organizada por tipo de vehículo.
              </p>

              <div className="mt-7 flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setBrochureType('carro')}
                  className={`flex items-center gap-2 rounded-xl px-5 py-3 font-semibold ${
                    brochureType === 'carro'
                      ? 'bg-jg-red text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <Car className="h-5 w-5" />
                  Catálogo de carros
                </button>

                <button
                  type="button"
                  onClick={() => setBrochureType('moto')}
                  className={`flex items-center gap-2 rounded-xl px-5 py-3 font-semibold ${
                    brochureType === 'moto'
                      ? 'bg-jg-red text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <Bike className="h-5 w-5" />
                  Catálogo de motos
                </button>
              </div>

              <div className="mt-5 rounded-xl border border-gray-800 bg-gray-950 p-5">
                <p className="text-sm text-gray-400">
                  Vehículos publicados disponibles para el catálogo
                </p>

                <p className="mt-2 text-3xl font-bold">
                  {
                    activeVehicles.filter(
                      (vehicle) =>
                        normalizeText(vehicle.type || 'carro') ===
                        normalizeText(brochureType),
                    ).length
                  }
                </p>
              </div>

              <button
                type="button"
                onClick={handleGenerateBrochure}
                className="mt-6 flex w-full items-center justify-center gap-3 rounded-xl bg-white px-5 py-4 font-bold text-black transition hover:bg-gray-200"
              >
                <FileText className="h-5 w-5 text-red-600" />
                Generar e imprimir catálogo
              </button>

              <p className="mt-4 text-xs text-gray-500">
                En la ventana de impresión de tu navegador podrás seleccionar
                «Guardar como PDF».
              </p>
            </section>
          )}
        </main>

        <footer className="mt-6 text-center text-xs text-gray-500">
          JG Motors &amp; ClickMotores · Panel de administración
        </footer>
      </div>
    </div>
  );
}

export default AdminPage;