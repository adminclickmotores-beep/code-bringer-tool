// @ts-nocheck
import { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Trash2,
  Pencil,
  X,
  Search,
  Bike,
  Car,
  Star,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ImageIcon,
  Settings2,
  LogOut,
  ShieldCheck,
  Bell,
  Upload,
  Instagram,
  BarChart3,
  Users,
  FileDown,
  ThumbsUp,
  ThumbsDown,
  ChevronDown,
  DollarSign,
  TrendingUp,
} from 'lucide-react';
import {
  Vehicle,
  VehicleSubmission,
  Notification,
  Consulta,
  Sale,
  Lead,
  supabase,
  formatCOP,
  STATUS_CONFIG,
  TAG_CONFIG,
  whatsappLink,
  uploadVehiclePhoto,
} from '@/jg/lib/supabase';

interface AdminPageProps {
  vehicles: Vehicle[];
  loading: boolean;
  onRefresh: () => void;
  onLogout: () => void;
  userEmail: string;
  adminSection: string;
  onSectionChange: (section: string) => void;
  notifications: Notification[];
  onNotificationsRead: () => void;
}

const MAX_PHOTOS = 8;

const emptyForm = {
  title: '',
  type: 'moto' as 'moto' | 'carro',
  brand: '',
  model: '',
  year: new Date().getFullYear(),
  displacement: '',
  price: 0,
  original_price: null as number | null,
  status: 'disponible' as Vehicle['status'],
  description: '',
  image_urls: [] as string[],
  mileage: 0,
  transmission: '',
  fuel: 'Gasolina',
  featured: false,
  tag: null as Vehicle['tag'],
  instagram_url: '',
  consignado: false,
};

type FormState = typeof emptyForm;

const photoGuideMoto = ['Frente', 'Trasera', 'Perfil Izq.', 'Perfil Der.', 'Tablero', 'Sillín', 'Llantas/Exosto', 'Libre'];
const photoGuideCarro = ['Frente', 'Trasera', 'Perfil Izq.', 'Perfil Der.', 'Tablero', 'Cojinería', 'Llantas/Motor', 'Libre'];

export function AdminPage({
  vehicles,
  loading,
  onRefresh,
  onLogout,
  userEmail,
  adminSection,
  onSectionChange,
  notifications,
  onNotificationsRead,
}: AdminPageProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [submissions, setSubmissions] = useState<VehicleSubmission[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const handleExportVehicleRequests = () => {
    if (!vehicles || vehicles.length === 0) {
      alert('No hay solicitudes de vehículos para exportar.');
      return;
    }

    const headers = ['ID', 'Tipo', 'Marca', 'Modelo', 'Año', 'Placa', 'Ciudad', 'Contacto', 'Fecha'];
    
    const rows = vehicles.map((v: any) => [
      v.id || '',
      v.type || '',
      v.brand || '',
      v.model || '',
      v.year || '',
      v.plate || '',
      v.city || '',
      v.phone || '',
      v.createdAt || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row: string[]) => row.map((val) => `"${val}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `solicitudes-vehiculos-jgmotors.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const fileInputRef = useRef<HTMLInputElement>(null);

  const photoGuide = form.type === 'moto' ? photoGuideMoto : photoGuideCarro;
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  useEffect(() => {
    if (adminSection === 'submissions') loadSubmissions();
    if (adminSection === 'leads') loadLeads();
    if (adminSection === 'consultas') loadConsultas();
    if (adminSection === 'reportes') loadSales();
  }, [adminSection]);

  const loadSubmissions = async () => {
    const { data } = await supabase.from('vehicle_submissions').select('*').order('created_at', { ascending: false });
    if (data) setSubmissions(data as VehicleSubmission[]);
  };

  const loadLeads = async () => {
    const { data } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
    if (data) setLeads(data as Lead[]);
  };

  const handleLeadStatusChange = async (id: string, status: Lead['status']) => {
    try {
      const { error } = await supabase.from('leads').update({ status }).eq('id', id);
      if (error) throw error;
      loadLeads();
    } catch (err) {
      setNotification({ type: 'error', message: `Error: ${err instanceof Error ? err.message : 'desconocido'}` });
    }
  };

  const leadStatusConfig: Record<Lead['status'], { label: string; class: string }> = {
    nuevo_lead: { label: 'Nuevo Lead', class: 'border border-blue-500/30 bg-blue-500/15 text-blue-400' },
    en_negociacion: { label: 'En Negociación', class: 'border border-yellow-500/30 bg-yellow-500/15 text-yellow-400' },
    cita_inspeccion: { label: 'Cita / Inspección', class: 'border border-purple-500/30 bg-purple-500/15 text-purple-400' },
    aprobado: { label: 'Aprobado', class: 'border border-green-500/30 bg-green-500/15 text-green-400' },
    descartado: { label: 'Descartado', class: 'border border-jg-red/30 bg-jg-red/15 text-jg-red' },
  };

  const loadConsultas = async () => {
    const { data } = await supabase.from('consultas').select('*').order('created_at', { ascending: false });
    if (data) setConsultas(data as Consulta[]);
  };

const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remaining = MAX_PHOTOS - form.image_urls.length;
    const toUpload = Array.from(files).slice(0, remaining);
    if (toUpload.length === 0) return;

    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of toUpload) {
        const url = await uploadVehiclePhoto(file);
        if (url) urls.push(url);
      }
      setForm((prev) => ({ ...prev, image_urls: [...prev.image_urls, ...urls] }));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImageUrl = (url: string) => {
    setForm({ ...form, image_urls: form.image_urls.filter((u) => u !== url) });
  };
  
  const handleSave = async () => {
    if (!form.title || !form.brand || !form.model || !form.price) {
      setNotification({ type: 'error', message: 'Completa título, marca, modelo y precio.' });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: form.title,
        type: form.type,
        brand: form.brand,
        model: form.model,
        year: form.year,
        displacement: form.displacement || null,
        price: form.price,
        original_price: form.original_price,
        status: form.status,
        description: form.description || null,
        image_urls: form.image_urls,
        mileage: form.mileage || null,
        transmission: form.transmission || null,
        fuel: form.fuel || null,
        featured: form.featured,
        tag: form.tag,
        instagram_url: form.instagram_url || null,
        consignado: form.consignado,
      };

      if (editingId) {
        const { error } = await supabase.from('vehicles').update(payload).eq('id', editingId);
        if (error) throw error;
        setNotification({ type: 'success', message: 'Vehículo actualizado correctamente.' });
      } else {
        const { error } = await supabase.from('vehicles').insert(payload);
        if (error) throw error;
        setNotification({ type: 'success', message: 'Vehículo publicado correctamente.' });
      }
      resetForm();
      onRefresh();
    } catch (err) {
      setNotification({ type: 'error', message: `Error: ${err instanceof Error ? err.message : 'desconocido'}` });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setSaving(true);
    try {
      const { error } = await supabase.from('vehicles').delete().eq('id', id);
      if (error) throw error;
      setNotification({ type: 'success', message: 'Vehículo eliminado correctamente.' });
      setConfirmDelete(null);
      onRefresh();
    } catch (err) {
      setNotification({ type: 'error', message: `Error: ${err instanceof Error ? err.message : 'desconocido'}` });
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (id: string, status: Vehicle['status']) => {
    try {
      const { error } = await supabase.from('vehicles').update({ status }).eq('id', id);
      if (error) throw error;
      onRefresh();
    } catch (err) {
      setNotification({ type: 'error', message: `Error: ${err instanceof Error ? err.message : 'desconocido'}` });
    }
  };

  const toggleFeatured = async (id: string, featured: boolean) => {
    try {
      const { error } = await supabase.from('vehicles').update({ featured }).eq('id', id);
      if (error) throw error;
      onRefresh();
    } catch (err) {
      setNotification({ type: 'error', message: `Error: ${err instanceof Error ? err.message : 'desconocido'}` });
    }
  };

  const handleTagChange = async (id: string, tag: Vehicle['tag']) => {
    try {
      const { error } = await supabase.from('vehicles').update({ tag }).eq('id', id);
      if (error) throw error;
      onRefresh();
    } catch (err) {
      setNotification({ type: 'error', message: `Error: ${err instanceof Error ? err.message : 'desconocido'}` });
    }
  };

  const markAllRead = async () => {
    const unread = notifications.filter((n) => !n.is_read);
    for (const n of unread) {
      await supabase.from('notifications').update({ is_read: true }).eq('id', n.id);
    }
    onNotificationsRead();
  };

  const approveSubmission = async (sub: VehicleSubmission) => {
    const { error: insertError } = await supabase.from('vehicles').insert({
      title: `${sub.brand} ${sub.model}`,
      type: sub.vehicle_type,
      brand: sub.brand,
      model: sub.model,
      year: sub.year || new Date().getFullYear(),
      displacement: sub.displacement,
      price: sub.asking_price || 0,
      status: 'disponible',
      description: sub.description,
      image_urls: sub.image_urls,
      mileage: sub.mileage,
      featured: false,
      tag: 'recien_ingresado',
      instagram_url: sub.instagram_url,
      consignado: true,
    });
    if (insertError) {
      setNotification({ type: 'error', message: insertError.message });
      return;
    }
    await supabase.from('vehicle_submissions').update({ status: 'aprobado' }).eq('id', sub.id);
    setNotification({ type: 'success', message: 'Publicación aprobada y agregada al inventario.' });
    loadSubmissions();
    onRefresh();
  };

  const rejectSubmission = async (id: string) => {
    await supabase.from('vehicle_submissions').update({ status: 'rechazado' }).eq('id', id);
    setNotification({ type: 'success', message: 'Publicación rechazada.' });
    loadSubmissions();
  };

  const exportSalesCSV = () => {
    const headers = ['Vehículo', 'Tipo', 'Precio Venta', 'Comisión', 'Tasa Comisión', 'Ingresos Trámites', 'Ganancia Neta', 'Fecha'];
    const rows = sales.map((s) => [
      s.vehicle_title,
      s.sale_type,
      s.sale_price,
      s.commission_amount,
      s.commission_rate + '%',
      s.tramites_income,
      s.net_income,
      s.sale_date,
    ]);
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'reporte-jgmotors.csv';
    a.click();
  };

  const sectionTabs = [
    { id: 'inventario', label: 'Vehículos Públicos', icon: Settings2 },
    { id: 'submissions', label: 'Publicaciones', icon: Bell },
    { id: 'leads', label: 'CRM / Leads', icon: Users },
    { id: 'reportes', label: 'Reportes', icon: BarChart3 },
    { id: 'consultas', label: 'Consultas', icon: Users },
  ];

  const now = new Date();
  const monthSales = sales.filter((s) => new Date(s.sale_date).getMonth() === now.getMonth() && new Date(s.sale_date).getFullYear() === now.getFullYear());
  const totalCommission = monthSales.reduce((sum, s) => sum + s.commission_amount, 0);
  const totalTramites = monthSales.reduce((sum, s) => sum + s.tramites_income, 0);
  const totalNet = monthSales.reduce((sum, s) => sum + s.net_income, 0);

  const consultaTypeLabels: Record<Consulta['type'], string> = {
    whatsapp_click: 'Clic a WhatsApp',
    retoma: 'Solicitud de Retoma',
    cotizacion_tramite: 'Cotización de Trámite',
    cita: 'Cita Programada',
    cotizacion_seguro: 'Cotización de Seguro',
  };

  return (
    <div className="animate-fade-in min-h-screen">
      {/* Notification toast */}
      {notification && (
        <div className="fixed top-20 right-4 z-[70] animate-slide-down">
          <div
            className={`flex items-center gap-3 rounded-xl border px-4 py-3 shadow-2xl backdrop-blur-xl ${
              notification.type === 'success'
                ? 'border-green-500/30 bg-green-500/10 text-green-400'
                : 'border-jg-red/30 bg-jg-red/10 text-jg-red'
            }`}
          >
            {notification.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
            <span className="text-sm font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      <div className="border-b border-jg-silver/50 bg-jg-carbon/50 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Settings2 className="h-6 w-6 text-jg-red" />
                <h1 className="font-display text-3xl font-bold text-jg-text-dark">Panel de Control</h1>
              </div>
              <p className="mt-2 text-sm text-gray-600">Gestión de inventario público, publicaciones y CRM comercial</p>
            </div>
            <div className="flex flex-col items-end gap-3">
              <div className="flex items-center gap-2 rounded-lg border border-green-500/20 bg-green-500/5 px-3 py-2 text-xs">
                <ShieldCheck className="h-4 w-4 text-green-400" />
                <span className="text-gray-600">{userEmail}</span>
              </div>
              <div className="flex items-center gap-2">
                {/* Notifications bell */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowNotifications(!showNotifications);
                      if (unreadCount > 0) markAllRead();
                    }}
                    className="relative rounded-lg border border-jg-silver bg-jg-dark p-2 text-gray-600 transition-all hover:text-jg-text-dark"
                    title="Notificaciones"
                  >
                    <Bell className="h-4 w-4" />
                    {unreadCount > 0 && (
                      <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-jg-red text-[10px] font-bold text-white">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                  {showNotifications && (
                    <div className="absolute right-0 top-full mt-2 z-50 w-80 animate-slide-down rounded-xl border border-jg-silver bg-jg-carbon shadow-2xl">
                      <div className="border-b border-jg-silver/50 px-4 py-3">
                        <p className="font-display text-sm font-bold text-jg-text-dark">Notificaciones</p>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <p className="px-4 py-6 text-center text-xs text-gray-500">Sin notificaciones</p>
                        ) : (
                          notifications.slice(0, 10).map((n) => (
                            <div key={n.id} className="border-b border-jg-silver/30 px-4 py-3">
                              <p className="text-xs font-semibold text-jg-text-dark">{n.title}</p>
                              <p className="mt-0.5 text-xs text-gray-600">{n.message}</p>
                              <p className="mt-0.5 text-[10px] text-gray-600">{new Date(n.created_at).toLocaleString('es-CO')}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <button onClick={() => { resetForm(); setShowForm(true); }} className="btn-primary">
                  <Plus className="h-4 w-4" />
                  Nuevo Vehículo
                </button>
                <button onClick={onLogout} className="btn-secondary !py-2">
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Section tabs */}
          <div className="mt-6 flex gap-2 overflow-x-auto">
            {sectionTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onSectionChange(tab.id)}
                className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  adminSection === tab.id
                    ? 'bg-jg-red/10 text-jg-red border border-jg-red/30'
                    : 'border border-jg-silver text-gray-600 hover:text-jg-text-dark'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
                {tab.id === 'submissions' && unreadCount > 0 && (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-jg-red text-[10px] font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Stats — only on inventory section */}
          {adminSection === 'inventario' && (
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { label: 'Total', value: vehicles.length, color: 'text-jg-text-dark' },
                { label: 'Disponibles', value: vehicles.filter((v) => v.status === 'disponible').length, color: 'text-green-400' },
                { label: 'Vendidos', value: vehicles.filter((v) => v.status === 'vendido').length, color: 'text-gray-600' },
                { label: 'Destacados', value: vehicles.filter((v) => v.featured).length, color: 'text-jg-red' },
              ].map((stat) => (
                <div key={stat.label} className="card p-4">
                  <p className={`font-display text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* INVENTORY SECTION */}
        {adminSection === 'inventario' && (
          <>
            <div className="mb-6 relative">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar vehículo..." className="input-field pl-11" />
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-jg-red" />
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map((vehicle) => {
                  const status = STATUS_CONFIG[vehicle.status];
                  const image = vehicle.image_urls?.[0];
                  return (
                    <div key={vehicle.id} className="card flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                      <div className="flex flex-1 items-center gap-4">
                        <div className="h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-jg-dark">
                          {image ? (
                            <img src={image} alt={vehicle.title} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <ImageIcon className="h-6 w-6 text-gray-600" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`badge ${status.class}`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                              {status.label}
                            </span>
                            <span className="badge border border-jg-silver text-gray-600">
                              {vehicle.type === 'moto' ? <Bike className="h-3 w-3" /> : <Car className="h-3 w-3" />}
                              {vehicle.type === 'moto' ? 'Moto' : 'Carro'}
                            </span>
                            {vehicle.tag && (
                              <span className={`badge ${TAG_CONFIG[vehicle.tag].class}`}>
                                {TAG_CONFIG[vehicle.tag].label}
                              </span>
                            )}
                            {vehicle.consignado && (
                              <span className="badge border border-yellow-500/30 bg-yellow-500/10 text-yellow-400">
                                Consignado
                              </span>
                            )}
                          </div>
                          <h3 className="mt-1.5 truncate font-display text-sm font-bold text-jg-text-dark">{vehicle.title}</h3>
                          <p className="text-xs text-gray-500">{vehicle.brand} · {vehicle.model} · {vehicle.year}</p>
                          <p className="mt-0.5 text-sm font-semibold text-gradient">{formatCOP(vehicle.price)}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => toggleFeatured(vehicle.id, !vehicle.featured)}
                          className={`rounded-lg p-2 transition-all ${vehicle.featured ? 'bg-yellow-500/15 text-yellow-400 hover:bg-yellow-500/25' : 'bg-jg-dark text-gray-500 hover:text-yellow-400'}`}
                          title={vehicle.featured ? 'Quitar destacado' : 'Marcar destacado'}
                        >
                          <Star className={`h-4 w-4 ${vehicle.featured ? 'fill-current' : ''}`} />
                        </button>

                        <select
                          value={vehicle.tag || ''}
                          onChange={(e) => handleTagChange(vehicle.id, (e.target.value || null) as Vehicle['tag'])}
                          className="rounded-lg border border-jg-silver bg-jg-dark px-2 py-2 text-xs text-jg-text-dark focus:border-jg-red focus:outline-none"
                        >
                          <option value="">Sin etiqueta</option>
                          <option value="recien_ingresado">Recién Ingresado</option>
                          <option value="precio_rebajado">Precio Rebajado</option>
                          <option value="separado">Separado</option>
                        </select>

                        <select
                          value={vehicle.status}
                          onChange={(e) => handleStatusChange(vehicle.id, e.target.value as Vehicle['status'])}
                          className="rounded-lg border border-jg-silver bg-jg-dark px-3 py-2 text-xs text-jg-text-dark focus:border-jg-red focus:outline-none"
                        >
                          <option value="disponible">Disponible</option>
                          <option value="no_disponible">No disponible</option>
                          <option value="vendido">Vendido</option>
                          <option value="aliado">Aliado</option>
                        </select>

                        <button onClick={() => handleEdit(vehicle)} className="rounded-lg bg-jg-dark p-2 text-blue-400 transition-all hover:bg-blue-500/15" title="Editar">
                          <Pencil className="h-4 w-4" />
                        </button>

                        {confirmDelete === vehicle.id ? (
                          <div className="flex items-center gap-1.5 rounded-lg bg-jg-red/10 px-2 py-1">
                            <span className="text-xs text-jg-red">¿Seguro?</span>
                            <button onClick={() => handleDelete(vehicle.id)} className="rounded bg-jg-red px-2 py-1 text-xs font-bold text-white">Sí</button>
                            <button onClick={() => setConfirmDelete(null)} className="rounded bg-jg-silver px-2 py-1 text-xs font-bold text-gray-600">No</button>
                          </div>
                        ) : (
                          <button onClick={() => setConfirmDelete(vehicle.id)} className="rounded-lg bg-jg-dark p-2 text-jg-red transition-all hover:bg-jg-red/15" title="Eliminar">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* SUBMISSIONS SECTION */}
        {adminSection === 'submissions' && (
          <div className="space-y-3">
            {submissions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Bell className="mb-4 h-12 w-12 text-gray-600" />
                <p className="text-gray-600">No hay publicaciones pendientes.</p>
              </div>
            ) : (
              submissions.map((sub) => (
                <div key={sub.id} className="card p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`badge ${sub.status === 'pendiente' ? 'border border-yellow-500/30 bg-yellow-500/15 text-yellow-400' : sub.status === 'aprobado' ? 'border border-green-500/30 bg-green-500/15 text-green-400' : 'border border-jg-red/30 bg-jg-red/15 text-jg-red'}`}>
                          {sub.status === 'pendiente' ? 'Pendiente' : sub.status === 'aprobado' ? 'Aprobado' : 'Rechazado'}
                        </span>
                        <span className="badge border border-jg-silver text-gray-600">
                          {sub.vehicle_type === 'moto' ? <Bike className="h-3 w-3" /> : <Car className="h-3 w-3" />}
                          {sub.vehicle_type === 'moto' ? 'Moto' : 'Carro'}
                        </span>
                      </div>
                      <h3 className="mt-1.5 font-display text-sm font-bold text-jg-text-dark">{sub.brand} {sub.model} ({sub.year})</h3>
                      <p className="text-xs text-gray-500">
                        Cliente: {sub.name} · {sub.phone} · {sub.condition || 'Sin estado'}
                      </p>
                      {sub.asking_price && <p className="mt-0.5 text-sm font-semibold text-gradient">{formatCOP(sub.asking_price)}</p>}
                      {sub.description && <p className="mt-1 text-xs text-gray-600 line-clamp-2">{sub.description}</p>}
                      {sub.image_urls.length > 0 && (
                        <div className="mt-2 flex gap-1.5">
                          {sub.image_urls.slice(0, 4).map((url, idx) => (
                            <img key={idx} src={url} alt="" className="h-10 w-14 rounded object-cover" />
                          ))}
                          {sub.image_urls.length > 4 && <span className="text-xs text-gray-500 self-center">+{sub.image_urls.length - 4}</span>}
                        </div>
                      )}
                    </div>
                    {sub.status === 'pendiente' && (
                      <div className="flex items-center gap-2">
                        <button onClick={() => approveSubmission(sub)} className="rounded-lg bg-green-500/15 p-2 text-green-400 transition-all hover:bg-green-500/25" title="Aprobar">
                          <ThumbsUp className="h-4 w-4" />
                        </button>
                        <button onClick={() => rejectSubmission(sub.id)} className="rounded-lg bg-jg-red/15 p-2 text-jg-red transition-all hover:bg-jg-red/25" title="Rechazar">
                          <ThumbsDown className="h-4 w-4" />
                        </button>
                        <a
                          href={whatsappLink(`Hola ${sub.name}, sobre la publicación de tu ${sub.brand} ${sub.model} en ClickMotores.`)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-lg bg-jg-dark p-2 text-gray-600 transition-all hover:text-jg-text-dark"
                          title="Contactar por WhatsApp"
                        >
                          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c0-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884"/></svg>
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* CRM LEADS SECTION */}
        {adminSection === 'leads' && (
          <div className="space-y-3">
            {leads.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Users className="mb-4 h-12 w-12 text-gray-600" />
                <p className="text-gray-600">No hay leads comerciales registrados.</p>
              </div>
            ) : (
              leads.map((lead) => {
                const sc = leadStatusConfig[lead.status];
                return (
                  <div key={lead.id} className="card p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`badge ${sc.class}`}>{sc.label}</span>
                          <span className="badge border border-jg-silver text-gray-600">
                            {lead.vehicle_type === 'moto' ? <Bike className="h-3 w-3" /> : <Car className="h-3 w-3" />}
                            {lead.vehicle_type === 'moto' ? 'Moto' : 'Carro'}
                          </span>
                          <span className={`badge ${lead.mode === 'compra_directa' ? 'border border-green-500/30 bg-green-500/15 text-green-400' : 'border border-jg-red/30 bg-jg-red/15 text-jg-red'}`}>
                            {lead.mode === 'compra_directa' ? 'Compra Directa' : 'Consignación'}
                          </span>
                        </div>
                        <h3 className="mt-1.5 font-display text-sm font-bold text-jg-text-dark">{lead.brand} {lead.model} ({lead.year})</h3>
                        <p className="text-xs text-gray-500">
                          Cliente: {lead.name} · {lead.phone}{lead.email ? ` · ${lead.email}` : ''}
                        </p>
                        {lead.asking_price != null && lead.asking_price > 0 && (
                          <p className="mt-0.5 text-sm font-semibold text-gradient">{formatCOP(lead.asking_price)}</p>
                        )}
                        {lead.description && <p className="mt-1 text-xs text-gray-600 line-clamp-2">{lead.description}</p>}
                        {lead.image_urls.length > 0 && (
                          <div className="mt-2 flex gap-1.5">
                            {lead.image_urls.slice(0, 4).map((url, idx) => (
                              <img key={idx} src={url} alt="" className="h-10 w-14 rounded object-cover" />
                            ))}
                            {lead.image_urls.length > 4 && <span className="text-xs text-gray-500 self-center">+{lead.image_urls.length - 4}</span>}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <select
                          value={lead.status}
                          onChange={(e) => handleLeadStatusChange(lead.id, e.target.value as Lead['status'])}
                          className="rounded-lg border border-jg-silver bg-jg-dark px-3 py-2 text-xs text-jg-text-dark focus:border-jg-red focus:outline-none"
                        >
                          <option value="nuevo_lead">Nuevo Lead</option>
                          <option value="en_negociacion">En Negociación</option>
                          <option value="cita_inspeccion">Cita / Inspección</option>
                          <option value="aprobado">Aprobado</option>
                          <option value="descartado">Descartado</option>
                        </select>
                        <a
                          href={whatsappLink(`Hola ${lead.name}, sobre tu ${lead.mode === 'compra_directa' ? 'compra directa' : 'consignación'} de ${lead.brand} ${lead.model} en ClickMotores.`)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-lg bg-jg-dark p-2 text-gray-600 transition-all hover:text-jg-text-dark"
                          title="Contactar por WhatsApp"
                        >
                          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c0-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884"/></svg>
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* REPORTES SECTION */}
        {adminSection === 'reportes' && (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-display text-xl font-bold text-jg-text-dark">Estadísticas e Ingresos</h2>
              <button onClick={exportSalesCSV} className="btn-secondary !py-2">
                <FileDown className="h-4 w-4" />
                Exportar CSV
              </button>
            </div>

            <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
              {[
                { label: 'Ventas del Mes', value: formatCOP(monthSales.reduce((s, x) => s + x.sale_price, 0)), color: 'text-jg-text-dark', icon: DollarSign },
                { label: 'Comisiones Consignación', value: formatCOP(totalCommission), color: 'text-green-400', icon: TrendingUp },
                { label: 'Ingresos Trámites/Seguros', value: formatCOP(totalTramites), color: 'text-blue-400', icon: FileDown },
                { label: 'Ganancia Neta Total', value: formatCOP(totalNet), color: 'text-jg-red', icon: BarChart3 },
              ].map((stat) => (
                <div key={stat.label} className="card p-5">
                  <div className="mb-2 flex items-center gap-2">
                    <stat.icon className="h-4 w-4 text-gray-500" />
                    <p className="text-xs text-gray-500">{stat.label}</p>
                  </div>
                  <p className={`font-display text-xl font-bold ${stat.color}`}>{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="card overflow-hidden">
              <div className="border-b border-jg-silver/50 px-5 py-4">
                <h3 className="font-display text-base font-bold text-jg-text-dark">Historial de Ventas</h3>
              </div>
              {sales.length === 0 ? (
                <p className="px-5 py-10 text-center text-sm text-gray-500">No hay ventas registradas.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b border-jg-silver/50 text-xs text-gray-500">
                      <tr>
                        <th className="px-4 py-3 text-left">Vehículo</th>
                        <th className="px-4 py-3 text-left">Tipo</th>
                        <th className="px-4 py-3 text-right">Precio</th>
                        <th className="px-4 py-3 text-right">Comisión</th>
                        <th className="px-4 py-3 text-right">Trámites</th>
                        <th className="px-4 py-3 text-right">Ganancia</th>
                        <th className="px-4 py-3 text-left">Fecha</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sales.map((s) => (
                        <tr key={s.id} className="border-b border-jg-silver/30">
                          <td className="px-4 py-3 text-jg-text-dark">{s.vehicle_title}</td>
                          <td className="px-4 py-3 text-gray-600">{s.sale_type === 'directa' ? 'Directa' : 'Consignación'}</td>
                          <td className="px-4 py-3 text-right text-gray-600">{formatCOP(s.sale_price)}</td>
                          <td className="px-4 py-3 text-right text-green-400">{formatCOP(s.commission_amount)}</td>
                          <td className="px-4 py-3 text-right text-blue-400">{formatCOP(s.tramites_income)}</td>
                          <td className="px-4 py-3 text-right font-semibold text-gradient">{formatCOP(s.net_income)}</td>
                          <td className="px-4 py-3 text-gray-500">{new Date(s.sale_date).toLocaleDateString('es-CO')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* CONSULTAS SECTION */}
        {adminSection === 'consultas' && (
          <div>
            <h2 className="mb-6 font-display text-xl font-bold text-jg-text-dark">Consultas y Prospectos</h2>
            {consultas.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Users className="mb-4 h-12 w-12 text-gray-600" />
                <p className="text-gray-600">No hay consultas registradas.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {consultas.map((c) => (
                  <div key={c.id} className="card flex items-center justify-between p-4">
                    <div>
                      <span className="badge border border-jg-silver text-gray-600">{consultaTypeLabels[c.type]}</span>
                      {c.vehicle_title && <p className="mt-1.5 text-sm font-medium text-jg-text-dark">{c.vehicle_title}</p>}
                      {c.contact && <p className="text-xs text-gray-500">Contacto: {c.contact}</p>}
                      {c.notes && <p className="mt-0.5 text-xs text-gray-600">{c.notes}</p>}
                    </div>
                    <p className="text-xs text-gray-600">{new Date(c.created_at).toLocaleString('es-CO')}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-sm" onClick={resetForm}>
          <div className="relative my-8 w-full max-w-2xl animate-scale-in rounded-2xl border border-jg-silver bg-jg-carbon" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-2xl border-b border-jg-silver/50 bg-jg-carbon px-6 py-4">
              <h2 className="font-display text-xl font-bold text-jg-text-dark">{editingId ? 'Editar Vehículo' : 'Nuevo Vehículo'}</h2>
              <button onClick={resetForm} className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-jg-silver hover:text-jg-text-dark">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 p-6">
              {/* Title */}
              <div>
                <label className="label-field">Título *</label>
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Ej. Yamaha FZ 2.0" className="input-field" />
              </div>

              {/* Type + Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-field">Tipo *</label>
                  <div className="flex gap-2">
                    <button onClick={() => setForm({ ...form, type: 'moto' })} className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg border px-3 py-2.5 text-sm font-medium transition-all ${form.type === 'moto' ? 'border-jg-red bg-jg-red/10 text-jg-red' : 'border-jg-silver text-gray-400 hover:text-white'}`}>
                      <Bike className="h-4 w-4" /> Moto
                    </button>
                    <button onClick={() => setForm({ ...form, type: 'carro' })} className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg border px-3 py-2.5 text-sm font-medium transition-all ${form.type === 'carro' ? 'border-jg-red bg-jg-red/10 text-jg-red' : 'border-jg-silver text-gray-400 hover:text-white'}`}>
                      <Car className="h-4 w-4" /> Carro
                    </button>
                  </div>
                </div>
                <div>
                  <label className="label-field">Estado</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Vehicle['status'] })} className="select-field">
                    <option value="disponible">Disponible</option>
                    <option value="no_disponible">No disponible</option>
                    <option value="vendido">Vendido</option>
                    <option value="aliado">Aliado</option>
                  </select>
                </div>
              </div>

              {/* Brand + Model */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-field">Marca *</label>
                  <input type="text" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} placeholder="Ej. Yamaha" className="input-field" />
                </div>
                <div>
                  <label className="label-field">Modelo *</label>
                  <input type="text" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} placeholder="Ej. FZ 2.0" className="input-field" />
                </div>
              </div>

              {/* Year + Price */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-field">Año *</label>
                  <input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: parseInt(e.target.value) || 0 })} min="1990" max="2030" className="input-field" />
                </div>
                <div>
                  <label className="label-field">Precio (COP) *</label>
                  <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: parseInt(e.target.value) || 0 })} placeholder="Ej. 13500000" className="input-field" />
                </div>
              </div>

              {/* Displacement + Mileage */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-field">Cilindraje</label>
                  <input type="text" value={form.displacement} onChange={(e) => setForm({ ...form, displacement: e.target.value })} placeholder="Ej. 250cc" className="input-field" />
                </div>
                <div>
                  <label className="label-field">Kilometraje</label>
                  <input type="number" value={form.mileage} onChange={(e) => setForm({ ...form, mileage: parseInt(e.target.value) || 0 })} placeholder="Ej. 12000" className="input-field" />
                </div>
              </div>

              {/* Transmission + Fuel */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-field">Transmisión</label>
                  <input type="text" value={form.transmission} onChange={(e) => setForm({ ...form, transmission: e.target.value })} placeholder="Ej. Mecánica / Automática" className="input-field" />
                </div>
                <div>
                  <label className="label-field">Combustible</label>
                  <select value={form.fuel} onChange={(e) => setForm({ ...form, fuel: e.target.value })} className="select-field">
                    <option value="Gasolina">Gasolina</option>
                    <option value="Diesel">Diésel</option>
                    <option value="Híbrido">Híbrido</option>
                    <option value="Eléctrico">Eléctrico</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="label-field">Descripción</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe el vehículo, estado, características destacadas..." rows={3} className="input-field resize-none" />
              </div>

              {/* Tag + Instagram URL */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-field">Etiqueta visual</label>
                  <select value={form.tag || ''} onChange={(e) => setForm({ ...form, tag: (e.target.value || null) as Vehicle['tag'] })} className="select-field">
                    <option value="">Sin etiqueta</option>
                    <option value="recien_ingresado">Recién Ingresado</option>
                    <option value="precio_rebajado">Precio Rebajado</option>
                    <option value="separado">Separado</option>
                  </select>
                </div>
                <div>
                  <label className="label-field flex items-center gap-1.5">
                    <Instagram className="h-3.5 w-3.5" />
                    URL de Video/Reel Instagram
                  </label>
                  <input type="url" value={form.instagram_url} onChange={(e) => setForm({ ...form, instagram_url: e.target.value })} placeholder="https://www.instagram.com/reel/..." className="input-field" />
                </div>
              </div>

              {/* Consignado checkbox */}
              <div>
                <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-jg-silver/50 bg-jg-dark p-3">
                  <input type="checkbox" checked={form.consignado} onChange={(e) => setForm({ ...form, consignado: e.target.checked })} className="h-4 w-4 accent-jg-red" />
                  <span className="text-sm text-gray-600">Marcar como vehículo consignado (muestra aviso de ubicación y cita previa)</span>
                </label>
              </div>

              {/* Photo Upload with Guide */}
              <div>
                <label className="label-field">Fotos del vehículo (máximo {MAX_PHOTOS})</label>

                <div className="mb-3 rounded-lg border border-jg-silver/50 bg-jg-dark p-3">
                  <p className="mb-1.5 text-xs font-semibold text-gray-600">Guía de fotos ({form.type === 'moto' ? 'Moto' : 'Carro'}):</p>
                  <div className="grid grid-cols-2 gap-1 sm:grid-cols-4">
                    {photoGuide.map((label, idx) => {
                      const hasPhoto = idx < form.image_urls.length;
                      return (
                        <div key={idx} className={`flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] ${hasPhoto ? 'bg-green-500/10 text-green-400' : 'text-gray-500'}`}>
                          {hasPhoto ? <CheckCircle2 className="h-2.5 w-2.5 shrink-0" /> : <span className="font-bold text-gray-600">{idx + 1}.</span>}
                          <span className={hasPhoto ? 'line-through' : ''}>{label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <input ref={fileInputRef} type="file" accept="image/*" multiple max={MAX_PHOTOS} onChange={handleFileSelect} disabled={form.image_urls.length >= MAX_PHOTOS || uploading} className="hidden" />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={form.image_urls.length >= MAX_PHOTOS || uploading}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-jg-silver bg-jg-dark py-3 text-sm text-gray-600 transition-all hover:border-jg-red/50 hover:text-jg-text-dark disabled:opacity-50"
                >
                  {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
                  {form.image_urls.length >= MAX_PHOTOS ? `Máximo de ${MAX_PHOTOS} fotos` : `Subir fotos (${form.image_urls.length}/${MAX_PHOTOS})`}
                </button>

                {form.image_urls.length > 0 && (
                  <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {form.image_urls.map((url, idx) => (
                      <div key={idx} className="relative group">
                        <img src={url} alt="" className="h-20 w-full rounded-lg object-cover" />
                        <button type="button" onClick={() => removeImageUrl(url)} className="absolute right-1 top-1 rounded bg-jg-black/70 p-1 text-jg-red opacity-0 transition-opacity group-hover:opacity-100">
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Featured */}
              <div>
                <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-jg-silver/50 bg-jg-dark p-3">
                  <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="h-4 w-4 accent-jg-red" />
                  <span className="text-sm text-gray-600">Mostrar como destacado en la página principal</span>
                </label>
              </div>
            </div>

            <div className="sticky bottom-0 flex items-center justify-end gap-3 rounded-b-2xl border-t border-jg-silver/50 bg-jg-carbon px-6 py-4">
              <button onClick={resetForm} className="btn-ghost">Cancelar</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary disabled:opacity-50">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                {editingId ? 'Guardar cambios' : 'Publicar vehículo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
