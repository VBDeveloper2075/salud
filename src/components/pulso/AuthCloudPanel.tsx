"use client";

import { Cloud, CloudUpload, Loader2, LogOut } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import {
  pullRemoteToLocalStorage,
  pushLocalStorageToRemote,
} from "@/lib/supabase/repository";

type AuthMode = "login" | "signup";

export function AuthCloudPanel() {
  const configured = isSupabaseConfigured();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<AuthMode>("login");
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refreshSession = useCallback(async () => {
    const supabase = createClient();
    if (!supabase) {
      setSessionEmail(null);
      return;
    }
    const { data } = await supabase.auth.getUser();
    setSessionEmail(data.user?.email ?? null);
  }, []);

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  if (!configured) {
    return (
      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
        <h2 className="font-semibold">Nube (Supabase)</h2>
        <p className="mt-2 text-amber-900/90">
          Configurá{" "}
          <code className="rounded bg-white/80 px-1 text-xs">
            NEXT_PUBLIC_SUPABASE_URL
          </code>{" "}
          y{" "}
          <code className="rounded bg-white/80 px-1 text-xs">
            NEXT_PUBLIC_SUPABASE_ANON_KEY
          </code>{" "}
          en <code className="text-xs">.env.local</code>. Luego ejecutá las
          migraciones SQL en tu proyecto Supabase.
        </p>
      </section>
    );
  }

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    const supabase = createClient();
    if (!supabase) return;

    setBusy(true);
    try {
      if (mode === "login") {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (signInError) throw signInError;
        setMessage("Sesión iniciada.");
      } else {
        const { error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });
        if (signUpError) throw signUpError;
        setMessage(
          "Cuenta creada. Si tu proyecto exige confirmación por email, revisá tu bandeja.",
        );
      }
      await refreshSession();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo autenticar.");
    } finally {
      setBusy(false);
    }
  }

  async function handleSignOut() {
    const supabase = createClient();
    if (!supabase) return;
    setBusy(true);
    await supabase.auth.signOut();
    setSessionEmail(null);
    setMessage("Sesión cerrada.");
    setBusy(false);
  }

  async function handlePush() {
    setBusy(true);
    setError(null);
    try {
      const supabase = createClient();
      if (!supabase) return;
      const { data } = await supabase.auth.getUser();
      if (!data.user) throw new Error("Iniciá sesión primero.");
      await pushLocalStorageToRemote(data.user.id);
      setMessage("Datos de este navegador subidos a la nube.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir.");
    } finally {
      setBusy(false);
    }
  }

  async function handlePull() {
    setBusy(true);
    setError(null);
    try {
      const supabase = createClient();
      if (!supabase) return;
      const { data } = await supabase.auth.getUser();
      if (!data.user) throw new Error("Iniciá sesión primero.");
      await pullRemoteToLocalStorage(data.user.id);
      setMessage("Datos descargados. Recargá la app para ver todo actualizado.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al bajar.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <Cloud className="h-5 w-5 text-emerald-600" />
        <h2 className="text-sm font-semibold text-zinc-900">Cuenta y nube</h2>
      </div>

      {sessionEmail ? (
        <div className="mt-3 space-y-3">
          <p className="text-sm text-zinc-600">
            Conectado como{" "}
            <span className="font-medium text-zinc-900">{sessionEmail}</span>
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => void handlePush()}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              {busy ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <CloudUpload className="h-3.5 w-3.5" />
              )}
              Subir datos locales
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void handlePull()}
              className="rounded-xl border border-zinc-200 px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-60"
            >
              Bajar desde nube
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void handleSignOut()}
              className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
            >
              <LogOut className="h-3.5 w-3.5" />
              Cerrar sesión
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleAuth} className="mt-3 space-y-3">
          <p className="text-xs text-zinc-500">
            Iniciá sesión para sincronizar perfil, comidas y actividades entre
            dispositivos.
          </p>
          <label className="block text-sm">
            <span className="font-medium text-zinc-700">Email</span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-zinc-700">Contraseña</span>
            <input
              type="password"
              required
              minLength={6}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={busy}
              className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              {busy ? "Esperá…" : mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
            </button>
            <button
              type="button"
              className="rounded-xl border border-zinc-200 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
              onClick={() =>
                setMode((m) => (m === "login" ? "signup" : "login"))
              }
            >
              {mode === "login" ? "Crear cuenta" : "Ya tengo cuenta"}
            </button>
          </div>
        </form>
      )}

      {message && (
        <p className="mt-3 text-xs text-emerald-700" role="status">
          {message}
        </p>
      )}
      {error && (
        <p className="mt-3 text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
