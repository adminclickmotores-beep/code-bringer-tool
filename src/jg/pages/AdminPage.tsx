import React, { useState, useRef } from 'react';
import { 
  Plus, 
  Trash2, 
  Settings as SettingsIcon, 
  LogOut, 
  ShieldCheck, 
  Bell, 
  Upload, 
  Instagram, 
  BarChart3, 
  Users, 
  FileSpreadsheet, 
  Star, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ImageIcon, 
  Search, 
  Bike, 
  Car, 
  Pencil, 
  X 
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
  const [activeTab, setActiveTab] = useState<'requests' | 'inventory' | 'stats'>('requests');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [tagFilter, setTagFilter] = useState<string>('all');
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Estado para formulario de vehículos / inventario
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
    tag: 'propio', // propio, retoma, aliado, consignacion, vendido, reservado, proximo_ingreso, pendiente
    status: 'active', // active, pending, sold
    image_urls: [] as string[]
  });

  // Función para exportar solicitudes a CSV
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

  const handleSaveVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.brand || !form.model || !form.price) {
      alert('Por favor completa los campos obligatorios (Título, Marca, Modelo y Precio).');
      return;
    }

    if (isEditing && editingId) {
      onUpdateVehicle(editingId, form);
    } else {
      onAddVehicle(form);
    }

    // Resetear formulario
    setForm({
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
      tag: 'propio',
      status: 'active',
      image_urls: []
    });
    setIsEditing(false);
    setEditingId(null);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Cabecera del Panel */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 bg-gray-900 p-6 rounded-2xl border border-gray-800 shadow-xl">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-white flex items-center gap-3">
              <ShieldCheck className="h-8 w-8 text-jg-red" />
              Panel Administrativo JG Motors
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Vitrina virtual, control de inventario, etiquetas y solicitudes de clientes.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleExportVehicleRequests}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg"
            >
              <FileSpreadsheet className="h-4 w-4" />
              [Exportar a Excel (.csv)]
            </button>
          </div>
        </div>

        {/* Pestañas de Navegación */}
        <div className="flex flex-wrap gap-2 border-b border-gray-800 mb-6">
          <button
            onClick={() => setActiveTab('requests')}
            className={`pb-3 px-4 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === 'requests'
                ? 'border-jg-red text-white'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Users className="h-4 w-4" />
            Solicitudes / Leads
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`pb-3 px-4 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === 'inventory'
                ? 'border-jg-red text-white'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Car className="h-4 w-4" />
            Inventario y Etiquetas
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`pb-3 px-4 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === 'stats'
                ? 'border-jg-red text-white'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            Estadísticas
          </button>
        </div>

        {/* Contenido Principal */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 shadow-xl">
          
          {/* PESTAÑA 1: SOLICITUDES */}
          {activeTab === 'requests' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Solicitudes de Compra / Consignación Recibidas</h2>
              </div>
              {loading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-jg-red" />
                </div>
              ) : vehicles.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <p>No hay solicitudes registradas actualmente.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-800 text-gray-400 text-sm">
                        <th className="py-3 px-4">Tipo</th>
                        <th className="py-3 px-4">Vehículo</th>
                        <th className="py-3 px-4">Año</th>
                        <th className="py-3 px-4">Ciudad</th>
                        <th className="py-3 px-4">Contacto</th>
                        <th className="py-3 px-4">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800 text-sm">
                      {vehicles.map((v) => (
                        <tr key={v.id} className="hover:bg-gray-800/50 transition-colors">
                          <td className="py-3 px-4 uppercase font-semibold text-xs text-jg-red">{v.type || 'Carro'}</td>
                          <td className="py-3 px-4 font-medium">{v.brand} {v.model}</td>
                          <td className="py-3 px-4 text-gray-300">{v.year}</td>
                          <td className="py-3 px-4 text-gray-300">{v.city || 'N/A'}</td>
                          <td className="py-3 px-4 text-gray-300">{v.phone || 'N/A'}</td>
                          <td className="py-3 px-4 flex items-center gap-2">
                            <button
                              onClick={() => onDeleteVehicle(v.id)}
                              className="text-red-400 hover:text-red-300 transition-colors p-1"
                              title="Eliminar solicitud"
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

          {/* PESTAÑA 2: INVENTARIO Y ETIQUETAS */}
          {activeTab === 'inventory' && (
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h2 className="text-xl font-bold">Gestión de Inventario y Etiquetas</h2>
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 bg-jg-red hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <Plus className="h-4 w-4" /> Agregar Vehículo
                </button>
              </div>

              {/* Filtro de Etiquetas */}
              <div className="flex flex-wrap gap-2 mb-6">
                {['all', 'propio', 'retoma', 'aliado', 'consignacion', 'vendido', 'reservado', 'proximo_ingreso', 'pendiente'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setTagFilter(tag)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium uppercase transition-colors ${
                      tagFilter === tag ? 'bg-jg-red text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    {tag.replace('_', ' ')}
                  </button>
                ))}
              </div>

              {/* Formulario rápido para crear/editar */}
              {isEditing && (
                onSubmitForm => (
                  // Formulario modal o colapsable de creación
                  null
                )
              )(null) || (
                <form onSubmit={handleSaveVehicle} className="bg-gray-950 p-6 rounded-xl border border-gray-800 mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <h3 className="col-span-full text-lg font-semibold text-white mb-2">
                    {isEditing && editingId ? 'Editar Vehículo' : 'Registrar Nuevo Vehículo en Inventario'}
                  </h3>
                  
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Título</label>
                    <input
                      type="text"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      placeholder="Ej: Mazda 3 Grand Touring"
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
                    <label className="block text-xs text-gray-400 mb-1">Etiqueta / Estado del Vehículo</label>
                    <select
                      value={form.tag}
                      onChange={(e) => setForm({ ...form, tag: e.target.value })}
                      className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white uppercase"
                    >
                      <option value="propio">Propio</option>
                      <option value="retoma">Retoma</option>
                      <option value="aliado">Aliado</option>
                      <option value="consignacion">Consignación</option>
                      <option value="vendido">Vendido</option>
                      <option value="reservado">Reservado</option>
                      <option value="proximo_ingreso">Próximo Ingreso</option>
                      <option value="pendiente">Pendiente</option>
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

          {/* PESTAÑA 3: ESTADÍSTICAS */}
          {activeTab === 'stats' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-gray-950 p-6 rounded-xl border border-gray-800">
                <p className="text-gray-400 text-sm">Total Solicitudes</p>
                <h3 className="text-3xl font-bold text-white mt-2">{vehicles.length}</h3>
              </div>
              <div className="bg-gray-950 p-6 rounded-xl border border-gray-800">
                <p className="text-gray-400 text-sm">Vehículos Activos</p>
                <h3 className="text-3xl font-bold text-jg-red mt-2">{vehicles.filter(v => v.status === 'active').length}</h3>
              </div>
              <div className="bg-gray-950 p-6 rounded-xl border border-gray-800">
                <p className="text-gray-400 text-sm">Cobertura Nacional</p>
                <h3 className="text-3xl font-bold text-green-500 mt-2">Colombia</h3>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}