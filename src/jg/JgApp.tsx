import type React from 'react';
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { useLocation, useNavigate } from '@tanstack/react-router';
import { Header } from '@/jg/components/Header';
import { Footer } from '@/jg/components/Footer';
import { WhatsAppFloat } from '@/jg/components/WhatsAppFloat';
import { ChatWidget } from '@/jg/components/ChatWidget';
import { SalesChatbot } from '@/jg/components/SalesChatbot';
import { VehicleDetailModal } from '@/jg/components/VehicleDetailModal';
import {
  Vehicle,
  VehicleAdminInput,
  Notification,
  normalizeVehicle,
  supabase,
} from '@/jg/lib/supabase';

export const PAGE_PATHS: Record<string, string> = {
  home: '/',
  catalog: '/catalogo',
  sell: '/vender',
  financing: '/financiacion',
  contact: '/contacto',
  terminos: '/terminos',
  'habeas-data': '/habeas-data',
  admin: '/admin',
  cms: '/cms',
};

function pageFromPath(path: string): string {
  const entry = Object.entries(PAGE_PATHS).find(([, p]) => p === path);
  return entry ? entry[0] : 'home';
}

type Ctx = {
  vehicles: Vehicle[];
  loading: boolean;
  loadVehicles: () => Promise<void>;
  addVehicle: (vehicle: VehicleAdminInput) => Promise<void>;
  updateVehicle: (id: string, vehicle: VehicleAdminInput) => Promise<void>;
  updateVehicleStatus: (id: string, status: Vehicle['status']) => Promise<void>;
  deleteVehicle: (id: string) => Promise<void>;
  session: Session | null;
  authLoading: boolean;
  refreshSession: () => void;
  notifications: Notification[];
  loadNotifications: () => Promise<void>;
  adminSection: string;
  setAdminSection: (s: string) => void;
  navigate: (page: string) => void;
  openVehicle: (v: Vehicle) => void;
  logout: () => Promise<void>;
};

// Keep a single context instance across hot reloads so pages and the shell never disagree.
const g = globalThis as unknown as { __jgContext?: React.Context<Ctx | null> };
const JgContext = g.__jgContext ?? (g.__jgContext = createContext<Ctx | null>(null));

export function useJg() {
  const ctx = useContext(JgContext);
  if (!ctx) throw new Error('useJg must be used inside JgApp');
  return ctx;
}

export function JgApp({ children }: { children: ReactNode }) {
  const nav = useNavigate();
  const location = useLocation();
  const currentPage = pageFromPath(location.pathname);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [adminSection, setAdminSection] = useState('inventario');
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const loadVehicles = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setVehicles(((data as Vehicle[] | null) ?? []).map(normalizeVehicle));
    } finally {
      setLoading(false);
    }
  }, []);



  useEffect(() => {
    void loadVehicles().catch((error) => {
      console.error('Error cargando vehículos:', error);
    });
  }, [loadVehicles]);

  // Enlace compartido: ?vehiculo=<id> abre la ficha automáticamente.
  const enlaceProfundoAbierto = useRef(false);
  useEffect(() => {
    if (enlaceProfundoAbierto.current || loading || vehicles.length === 0) return;
    enlaceProfundoAbierto.current = true;
    try {
      const id = new URLSearchParams(window.location.search).get('vehiculo');
      if (!id) return;
      const coincidencia = vehicles.find((v) => String(v.id) === id);
      if (coincidencia) setSelectedVehicle(coincidencia);
    } catch {
      /* URL no legible: se ignora el enlace profundo */
    }
  }, [loading, vehicles]);

  // Mantiene el enlace de la ficha abierta en la barra de direcciones.
  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      if (selectedVehicle) url.searchParams.set('vehiculo', String(selectedVehicle.id));
      else url.searchParams.delete('vehiculo');
      window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
    } catch {
      /* entorno sin historial: no se sincroniza la URL */
    }
  }, [selectedVehicle]);

  const addVehicle = useCallback(
    async (vehicle: VehicleAdminInput) => {
      const { error } = await supabase
        .from('vehicles')
        .insert(vehicle)
        .select('id')
        .single();
      if (error) throw error;
      await loadVehicles();
    },
    [loadVehicles],
  );

  const updateVehicle = useCallback(
    async (id: string, vehicle: VehicleAdminInput) => {
      const { error } = await supabase
        .from('vehicles')
        .update(vehicle)
        .eq('id', id)
        .select('id')
        .single();
      if (error) throw error;
      await loadVehicles();
    },
    [loadVehicles],
  );

  const updateVehicleStatus = useCallback(
    async (id: string, status: Vehicle['status']) => {
      const { error } = await supabase
        .from('vehicles')
        .update({ status })
        .eq('id', id)
        .select('id')
        .single();
      if (error) throw error;
      await loadVehicles();
    },
    [loadVehicles],
  );

  const deleteVehicle = useCallback(
    async (id: string) => {
      const { error } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', id)
        .select('id')
        .single();
      if (error) throw error;
      await loadVehicles();
    },
    [loadVehicles],
  );

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((_e: string, s: Session | null) => setSession(s));
    supabase.auth.getSession().then(({ data }: { data: { session: Session | null } }) => {
      setSession(data.session);
      setAuthLoading(false);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const loadNotifications = useCallback(async () => {
    const { data } = await supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(20);
    if (data) setNotifications(data as Notification[]);
  }, []);

  useEffect(() => {
    if (session) loadNotifications();
    const interval = session ? setInterval(loadNotifications, 30000) : null;
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [session, loadNotifications]);

  const navigate = useCallback(
    (page: string) => {
      nav({ to: PAGE_PATHS[page] ?? '/' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [nav],
  );

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    navigate('home');
  };

    const refreshSession = () => {
    supabase.auth.getSession().then(({ data }: { data: { session: Session | null } }) => {
      setSession(data.session);
    });
  };

  const isAdmin = currentPage === 'admin' || location.pathname === '/cms' || location.pathname === '/admin';

  return (
        <JgContext.Provider
      value={{
        vehicles, loading, loadVehicles, addVehicle, updateVehicle,
        updateVehicleStatus, deleteVehicle, session, authLoading, refreshSession,
        notifications, loadNotifications, adminSection, setAdminSection,
        navigate, openVehicle: setSelectedVehicle, logout,
      }}
    >
      <div className="flex min-h-screen flex-col bg-jg-body">
        <Header currentPage={currentPage} onNavigate={navigate} sessionEmail={session?.user?.email ?? null} />
        <main className="flex-1 bg-[#070707]">
          <div key={location.pathname} className="page-fade">
            {children}
          </div>
        </main>
        <Footer onNavigate={navigate} />
        {!isAdmin && <SalesChatbot onNavigate={navigate} />}
        {!isAdmin && <ChatWidget />}
        {!isAdmin && <WhatsAppFloat />}
        <VehicleDetailModal vehicle={selectedVehicle} onClose={() => setSelectedVehicle(null)} />
      </div>
    </JgContext.Provider>
  );
}
