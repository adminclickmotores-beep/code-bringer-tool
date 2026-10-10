import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  ShieldCheck, 
  Users, 
  FileSpreadsheet, 
  Loader2, 
  Car, 
  Bike,
  Lock,
  Mail,
  Key,
  FileText,
  Printer,
  CheckCircle2,
  XCircle,
  MessageSquare
} from 'lucide-react';

interface AdminPageProps {
  vehicles: any[];
  loading: boolean;
  onUpdateVehicleStatus: (id: string, status: string) => void;
  onDeleteVehicle: (id: string) => void;
  onAddVehicle: (vehicle: any) => void;
  onUpdateVehicle: (id: string, vehicle: any) => void;
  stats?: any;
}

export function AdminPage({ 
  vehicles = [], 
  loading = false, 
  onUpdateVehicleStatus, 
  onDeleteVehicle, 
  onAddVehicle, 
  onUpdateVehicle, 
  stats 
}: AdminPageProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  const [activeTab, setActiveTab] = useState<'requests' | 'inventory' | 'brochure'>('requests');
  const [tagFilter, setTagFilter] = useState<string>('all');
  const [brochureType, setBrochureType] = useState<'carro' | 'moto'>('carro');
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({
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
    tag: 'disponible',
    status: 'pending',
    image_urls: [] as string[]
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput === 'clientesjgmotors@gmail.com' && passwordInput === 'JGMotors2026!') {
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('Credenciales incorrectas. Acceso exclusivo para administradores.');
    }
  };

  const handleExportVehicleRequests = () => {
    if (!vehicles || vehicles.length === 0) {
      alert('No hay leads o solicitudes para exportar.');
      return;
    }

    const headers = ['ID', 'Tipo', 'Marca', 'Modelo', 'Año', 'Ciudad', 'Contacto', 'Estado', 'Fecha'];
    const rows = vehicles.map((v: any) => [
      v.id || '',
      v.type || '',
      v.brand || '',
      v.model || '',
      v.year || '',
      v.city || '',
      v.phone || '',
      v.status || '',
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
    link.setAttribute('download', `leads-inventario-jgmotors.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadTechnicalSheet = (vehicle: any) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Por favor permite ventanas emergentes.');
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Ficha Técnica - ${vehicle.brand} ${vehicle.model} | ClickMotores</title>
        <style>
          body { font-family: Arial, sans-serif; color: #111; padding: 40px; position: relative; }
          .watermark { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-30deg); font-size: 70px; color: rgba(220, 38, 38, 0.12); font-weight: bold; z-index: -1; pointer-events: none; text-transform: uppercase; }
          header { border-bottom: 3px solid #dc2626; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
          h1 { margin: 0; color: #dc2626; font-size: 26px; }
          .specs-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; background: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
          .spec-item { font-size: 15px; margin-bottom: 8px; }
          .spec-label { font-weight: bold; color: #555; }
          .price { font-size: 24px; font-weight: bold; color: #16a34a; margin-top: 20px; }
          footer { margin-top: 50px; text-align: center; font-size: 12px; color: #777; border-top: 1px solid #ddd; padding-top: 15px; }
        </style>
      </head>
      <body>
        <div class="watermark">CLICKMOTORES - OFICIAL</div>
        <header>
          <div><h1>ClickMotores / JG Motors</h1><p>Vitrina Digital Verificada en Colombia</p></div>
          <div><strong>Fecha:</strong> ${new Date().toLocaleDateString()}</div>
        </header>
        <h2>Ficha Técnica: ${vehicle.title || `${vehicle.brand}${vehicle.model}`}</h2>
        <div class="specs-grid">
          <div class="spec-item"><span class="spec-label">Tipo:</span> ${(vehicle.type || 'Carro').toUpperCase()}</div>
          <div class="spec-item"><span class="spec-label">Marca:</span> ${vehicle.brand}</div>
          <div class="spec-item"><span class="spec-label">Modelo:</span> ${vehicle.model}</div>
          <div class="spec-item"><span class="spec-label">Año:</span> ${vehicle.year}</div>
          <div class="spec-item"><span class="spec-label">Ciudad:</span> ${vehicle.city || 'Yumbo'}</div>
          <div class="spec-item"><span class="spec-label">Etiqueta:</span> ${(vehicle.tag || 'disponible').toUpperCase()}</div>
        </div>
        <div class="price">Precio: $ ${Number(vehicle.price || 0).toLocaleString()} COP</div>
        <footer>
          <p>Certificado emitido por JG Motors & ClickMotores · Traspaso legal garantizado.</p>
          <p>WhatsApp Asesoría: +57 333 276 5584 | www.clickmotores.com</p>
        </footer>
      </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 500);
  };

  const handleGenerateBrochurePDF = () => {
    const filteredVehicles = vehicles.filter(v => (v.type || 'carro').toLowerCase() === brochureType && v.status === 'active');
    if (filteredVehicles.length === 0) {
      alert(`No hay ${brochureType}s autorizados y disponibles para el catálogo.`);
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const brochureHtml = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Catálogo Comercial de ${brochureType.toUpperCase()}S | ClickMotores</title>
        <style>
          body { font-family: Arial, sans-serif; color: #111; padding: 30px; position: relative; }
          .watermark { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-30deg); font-size: 75px; color: rgba(220, 38, 38, 0.10); font-weight: bold; z-index: -1; pointer-events: none; text-transform: uppercase; }
          header { border-bottom: 3px solid #dc2626; padding-bottom: 15px; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: center; }
          h1 { margin: 0; color: #dc2626; font-size: 24px; }
          .card { border: 1px solid #ddd; border-radius: 8px; padding: 15px; margin-bottom: 20px; background: #fff; page-break-inside: avoid; }
          .title { font-size: 18px; font-weight: bold; margin-bottom: 6px; }
          .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; font-size: 14px; color: #555; margin-bottom: 8px; }
          .price { font-size: 16px; font-weight: bold; color: #16a34a; }
          .tag { display: inline-block; background: #fee2e2; color: #dc2626; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: bold; text-transform: uppercase; margin-bottom: 6px; }
        </style>
      </head>
      <body>
        <div class="watermark">CLICKMOTORES - OFICIAL</div>
        <header>
          <div><h1>Catálogo Oficial - JG Motors & ClickMotores</h1><p>Inventario verificado de ${brochureType}s</p></div>
          <div><strong>Fecha:</strong> ${new Date().toLocaleDateString()}</div>
        </header>
        ${filteredVehicles.map(v => `
          <div class="card">
            <span class="tag">${v.tag || 'disponible'}</span>
            <div class="title">${v.title || `${v.brand} ${v.model}`}</div>
            <div class="grid">
              <div><strong>Marca:</strong> ${v.brand}</div>
              <div><strong>Modelo:</strong> ${v.model}</div>
              <div><strong>Año:</strong> ${v.year}</div>
              <div><strong>Ciudad:</strong> ${v.city \vert{}\vert{} 'Yumbo'}</div>             </div>             <div class="price">Precio: $ ${Number(v.price || 0).toLocaleString()} COP</div>
          </div>
        `).join('')}
        <footer><p style="text-align:center; font-size:12px; color:#777; margin-top:30px;">WhatsApp Ventas: +57 333 276 5584 · www.clickmotores.com</p></footer>
      </body>
      </html>
    `;
    printWindow.document.write(brochureHtml);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 500);
  };

  const handleSaveVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.brand || !form.model || !form.price) {
      alert('Completa los campos obligatorios.');
      return;
    }
    if (isEditing && editingId) {
      onUpdateVehicle(editingId, form);
    } else {
      onAddVehicle(form);
    }
    setForm({
      title: '', type: 'carro', brand: '', model: '', year: new Date().getFullYear(),
      price: '', mileage: '', transmission: 'Automática', fuel: 'Gasolina', city: 'Yumbo',
      tag: 'disponible', status: 'pending', image_urls: []
    });
    setIsEditing(false);
    setEditingId(null);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 max-w-md w-full shadow-2xl">
          <div className="text-center mb-8">
            <div className="bg-jg-red/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-jg-red">
              <Lock className="h-8 w-8" />
            </div>
            <h1 className="text-2xl font-bold text-white">Panel Administrativo</h1>
            <p className="text-gray-400 text-sm mt-1">JG Motors & ClickMotores</p>
          </div>

          {loginError && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg text-sm mb-6 text-center">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Correo de Administrador</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="clientesjgmotors@gmail.com"
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-jg-red"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Contraseña</label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-jg-red"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-jg-red hover:bg-red-700 text-white font-medium py-2.5 rounded-lg transition-colors mt-2"
            >
              Ingresar al Panel
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 bg-gray-900 p-6 rounded-2xl border border-gray-800 shadow-xl">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
              <ShieldCheck className="h-8 w-8 text-jg-red" />
              Administración General JG Motors
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Administrador Principal: <span className="text-white font-medium">clientesjgmotors@gmail.com</span>
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleExportVehicleRequests}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg"
            >
              <FileSpreadsheet className="h-4 w-4" />
              [Exportar a Excel (.csv)]
            </button>
            <button
              type="button"
              onClick={() => setIsAuthenticated(false)}
              className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 border-b border-gray-800 mb-6">
          <button
            onClick={() => setActiveTab('requests')}
            className={`pb-3 px-4 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === 'requests' ? 'border-jg-red text-white' : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Users className="h-4 w-4" />
            Leads y Moderación
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`pb-3 px-4 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === 'inventory' ? 'border-jg-red text-white' : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Car className="h-4 w-4" />
            Inventario y Etiquetas
          </button>
          <button
            onClick={() => setActiveTab('brochure')}
            className={`pb-3 px-4 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === 'brochure' ? 'border-jg-red text-white' : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Printer className="h-4 w-4" />
            Catálogos y Fichas PDF
          </button>
        </div>

        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 shadow-xl">
          {activeTab === 'requests' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Solicitudes, Leads y Autorización de Clasificados</h2>
              </div>
              {loading ? (
                <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-jg-red" /></div>
              ) : vehicles.length === 0 ? (
                <div className="text-center py-12 text-gray-400"><p>No hay registros actuales.</p></div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-800 text-gray-400 text-sm">
                        <th className="py-3 px-4">Tipo</th>
                        <th className="py-3 px-4">Vehículo</th>
                        <th className="py-3 px-4">Año</th>
                        <th className="py-3 px-4">Estado Publicación</th>
                        <th className="py-3 px-4">WhatsApp Leads</th>
                        <th className="py-3 px-4">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800 text-sm">
                      {vehicles.map((v) => (
                        <tr key={v.id} className="hover:bg-gray-800/50 transition-colors">
                          <td className="py-3 px-4 uppercase font-semibold text-xs text-jg-red">{v.type || 'Carro'}</td>
                          <td className="py-3 px-4 font-medium">{v.brand} {v.model}</td>
                          <td className="py-3 px-4 text-gray-300">{v.year}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                              v.status === 'active' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'
                            }`}>
                              {v.status === 'active' ? 'Autorizado' : 'Pendiente Revisión'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <a
                              href={`https://wa.me/573332765584?text=Hola%20ClickMotores,%20estoy%20interesado%20en%20el%20vehículo%20${v.brand}%20${v.model}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-green-400 hover:text-green-300 flex items-center gap-1 text-xs bg-green-500/10 border border-green-500/20 px-2.5 py-1.5 rounded w-fit"
                            >
                              <MessageSquare className="h-3.5 w-3.5" /> Atender lead
                            </a>
                          </td>
                          <td className="py-3 px-4 flex items-center gap-2">
                            {v.status !== 'active' ? (
                              <button
                                onClick={() => onUpdateVehicleStatus(v.id, 'active')}
                                className="text-green-400 hover:text-green-300 bg-green-500/10 px-2.5 py-1 rounded text-xs flex items-center gap-1"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" /> Autorizar
                              </button>
                            ) : (
                              <button
                                onClick={() => onUpdateVehicleStatus(v.id, 'pending')}
                                className="text-yellow-400 hover:text-yellow-300 bg-yellow-500/10 px-2.5 py-1 rounded text-xs flex items-center gap-1"
                              >
                                <XCircle className="h-3.5 w-3.5" /> Desautorizar
                              </button>
                            )}
                            <button
                              onClick={() => handleDownloadTechnicalSheet(v)}
                              className="text-blue-400 hover:text-blue-300 p-1"
                              title="Descargar Ficha PDF"
                            >
                              <FileText className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => onDeleteVehicle(v.id)}
                              className="text-red-400 hover:text-red-300 p-1"
                              title="Borrar"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'inventory' && (
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h2 className="text-xl font-bold">Inventario de Vehículos y Etiquetas</h2>
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 bg-jg-red hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <Plus className="h-4 w-4" /> Crear Nuevo Vehículo
                </button>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {['all', 'destacado', 'bajo_de_precio', 'disponible', 'no_disponible', 'reservado', 'nueva_publicacion', 'propio', 'consignacion', 'de_aliado', 'proximo_ingreso', 'vendido'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setTagFilter(tag)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium uppercase transition-colors ${
                      tagFilter === tag ? 'bg-jg-red text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    {tag.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>

              {isEditing && (
                <form onSubmit={handleSaveVehicle} className="bg-gray-950 p-6 rounded-xl border border-gray-800 mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <h3 className="col-span-full text-lg font-semibold text-white mb-2">Registrar o Editar Vehículo en Vitrina</h3>
                  
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Título</label>
                    <input
                      type="text"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      placeholder="Ej: Mazda 3 Touring"
                      className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Tipo</label>
                    <select
                      value={form.type}
                      onChange={(e) => setForm({ ...form, type: e.target.value })}
                      className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white"
                    >
                      <option value="carro">Carro</option>
                      <option value="moto">Moto</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Marca</label>
                    <input
                      type="text"
                      value={form.brand}
                      onChange={(e) => setForm({ ...form, brand: e.target.value })}
                      placeholder="Ej: Mazda"
                      className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Modelo</label>
                    <input
                      type="text"
                      value={form.model}
                      onChange={(e) => setForm({ ...form, model: e.target.value })}
                      placeholder="Ej: 3"
                      className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Año</label>
                    <input
                      type="number"
                      value={form.year}
                      onChange={(e) => setForm({ ...form, year: Number(e.target.value) })}
                      className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Precio (COP)</label>
                    <input
                      type="text"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                      placeholder="Ej: 75000000"
                      className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Etiqueta del Clasificado</label>
                    <select
                      value={form.tag}
                      onChange={(e) => setForm({ ...form, tag: e.target.value })}
                      className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white uppercase"
                    >
                      <option value="destacado">Destacado</option>
                      <option value="bajo_de_precio">Bajo de precio</option>
                      <option value="disponible">Disponible</option>
                      <option value="no_disponible">No disponible</option>
                      <option value="reservado">Reservado</option>
                      <option value="nueva_publicacion">Nueva publicación</option>
                      <option value="propio">Propio</option>
                      <option value="consignacion">Consignación</option>
                      <option value="de_aliado">De aliado</option>
                      <option value="proximo_ingreso">Próximo ingreso</option>
                      <option value="vendido">Vendido</option>
                    </select>
                  </div>

                  <div className="col-span-full flex justify-end gap-3 mt-2">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg text-sm hover:bg-gray-700"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-jg-red hover:bg-red-700 text-white rounded-lg text-sm font-medium"
                    >
                      Guardar Vehículo
                    </button>
                  </div>
                </form>
              )}

              <div className="text-gray-400 text-sm py-4">
                <p>Total de vehículos en base de datos: {vehicles.length}</p>
              </div>
            </div>
          )}

          {activeTab === 'brochure' && (
            <div className="max-w-xl mx-auto text-center py-8">
              <div className="bg-jg-red/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-jg-red">
                <Printer className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Generar Catálogo Completo (Brochure PDF)</h2>
              <p className="text-gray-400 text-sm mb-6">
                Crea un brochure corporativo con marca de agua oficial de <strong>ClickMotores</strong> con todos los vehículos publicados y autorizados.
              </p>

              <div className="flex justify-center gap-4 mb-6">
                <button
                  type="button"
                  onClick={() => setBrochureType('carro')}
                  className={`px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${
                    brochureType === 'carro' ? 'bg-jg-red text-white shadow-lg' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <Car className="h-4 w-4" /> Catálogo de Carros
                </button>
                <button
                  type="button"
                  onClick={() => setBrochureType('moto')}
                  className={`px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${
                    brochureType === 'moto' ? 'bg-jg-red text-white shadow-lg' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <Bike className="h-4 w-4" /> Catálogo de Motos
                </button>
              </div>

              <button
                type="button"
                onClick={handleGenerateBrochurePDF}
                className="w-full bg-white hover:bg-gray-100 text-black font-bold py-3.5 rounded-xl transition-colors shadow-xl flex items-center justify-center gap-2"
              >
                <FileText className="h-5 w-5 text-jg-red" />
                Descargar / Imprimir Catálogo de {brochureType.toUpperCase()}S
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}