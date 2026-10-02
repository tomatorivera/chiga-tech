import { useState, type SubmitEvent } from "react";
import { ArrowRight, Eye, EyeOff, LockKeyhole, ShieldCheck, UserRound } from "lucide-react";

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [notice, setNotice] = useState("");

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("Formulario validado. El acceso se habilitará al conectar el backend.");
  }

  return (
    <>
      <form id="login-form" className="mt-8 space-y-5" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username" className="mb-2 block text-[13px] font-semibold text-[#34463e]">
            Usuario
          </label>
          <div className="field-wrap relative">
            <UserRound className="field-icon" size={18} aria-hidden="true" />
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              placeholder="Ingresá tu usuario"
              required
              minLength={4}
              maxLength={50}
              className="login-input w-full rounded-lg border bg-white py-3.5 pl-11 pr-4 text-sm text-[#26372f] outline-none transition"
            />
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label htmlFor="password" className="block text-[13px] font-semibold text-[#34463e]">
              Contraseña
            </label>
            <span className="text-[11px] font-medium text-[#9aa39d]">Mínimo 8 caracteres</span>
          </div>
          <div className="field-wrap relative">
            <LockKeyhole className="field-icon" size={18} aria-hidden="true" />
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Ingresá tu contraseña"
              required
              minLength={8}
              className="login-input w-full rounded-lg border bg-white py-3.5 pl-11 pr-12 text-sm text-[#26372f] outline-none transition"
            />
            <button
              className="password-toggle absolute inset-y-0 right-0 grid w-11 place-items-center rounded-r-lg text-[#86928b] transition hover:text-[#345849] focus-visible:outline focus-visible:-outline-offset-4 focus-visible:outline-[#527863]"
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              aria-pressed={showPassword}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <label className="flex w-fit cursor-pointer items-center gap-2.5 py-1 text-xs text-[#69776f]">
          <input
            className="remember-check size-4 cursor-pointer rounded border-[#bdc8bf] accent-[#315d4a]"
            type="checkbox"
            name="remember"
          />
          Mantener mi sesión iniciada
        </label>

        <button
          className="submit-button group flex w-full items-center justify-center gap-2 rounded-lg px-5 py-3.5 text-sm font-semibold text-white transition focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#315d4a]"
          type="submit"
        >
          Iniciar sesión
          <ArrowRight
            className="transition-transform group-hover:translate-x-1"
            size={17}
            aria-hidden="true"
          />
        </button>
      </form>

      {notice && (
        <p
          className="mt-4 flex items-start gap-2 rounded-lg border border-[#dce8d4] bg-[#f2f7ec] px-3.5 py-3 text-xs leading-5 text-[#45633d]"
          role="status"
        >
          <ShieldCheck className="mt-0.5 shrink-0" size={16} aria-hidden="true" />
          {notice}
        </p>
      )}
    </>
  );
}
