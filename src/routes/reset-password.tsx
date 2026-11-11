import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Loader2, Mail, Lock, ArrowLeft, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/jg/lib/supabase";
import { routeHead } from "@/lib/seo";

export const Route = createFileRoute("/reset-password")({
  head: () => routeHead("/reset-password", { noindex: true }),
  component: Page,
});

function Page() {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [newPw, setNewPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Se lee en useEffect para no romper la hidratación (el servidor no tiene window).
  const [isRecovery, setIsRecovery] = useState(false);
  useEffect(() => {
    try {
      setIsRecovery(window.location.hash.includes("type=recovery"));
    } catch {
      setIsRecovery(false);
    }
  }, []);

  const request = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (email.trim().length < 5 || !email.includes("@")) {
      setError("Escribe un correo válido.");
      return;
    }
    setSending(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo enviar el correo. Intenta de nuevo.");
    } finally {
      setSending(false);
    }
  };

  const update = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (newPw.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPw });
      if (error) throw error;
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo actualizar la contraseña.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link
          to="/admin"
          className="mb-6 flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-jg-text-dark"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al panel
        </Link>

        <div className="card animate-scale-in overflow-hidden">
          <div className="flex flex-col items-center border-b border-jg-silver/50 px-6 py-8 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-jg-red/15 text-jg-red">
              <Lock className="h-8 w-8" />
            </div>
            <h1 className="font-display text-xl font-bold text-jg-text-dark">
              Restablecer contraseña
            </h1>
            <p className="mt-1 text-sm text-gray-400">
              {isRecovery
                ? "Escribe tu nueva contraseña."
                : "Te enviamos un enlace para crear una nueva."}
            </p>
          </div>

          {isRecovery ? (
            done ? (
              <div className="space-y-4 p-6 text-center">
                <CheckCircle2 className="mx-auto h-10 w-10 text-green-600" />
                <p className="text-sm text-gray-400">
                  Tu contraseña ya quedó actualizada.
                </p>
                <Link to="/admin" className="btn-primary w-full">
                  Ir al panel
                </Link>
              </div>
            ) : (
              <form onSubmit={update} className="space-y-4 p-6">
                {error && (
                  <p role="alert" className="rounded-lg border border-jg-red/30 bg-jg-red/10 px-4 py-3 text-sm text-jg-red">
                    {error}
                  </p>
                )}
                <div>
                  <label className="label-field">Nueva contraseña</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                    <input
                      type={showPw ? "text" : "password"}
                      required
                      value={newPw}
                      onChange={(e) => setNewPw(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      autoComplete="new-password"
                      className="input-field pl-11 pr-11"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((v) => !v)}
                      aria-label={showPw ? "Ocultar contraseña" : "Mostrar contraseña"}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-gray-500 hover:text-jg-text-dark"
                    >
                      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={saving} className="btn-primary w-full disabled:opacity-50">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                  Guardar contraseña
                </button>
              </form>
            )
          ) : sent ? (
            <div className="space-y-4 p-6 text-center">
              <CheckCircle2 className="mx-auto h-10 w-10 text-green-600" />
              <p className="text-sm text-gray-400">
                Si ese correo existe, te enviamos un enlace. Revisa tu bandeja
                y también el spam.
              </p>
              <Link to="/admin" className="btn-secondary w-full">
                Volver al inicio de sesión
              </Link>
            </div>
          ) : (
            <form onSubmit={request} className="space-y-4 p-6">
              {error && (
                <p role="alert" className="rounded-lg border border-jg-red/30 bg-jg-red/10 px-4 py-3 text-sm text-jg-red">
                  {error}
                </p>
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
                    className="input-field pl-11"
                  />
                </div>
              </div>
              <button type="submit" disabled={sending} className="btn-primary w-full disabled:opacity-50">
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                Enviar enlace
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
