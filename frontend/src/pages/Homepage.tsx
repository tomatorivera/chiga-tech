import { useActionState } from "react";
import { CircleAlert, LoaderCircle, LogOut, PackageCheck } from "lucide-react";
import { logoutAction } from "../features/auth/actions/logout.action";
import { useSesion } from "../features/auth/hooks/useSesion";

export function Homepage() {
  const usuario = useSesion((state) => state.usuario!);
  const [state, formAction, isPending] = useActionState(logoutAction, { status: "idle" });

  const message = !isPending && state.status === "error" ? state.message : undefined;

  return (
    <div className="min-h-screen bg-canvas">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-6 py-4 sm:px-10">
          <div
            className="grid size-9 place-items-center rounded-lg bg-accent text-brand"
            aria-hidden="true"
          >
            <PackageCheck size={19} strokeWidth={2.2} />
          </div>
          <p className="text-sm font-bold tracking-[0.02em] text-ink">CASA TECH</p>

          <form action={formAction} className="ml-auto">
            <button
              type="submit"
              disabled={isPending}
              className="flex cursor-pointer items-center gap-2 rounded-lg border border-line px-3.5 py-2 text-ink-soft transition hover:border-line-strong hover:bg-canvas disabled:cursor-wait disabled:text-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
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
            className="mb-8 flex max-w-xl items-start gap-2 rounded-lg border border-danger-line bg-danger-surface px-3.5 py-3 text-xs leading-5 text-danger-ink"
            role="alert"
          >
            <CircleAlert className="mt-0.5 shrink-0" size={16} aria-hidden="true" />
            {message}
          </p>
        )}

        <h1 className="font-display text-[clamp(2rem,4vw,3rem)] font-semibold leading-tight tracking-[-0.03em] text-ink">
          Hola, {usuario.nombre} {usuario.apellido}.
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          Ingresaste como{" "}
          <span className="font-semibold text-ink-soft">{usuario.nombreUsuario}</span> ·{" "}
          {usuario.roles.join(", ")}
        </p>
      </main>
    </div>
  );
}
