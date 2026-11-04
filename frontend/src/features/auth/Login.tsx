import { PackageCheck } from "lucide-react";
import { Navigate, useLocation, type Location } from "react-router-dom";
import { LoginForm } from "./components/LoginForm";
import { useSesion } from "./hooks/useSesion";

export function Login() {
  const usuario = useSesion((state) => state.usuario);
  const location = useLocation();
  const locationState = location.state as { from?: Location } | null;

  // Con sesión iniciada no tiene sentido mostrar el formulario: incluye el momento justo después del login
  if (usuario) return <Navigate to={locationState?.from ?? "/inicio"} replace />;

  return (
    <div className="flex min-h-screen w-full flex-col bg-[#f8f9f5] lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <a
        className="fixed top-3 left-3 z-20 translate-y-[-160%] rounded-md bg-white px-3.5 py-2.5 text-[#173b32] focus:translate-y-0"
        href="#login-form"
      >
        Saltar al inicio de sesión
      </a>

      {/* Debajo de lg la marca queda en una banda para que el formulario entre en la primera pantalla */}
      <header className="flex flex-col bg-[#173b32] px-6 py-5 text-white sm:px-10 lg:min-h-screen lg:px-14 lg:py-12 xl:px-20">
        <div className="mx-auto flex w-full max-w-105 items-center gap-3 lg:mx-0 lg:max-w-none">
          <div
            className="grid size-10 place-items-center rounded-xl bg-[#c7e77e] text-[#173d33] lg:size-11"
            aria-hidden="true"
          >
            <PackageCheck size={22} strokeWidth={2.2} />
          </div>
          <div>
            <p className="text-[15px] font-bold leading-tight tracking-[0.02em]">CASA TECH</p>
            <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.16em] text-white/55">
              Gestión comercial
            </p>
          </div>
        </div>

        <div className="mt-auto mb-12 hidden max-w-md pt-16 lg:block">
          <p className="animate-[rise-in_650ms_80ms_both] font-display text-[clamp(2.25rem,3.4vw,3.25rem)] font-semibold leading-[1.08] tracking-[-0.03em] text-balance">
            Tu negocio, en buenas manos.
          </p>
          <p className="mt-4 animate-[rise-in_650ms_180ms_both] text-base leading-7 text-white/65">
            Ventas, productos y stock reunidos en un solo lugar. Una herramienta clara para el
            trabajo de todos los días.
          </p>
        </div>

        <p className="hidden border-t border-white/10 pt-5 text-[11px] text-white/45 lg:block">
          Casa de Tecnología · Tucumán
        </p>
      </header>

      {/* Alineado arriba con un margen fijo: un error que aparece no desplaza el título */}
      <main className="flex flex-1 flex-col items-center px-6 pt-10 pb-8 sm:px-10 sm:pt-16 lg:min-h-screen lg:px-12 lg:pt-[max(4rem,22vh)]">
        <div className="w-full max-w-105 animate-enter">
          <h1 className="font-display text-3xl font-semibold tracking-[-0.03em] text-[#1e3029] sm:text-[2.15rem]">
            Qué bueno verte.
          </h1>
          <p className="mt-2 text-sm leading-6 text-[#78847d]">
            Ingresá tus credenciales para continuar.
          </p>

          <LoginForm />
        </div>

        <footer className="mt-auto w-full max-w-105 pt-12 text-center text-[10px] tracking-[0.02em] text-[#a0aaa3]">
          Proyecto académico · Facultad de Ciencias Exactas · UNT
        </footer>
      </main>
    </div>
  );
}
