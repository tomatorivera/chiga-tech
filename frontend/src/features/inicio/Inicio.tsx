import { useActionState } from "react";
import { Navigate } from "react-router-dom";
import { CircleAlert, LoaderCircle, LogOut, PackageCheck } from "lucide-react";
import { logoutAction } from "../auth/actions/logout.action";
import { useSesion } from "../auth/hooks/useSesion";

// Base del futuro dashboard: por ahora solo saluda al usuario y permite cerrar la sesión
export function Inicio() {
  const usuario = useSesion((state) => state.usuario);
  const [state, formAction, isPending] = useActionState(logoutAction, { status: "idle" });

  // Sin usuario en memoria (nunca inició sesión, o la cerró) vuelve al login.
  // Recuperar la sesión al recargar la página con GET /auth/me es el ticket #10.
  if (!usuario) return <Navigate to="/login" replace />;

  const message = !isPending && state.status === "error" ? state.message : undefined;

  return (
    <div className="min-h-screen bg-[#f6f7f2]">
      <header className="border-b border-[#e4e8df] bg-white">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-6 py-4 sm:px-10">
          <div
            className="brand-mark grid size-9 place-items-center rounded-lg text-[#173d33]"
            aria-hidden="true"
          >
            <PackageCheck size={19} strokeWidth={2.2} />
          </div>
          <p className="text-sm font-bold tracking-[0.02em] text-[#1e3029]">CASA TECH</p>

          <form action={formAction} className="ml-auto">
            <button
              type="submit"
              disabled={isPending}
              className="logout-button flex items-center gap-2 rounded-lg border px-3.5 py-2 text-[13px] font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#315d4a]"
            >
              {isPending ? (
                <LoaderCircle className="animate-spin" size={16} aria-hidden="true" />
              ) : (
                <LogOut size={16} aria-hidden="true" />
              )}
              {isPending ? "Cerrando sesión…" : "Cerrar sesión"}
            </button>
          </form>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-14 sm:px-10 sm:py-20">
        {message && (
          <p
            className="mb-8 flex max-w-xl items-start gap-2 rounded-lg border border-[#efd5cf] bg-[#fbf1ee] px-3.5 py-3 text-xs leading-5 text-[#a13d2d]"
            role="alert"
          >
            <CircleAlert className="mt-0.5 shrink-0" size={16} aria-hidden="true" />
            {message}
          </p>
        )}

        <h1 className="font-display text-[clamp(2rem,4vw,3rem)] font-semibold leading-tight tracking-[-0.03em] text-[#1e3029]">
          Hola, {usuario.nombre} {usuario.apellido}.
        </h1>
        <p className="mt-3 text-sm leading-6 text-[#617168]">
          Ingresaste como{" "}
          <span className="font-semibold text-[#34463e]">{usuario.nombreUsuario}</span> ·{" "}
          {usuario.roles.join(", ")}
        </p>
      </main>
    </div>
  );
}
