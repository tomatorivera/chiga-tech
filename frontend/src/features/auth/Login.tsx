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
    <div className="flex min-h-screen w-full flex-col bg-canvas lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <a
        className="fixed top-3 left-3 z-20 translate-y-[-160%] rounded-md bg-surface px-3.5 py-2.5 text-brand focus:translate-y-0 focus:outline-2 focus:outline-offset-2 focus:outline-accent"
        href="#username"
      >
        Saltar al inicio de sesión
      </a>

      <header className="flex flex-col bg-brand px-6 py-5 text-white sm:px-10 lg:min-h-screen lg:px-14 lg:py-12 xl:px-20">
        <div className="mx-auto flex w-full max-w-105 items-center gap-3 lg:mx-0 lg:max-w-none">
          <div
            className="grid size-10 place-items-center rounded-xl bg-accent text-brand lg:size-11"
            aria-hidden="true"
          >
            <PackageCheck size={22} strokeWidth={2.2} />
          </div>
          <div>
            <p className="text-[15px] font-bold leading-tight tracking-[0.02em]">CHIGA TECH</p>
            <p className="mt-1 text-xs font-medium whitespace-nowrap uppercase tracking-wider text-white/55">
              Gestión comercial
            </p>
          </div>
        </div>

        <div className="mt-auto mb-12 hidden max-w-md pt-16 lg:block">
          <p className="font-display text-[clamp(2.25rem,3.4vw,3.25rem)] font-semibold leading-[1.08] tracking-tight text-balance">
            Tu negocio en un solo lugar.
          </p>
          <p className="mt-4 text-base leading-7 text-white/65">
            Registrá ventas, consultá precios y stock, y seguí las cuentas corrientes de los
            clientes.
          </p>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center px-6 pt-10 pb-8 sm:px-10 sm:pt-16 lg:min-h-screen lg:px-12 lg:pt-[max(4rem,22vh)]">
        <div className="w-full max-w-105 motion-safe:animate-enter">
          <h1 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-[2.15rem]">
            Iniciá sesión
          </h1>
          <p className="mt-2 text-sm leading-6 text-pretty text-muted">
            Entrá con el usuario y la contraseña que te dio el administrador.
          </p>

          <LoginForm />
        </div>
      </main>
    </div>
  );
}
