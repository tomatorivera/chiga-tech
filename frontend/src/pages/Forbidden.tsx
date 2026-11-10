import { ArrowLeft, Lock } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSesion } from "../features/auth/hooks/useSesion";
import { findNavbarLink } from "../shared/components/navbar/navbarSections";
import { useDocumentTitle } from "../shared/hooks/useDocumentTitle";

export type ForbiddenState = {
  from: string;
  canGoBack: boolean;
};

export const Forbidden = () => {
  const usuario = useSesion((state) => state.usuario!);
  const location = useLocation();
  const navigate = useNavigate();
  useDocumentTitle("Sin acceso");

  const state = location.state as ForbiddenState | null;
  const section = state ? findNavbarLink(state.from)?.text : undefined;
  const canGoBack = state?.canGoBack ?? location.key !== "default";
  const fullName = `${usuario.nombre} ${usuario.apellido}`.trim() || usuario.nombreUsuario;

  // Sin historial dentro de la app, volver atrás sacaría al usuario del sistema.
  const goBack = () => (canGoBack ? navigate(-1) : navigate("/inicio", { replace: true }));

  return (
    <section className="mx-auto my-6 w-[min(35rem,calc(100%-2rem))] rounded-2xl bg-surface p-6 motion-safe:animate-enter sm:my-auto">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        <p
          aria-hidden="true"
          className="font-display text-6xl leading-none font-extrabold tracking-[-0.04em] text-brand tabular-nums sm:text-8xl"
        >
          403
        </p>
        <span
          aria-hidden="true"
          className="grid size-14 shrink-0 place-items-center rounded-xl bg-canvas text-brand"
        >
          <Lock size={26} />
        </span>
      </div>

      <h1
        tabIndex={-1}
        className="mt-6 font-display text-2xl leading-tight font-semibold tracking-tight text-balance wrap-break-word text-ink outline-none sm:text-[28px]"
      >
        No tenés permiso para entrar a {section ?? "esta sección"}
      </h1>
      <p className="mt-3 text-ink-soft">
        Esta sección no está habilitada para tu rol. Si la necesitás para tu trabajo, pedile a un
        administrador que te dé acceso.
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-lg bg-canvas px-4 py-3">
        <p className="min-w-0 wrap-break-word">
          <span className="block text-sm text-muted">Sesión iniciada como</span>
          <span className="mt-0.5 block font-semibold text-ink">{fullName}</span>
        </p>
        <ul aria-label="Tus roles" className="flex flex-wrap gap-1.5">
          {usuario.roles.map((role) => (
            <li
              key={role}
              className="rounded-full bg-surface px-2.5 py-1 text-[13px] font-semibold text-ink-soft"
            >
              {role}
            </li>
          ))}
        </ul>
      </div>

      <button
        type="button"
        onClick={() => void goBack()}
        className="mt-8 inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 font-semibold text-white shadow-action transition-[background-color,box-shadow] hover:bg-primary-hover hover:shadow-action-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus motion-safe:active:translate-y-px"
      >
        <ArrowLeft size={18} aria-hidden="true" />
        Volver a la página anterior
      </button>
    </section>
  );
};
