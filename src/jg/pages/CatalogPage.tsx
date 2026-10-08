// @ts-nocheck
import { useState, useMemo, useEffect } from 'react';
import { Search, SlidersHorizontal, X, Bike, Car, ImageIcon } from 'lucide-react';
import { Vehicle, STATUS_CONFIG, formatCOP } from '@/jg/lib/supabase';
import { VehicleCard } from '@/jg/components/VehicleCard';

interface CatalogPageProps {
  vehicles: Vehicle[];
  loading: boolean;
  onVehicleClick: (vehicle: Vehicle) => void;
}

const statusOptions = [
  { value: 'all', label: 'Todos' },
  { value: 'disponible', label: 'Disponible' },
  { value: 'no_disponible', label: 'No disponible' },
  { value: 'vendido', label: 'Vendido' },
  { value: 'aliado', label: 'Aliado' },
];

const displacementOptions = [
  { value: 'all', label: 'Todos' },
  { value: 'low', label: 'Bajo (hasta 150cc)' },
  { value: 'mid', label: 'Medio (151-250cc)' },
  { value: 'high', label: 'Alto (+250cc)' },
];

function getDisplacementCategory(disp: string | null): string {
  if (!disp) return 'none';
  const match = disp.match(/(\d+)/);
  if (!match) return 'none';
  const cc = parseInt(match[1]);
  if (cc <= 150) return 'low';
  if (cc <= 250) return 'mid';
  return 'high';
}

export function CatalogPage({ vehicles, loading, onVehicleClick }: CatalogPageProps) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [brandFilter, setBrandFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [displacementFilter, setDisplacementFilter] = useState('all');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const brands = useMemo(() => {
    const set = new Set(vehicles.map((v) => v.brand));
    return Array.from(set).sort();
  }, [vehicles]);

  const filtered = useMemo(() => {
    return vehicles.filter((v) => {
      if (search) {
        const q = search.toLowerCase();
        if (!v.title.toLowerCase().includes(q) && !v.brand.toLowerCase().includes(q) && !v.model.toLowerCase().includes(q)) {
          return false;
        }
      }
      if (typeFilter !== 'all' && v.type !== typeFilter) return false;
      if (brandFilter !== 'all' && v.brand !== brandFilter) return false;
      if (statusFilter !== 'all' && v.status !== statusFilter) return false;
      if (displacementFilter !== 'all') {
        if (v.type === 'carro') return false;
        if (getDisplacementCategory(v.displacement) !== displacementFilter) return false;
      }
      if (priceMin && v.price < parseInt(priceMin)) return false;
      if (priceMax && v.price > parseInt(priceMax)) return false;
      return true;
    });
  }, [vehicles, search, typeFilter, brandFilter, statusFilter, displacementFilter, priceMin, priceMax]);

  const activeFilters =
    (typeFilter !== 'all' ? 1 : 0) +
    (brandFilter !== 'all' ? 1 : 0) +
    (statusFilter !== 'all' ? 1 : 0) +
    (displacementFilter !== 'all' ? 1 : 0) +
    (priceMin ? 1 : 0) +
    (priceMax ? 1 : 0);

  const clearAll = () => {
    setSearch('');
    setTypeFilter('all');
    setBrandFilter('all');
    setStatusFilter('all');
    setDisplacementFilter('all');
    setPriceMin('');
    setPriceMax('');
  };

  return (
    <div className="animate-fade-in">
      <div className="border-b border-jg-silver/50 bg-jg-carbon/50 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="font-display text-3xl font-bold text-jg-text-dark sm:text-4xl">Inventario</h1>
          <p className="mt-2 text-sm text-gray-600">
            Explora nuestra selección de motos y carros verificados
          </p>
          <p className="mt-1 text-xs text-yellow-400">
            Inventario sujeto a disponibilidad y rotación continua.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Search + Filter Toggle */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por marca, modelo o título..."
              className="input-field pl-11"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-secondary !py-3"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filtros
            {activeFilters > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-jg-red text-xs font-bold text-white">
                {activeFilters}
              </span>
            )}
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mb-6 animate-slide-down rounded-2xl border border-jg-silver/50 bg-jg-carbon p-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="label-field">Tipo de Vehículo</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setTypeFilter('all')}
                    className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
                      typeFilter === 'all'
                        ? 'border-jg-red bg-jg-red/10 text-jg-red'
                        : 'border-jg-silver text-gray-600 hover:text-jg-text-dark'
                    }`}
                  >
                    Todos
                  </button>
                  <button
                    onClick={() => setTypeFilter('moto')}
                    className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
                      typeFilter === 'moto'
                        ? 'border-jg-red bg-jg-red/10 text-jg-red'
                        : 'border-jg-silver text-gray-600 hover:text-jg-text-dark'
                    }`}
                  >
                    <Bike className="h-4 w-4" /> Moto
                  </button>
                  <button
                    onClick={() => setTypeFilter('carro')}
                    className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
                      typeFilter === 'carro'
                        ? 'border-jg-red bg-jg-red/10 text-jg-red'
                        : 'border-jg-silver text-gray-600 hover:text-jg-text-dark'
                    }`}
                  >
                    <Car className="h-4 w-4" /> Carro
                  </button>
                </div>
              </div>

              <div>
                <label className="label-field">Marca</label>
                <select
                  value={brandFilter}
                  onChange={(e) => setBrandFilter(e.target.value)}
                  className="select-field"
                >
                  <option value="all">Todas las marcas</option>
                  {brands.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label-field">Estado</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="select-field"
                >
                  {statusOptions.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label-field">Cilindraje (motos)</label>
                <select
                  value={displacementFilter}
                  onChange={(e) => setDisplacementFilter(e.target.value)}
                  className="select-field"
                >
                  {displacementOptions.map((d) => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label-field">Precio mínimo (COP)</label>
                <input
                  type="number"
                  value={priceMin}
                  onChange={(e) => setPriceMin(e.target.value)}
                  placeholder="Ej. 5000000"
                  className="input-field"
                />
              </div>

              <div>
                <label className="label-field">Precio máximo (COP)</label>
                <input
                  type="number"
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value)}
                  placeholder="Ej. 50000000"
                  className="input-field"
                />
              </div>
            </div>

            {activeFilters > 0 && (
              <div className="mt-4 flex items-center justify-between border-t border-jg-silver/50 pt-4">
                <span className="text-xs text-gray-500">
                  {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
                </span>
                <button onClick={clearAll} className="btn-ghost text-jg-red">
                  <X className="h-4 w-4" />
                  Limpiar filtros
                </button>
              </div>
            )}
          </div>
        )}

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, idx) => (
              <div key={idx} className="card overflow-hidden">
                <div className="aspect-[4/3] animate-pulse bg-jg-dark" />
                <div className="space-y-3 p-4">
                  <div className="h-5 w-3/4 animate-pulse rounded bg-jg-dark" />
                  <div className="h-4 w-1/2 animate-pulse rounded bg-jg-dark" />
                  <div className="h-8 w-1/3 animate-pulse rounded bg-jg-dark" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <>
            <p className="mb-4 text-sm text-gray-600">
              Mostrando <span className="font-semibold text-jg-text-dark">{filtered.length}</span> vehículo{filtered.length !== 1 ? 's' : ''}
            </p>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((vehicle) => (
                <VehicleCard
                  key={vehicle.id}
                  vehicle={vehicle}
                  onClick={() => onVehicleClick(vehicle)}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-jg-dark">
              <ImageIcon className="h-8 w-8 text-gray-600" />
            </div>
            <h3 className="font-display text-lg font-bold text-jg-text-dark">No se encontraron vehículos</h3>
            <p className="mt-1 text-sm text-gray-600">Prueba ajustando los filtros de búsqueda.</p>
            {activeFilters > 0 && (
              <button onClick={clearAll} className="mt-4 btn-secondary">
                Limpiar filtros
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
