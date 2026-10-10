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
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Función para exportar las solicitudes a formato CSV compatible con Excel
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
              Gestiona solicitudes, inventario y reportes de la vitrina virtual.
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
        <div className="flex gap-2 border-b border-gray-800 mb-6">
          <button
            onClick={() => setActiveTab('requests')}
            className={`pb-3 px-4 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === 'requests'
                ? 'border-jg-red text-white'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Users className="h-4 w-4" />
            Solicitudes de Vehículos
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
            Inventario General
          </button>
        </div>

        {/* Contenido Principal según Pestaña */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 shadow-xl">
          {activeTab === 'requests' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Listado de Solicitudes Recibidas</h2>
              </div>
              {loading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-jg-red" />
                </div>
              ) : vehicles.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <p>No hay solicitudes de vehículos registradas en este momento.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-800 text-gray-400 text-sm">
                        <th className="py-3 px-4">Tipo</th>
                        <th className="py-3 px-4">Marca / Modelo</th>
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
                          <td className="py-3 px-4">
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

          {activeTab === 'inventory' && (
            <div className="text-center py-12 text-gray-400">
              <p>Sección de inventario general activa y sincronizada con Supabase.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}