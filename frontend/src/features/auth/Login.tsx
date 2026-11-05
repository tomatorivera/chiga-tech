import { Navigate, useLocation, type Location } from "react-router-dom";
import { Wordmark } from "../../shared/components/Wordmark";
import { LoginForm } from "./components/LoginForm";
import { ReceiptPreview } from "./components/ReceiptPreview";
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

      <header className="relative isolate m-2 flex flex-col overflow-hidden rounded-2xl bg-brand bg-linear-160 from-brand to-[#0c211b] px-4 py-5 text-white sm:px-8 lg:m-4 lg:rounded-3xl lg:px-14 lg:py-12 xl:px-20">
        <div
          className="absolute inset-0 -z-10 bg-radial-[80%_60%_at_95%_62%] from-[#2e8f6c]/65 via-[#2e8f6c]/30 via-40% to-transparent to-100%"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 -z-10 bg-radial-[70%_35%_at_45%_105%] from-[#2e8f6c]/35 to-transparent to-100%"
          aria-hidden="true"
        />

        <Wordmark className="mx-auto w-full max-w-105 lg:mx-0 lg:max-w-none" />

        <div className="hidden flex-1 place-items-center py-10 lg:grid [@media(max-height:760px)]:hidden">
          <ReceiptPreview />
        </div>

        <div className="mt-auto hidden max-w-md lg:block">
          <p className="font-display text-[clamp(2rem,2.8vw,2.5rem)] font-semibold leading-[1.1] tracking-tight text-balance">
            Tu negocio en un solo lugar.
          </p>
          <p className="mt-4 text-[17px] leading-7 text-white/65">
            Registrá ventas, consultá precios y stock, y seguí las cuentas corrientes de los
            clientes.
          </p>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center px-6 pt-10 pb-8 sm:px-10 sm:pt-16 lg:min-h-screen lg:px-12 lg:pt-[max(4rem,22vh)]">
        <section className="w-full max-w-105 motion-safe:animate-enter">
          <h1 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-[2.15rem]">
            Iniciá sesión
          </h1>
          <p className="mt-3 text-[17px] leading-7 text-pretty text-muted">
            Entrá con el usuario y la contraseña que te dio el administrador.
          </p>

          <LoginForm />
        </section>
      </main>
    </div>
  );
}
