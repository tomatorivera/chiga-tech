import { ArrowRight, PackageCheck, ShieldCheck } from "lucide-react";
import { LoginForm } from "./components/LoginForm";

export function Login() {
  return (
    <main className="login-shell min-h-screen w-full lg:grid lg:grid-cols-[1.08fr_0.92fr]">
      <a className="skip-link" href="#login-form">
        Saltar al inicio de sesión
      </a>

      <section className="brand-panel relative flex min-h-85 flex-col overflow-hidden px-7 py-7 text-white sm:px-10 sm:py-9 lg:min-h-screen lg:px-14 lg:py-12 xl:px-20">
        <div className="brand-grain" aria-hidden="true" />
        <header className="relative z-10 flex items-center gap-3">
          <div
            className="brand-mark grid size-11 place-items-center rounded-xl text-[#173d33]"
            aria-hidden="true"
          >
            <PackageCheck size={23} strokeWidth={2.2} />
          </div>
          <div>
            <p className="text-[15px] font-bold leading-tight tracking-[0.02em]">CASA TECH</p>
            <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.16em] text-white/55">
              Gestión comercial
            </p>
          </div>
          <span className="ml-auto rounded-full border border-white/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/65">
            Vista previa
          </span>
        </header>

        <div className="relative z-10 mt-12 max-w-xl sm:mt-16 lg:my-auto lg:mt-0 lg:pb-14">
          <p className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#c7e77e]">
            <span className="h-px w-7 bg-[#c7e77e]" />
            Todo en su lugar
          </p>
          <h1 className="max-w-lg font-display text-[clamp(2.45rem,5vw,4.6rem)] font-semibold leading-[1.04] tracking-[-0.035em]">
            Tu negocio, <span className="text-[#c7e77e]">en buenas manos.</span>
          </h1>
          <p className="mt-5 max-w-md text-sm leading-6 text-white/65 sm:text-base sm:leading-7">
            Ventas, productos y stock reunidos en un solo lugar. Una herramienta clara para el
            trabajo de todos los días.
          </p>

          <div className="inventory-preview mt-9 max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#f8f8ef] text-[#24352f] shadow-[0_24px_60px_-32px_rgba(0,0,0,0.65)] sm:mt-12">
            <div className="flex items-center justify-between border-b border-[#e4e8df] px-5 py-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7c8b81]">
                  Panel de gestión
                </p>
                <p className="mt-1 text-sm font-semibold">Resumen del depósito</p>
              </div>
              <span className="flex items-center gap-1.5 rounded-full bg-[#e9f3d6] px-2.5 py-1 text-[10px] font-semibold text-[#456b36]">
                <span className="size-1.5 rounded-full bg-[#79a64e]" />
                En línea
              </span>
            </div>
            <div className="grid grid-cols-2 divide-x divide-[#e4e8df]">
              <div className="px-5 py-4">
                <p className="text-xs text-[#7c8b81]">Productos</p>
                <p className="mt-1 font-display text-2xl font-semibold">248</p>
              </div>
              <div className="px-5 py-4">
                <p className="text-xs text-[#7c8b81]">Stock bajo</p>
                <p className="mt-1 flex items-center gap-2 font-display text-2xl font-semibold">
                  06{" "}
                  <span className="rounded bg-[#fbebd9] px-1.5 py-0.5 font-sans text-[10px] font-semibold text-[#a5632f]">
                    revisar
                  </span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 border-t border-[#e4e8df] px-5 py-3.5">
              <div
                className="grid size-8 place-items-center rounded-lg bg-[#e8eee7] text-[#507161]"
                aria-hidden="true"
              >
                <PackageCheck size={16} />
              </div>
              <p className="text-xs font-medium text-[#64746b]">
                Catálogo y movimientos, bajo control
              </p>
              <ArrowRight className="ml-auto text-[#85948a]" size={16} aria-hidden="true" />
            </div>
          </div>
        </div>

        <footer className="relative z-10 mt-10 flex items-center justify-between border-t border-white/10 pt-5 text-[11px] text-white/45 lg:mt-0">
          <span>Casa de Tecnología · Tucumán</span>
          <span className="hidden sm:inline">Sistema de gestión comercial</span>
        </footer>
        <div className="brand-orbit brand-orbit-one" aria-hidden="true" />
        <div className="brand-orbit brand-orbit-two" aria-hidden="true" />
      </section>

      <section className="form-panel flex min-h-140 flex-col items-center justify-center px-6 py-12 sm:px-10 lg:min-h-screen lg:px-12">
        <div className="w-full max-w-105 animate-enter">
          <div className="mb-9 flex items-center gap-2 text-xs font-medium text-[#617168]">
            <span className="size-2 rounded-full bg-[#8cb46a]" />
            Acceso al sistema
          </div>
          <h2 className="font-display text-3xl font-semibold tracking-[-0.03em] text-[#1e3029] sm:text-[2.15rem]">
            Qué bueno verte.
          </h2>
          <p className="mt-2 text-sm leading-6 text-[#78847d]">
            Ingresá tus credenciales para continuar.
          </p>

          <LoginForm />

          <div className="mt-7 flex items-start gap-3 border-t border-[#e8ece7] pt-5">
            <div
              className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-[#f0f3ee] text-[#6b8274]"
              aria-hidden="true"
            >
              <ShieldCheck size={15} />
            </div>
            <p className="text-[11px] leading-[1.65] text-[#818d85]">
              <span className="font-semibold text-[#617168]">Entorno de avance.</span> La validación
              es visual; la autenticación segura se integrará con el backend.
            </p>
          </div>
        </div>
        <p className="mt-auto w-full max-w-105 pt-12 text-center text-[10px] tracking-[0.02em] text-[#a0aaa3] lg:absolute lg:bottom-7">
          Proyecto académico · Facultad de Ciencias Exactas · UNT
        </p>
      </section>
    </main>
  );
}
