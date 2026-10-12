import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { useLocation, useNavigate } from '@tanstack/react-router';
import { Header } from '@/jg/components/Header';
import { Footer } from '@/jg/components/Footer';
import { WhatsAppFloat } from '@/jg/components/WhatsAppFloat';
import { SalesChatbot } from '@/jg/components/SalesChatbot';
import { VehicleDetailModal } from '@/jg/components/VehicleDetailModal';
import {
  Vehicle,
  VehicleAdminInput,
  Notification,
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

const JgContext = createContext<Ctx | null>(null);

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
      setVehicles(data as Vehicle[]);
    } finally {
      setLoading(false);
    }
  }, []);



  useEffect(() => {
    void loadVehicles().catch((error) => {
      console.error('Error cargando vehículos:', error);
    });
  }, [loadVehicles]);

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
    const { data: listener } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    supabase.auth.getSession().then(({ data }: { data: { session: AuthSession | null } }) => {
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

    const isAdmin = currentPage === 'admin';

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
        <Header currentPage={currentPage} onNavigate={navigate} />
        <main className="flex-1">{children}</main>
        <Footer onNavigate={navigate} />
        {!isAdmin && <SalesChatbot onNavigate={navigate} />}
        {!isAdmin && <WhatsAppFloat />}
        <VehicleDetailModal vehicle={selectedVehicle} onClose={() => setSelectedVehicle(null)} />
      </div>
    </JgContext.Provider>
  );
}
