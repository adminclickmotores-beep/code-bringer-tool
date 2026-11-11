import { useEffect, useState } from 'react';
import { Lock, Mail, Loader2, AlertCircle, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/jg/lib/supabase';
import { Logo } from '@/jg/components/Logo';

interface AdminLoginProps {
  onBack: () => void;
  onSuccess: () => void;
}

export function AdminLogin({ onBack, onSuccess }: AdminLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  // Valor fijo en el primer render (el servidor no tiene localStorage);
  // se lee el valor real en useEffect para no romper la hidratación.
  const [remember, setRemember] = useState(true);
  useEffect(() => {
    try {
      setRemember(localStorage.getItem('jg-remember-me') !== '0');
    } catch {
      /* almacenamiento no disponible */
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Ingresa tu correo y contraseña.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        if (signInError.message.includes('Invalid login credentials')) {
          setError('Correo o contraseña incorrectos.');
        } else {
          setError(signInError.message);
        }
        return;
      }

      try {
        localStorage.setItem('jg-remember-me', remember ? '1' : '0');
        if (!remember) {
          const only: Record<string, string> = {};
          for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            const v = k ? localStorage.getItem(k) : null;
            if (k && v !== null && k.startsWith('sb-')) only[k] = v;
          }
          Object.entries(only).forEach(([k, v]) => {
            try {
              sessionStorage.setItem(k, v);
            } catch {
              /* almacenamiento no disponible */
            }
            localStorage.removeItem(k);
          });
          try {
            sessionStorage.setItem('jg-session-only', '1');
          } catch {
            /* almacenamiento no disponible */
          }
        } else {
          try {
            sessionStorage.removeItem('jg-session-only');
          } catch {
            /* almacenamiento no disponible */
          }
        }
      } catch {
        /* almacenamiento no disponible */
      }

      onSuccess();
    } catch {
      setError('No se pudo iniciar sesión. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <button
          onClick={onBack}
          className="mb-6 flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-jg-text-dark"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al inicio
        </button>

        <div className="card animate-scale-in overflow-hidden">
          <div className="flex flex-col items-center border-b border-jg-silver/50 px-6 py-8 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-jg-red/15 text-jg-red">
              <Lock className="h-8 w-8" />
            </div>
            <Logo />
            <h1 className="mt-4 font-display text-xl font-bold text-jg-text-dark">Panel de Control</h1>
            <p className="mt-1 text-sm text-gray-400">
              Ingresa con tus credenciales para administrar el inventario
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 p-6">
            {error && (
              <div className="flex items-center gap-3 rounded-lg border border-jg-red/30 bg-jg-red/10 px-4 py-3 text-sm text-jg-red">
                <AlertCircle className="h-5 w-5 shrink-0" />
                {error}
              </div>
            )}

            <div>
              <label className="label-field">Correo electrónico</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@jgmotors.com"
                  autoComplete="email"
                  inputMode="email"
                  className="input-field pl-11 text-base"
                />
              </div>
            </div>

            <div>
              <label className="label-field">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="input-field pl-11 pr-11 text-base"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-gray-500 transition-colors hover:text-jg-text-dark"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 text-sm">
              <label className="flex cursor-pointer items-center gap-2 text-gray-400">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 accent-red-600"
                />
                Recuérdame
              </label>
              <a href="/reset-password" className="font-medium text-jg-red hover:underline">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
              Iniciar sesión
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
