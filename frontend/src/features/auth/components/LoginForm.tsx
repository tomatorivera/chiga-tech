import { useActionState, useState } from "react";
import {
  ArrowRight,
  CircleAlert,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  UserRound,
} from "lucide-react";
import { loginAction } from "../actions/login.action";

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [state, formAction, isPending] = useActionState(loginAction, { status: "idle" });

  const errorState = state.status === "error" ? state : undefined;
  const fieldErrors = isPending ? undefined : errorState?.fieldErrors;
  const message = isPending ? undefined : errorState?.message;

  return (
    <>
      <form id="login-form" className="mt-8 space-y-5" action={formAction} noValidate>
        <div>
          <label htmlFor="username" className="mb-2 block text-[13px] font-semibold text-[#34463e]">
            Usuario
          </label>
          <div className="relative">
            <UserRound
              className="pointer-events-none absolute top-1/2 left-[15px] -translate-y-1/2 text-[#87948c]"
              size={18}
              aria-hidden="true"
            />
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              placeholder="Ingresá tu usuario"
              defaultValue={errorState?.previousValues?.username}
              aria-invalid={Boolean(fieldErrors?.username)}
              aria-describedby={fieldErrors?.username ? "username-error" : undefined}
              className="w-full rounded-lg border border-[#dfe5de] bg-white py-3.5 pl-11 pr-4 text-[#26372f] shadow-[0_1px_2px_rgba(35,58,45,0.025)] outline-none transition placeholder:text-[#a2aca5] hover:border-[#c6d2c8] focus:border-[#648a70] focus:shadow-[0_0_0_3px_rgba(100,138,112,0.13)] aria-invalid:border-[#c4604d] aria-invalid:focus:shadow-[0_0_0_3px_rgba(196,96,77,0.14)]"
            />
          </div>
          {fieldErrors?.username && (
            <p id="username-error" className="mt-1.5 text-xs text-[#a13d2d]" role="alert">
              {fieldErrors.username}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="mb-2 block text-[13px] font-semibold text-[#34463e]">
            Contraseña
          </label>
          <div className="relative">
            <LockKeyhole
              className="pointer-events-none absolute top-1/2 left-[15px] -translate-y-1/2 text-[#87948c]"
              size={18}
              aria-hidden="true"
            />
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Ingresá tu contraseña"
              aria-invalid={Boolean(fieldErrors?.password)}
              aria-describedby={fieldErrors?.password ? "password-error" : undefined}
              className="w-full rounded-lg border border-[#dfe5de] bg-white py-3.5 pl-11 pr-12 text-[#26372f] shadow-[0_1px_2px_rgba(35,58,45,0.025)] outline-none transition placeholder:text-[#a2aca5] hover:border-[#c6d2c8] focus:border-[#648a70] focus:shadow-[0_0_0_3px_rgba(100,138,112,0.13)] aria-invalid:border-[#c4604d] aria-invalid:focus:shadow-[0_0_0_3px_rgba(196,96,77,0.14)]"
            />
            <button
              className="absolute inset-y-0 right-0 grid w-11 cursor-pointer place-items-center rounded-r-lg text-[#86928b] transition hover:text-[#345849] focus-visible:outline focus-visible:-outline-offset-4 focus-visible:outline-[#527863]"
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              aria-pressed={showPassword}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {fieldErrors?.password && (
            <p id="password-error" className="mt-1.5 text-xs text-[#a13d2d]" role="alert">
              {fieldErrors.password}
            </p>
          )}
        </div>

        <button
          className="group mt-8 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#285644] px-5 py-3.5 text-white shadow-[0_5px_12px_rgba(34,77,58,0.13)] transition hover:bg-[#204b3a] hover:shadow-[0_7px_16px_rgba(34,77,58,0.18)] disabled:cursor-wait disabled:bg-[#557868] disabled:shadow-none focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#315d4a]"
          type="submit"
          disabled={isPending}
        >
          {isPending ? (
            <>
              <LoaderCircle className="animate-spin" size={17} aria-hidden="true" />
              Iniciando sesión...
            </>
          ) : (
            <>
              Iniciar sesión
              <ArrowRight
                className="transition-transform group-hover:translate-x-1"
                size={17}
                aria-hidden="true"
              />
            </>
          )}
        </button>
      </form>

      {message && (
        <p
          className="mt-4 flex items-start gap-2 rounded-lg border border-[#efd6cf] bg-[#fbf2ef] px-3.5 py-3 text-xs leading-5 text-[#8f3a2c]"
          role="alert"
        >
          <CircleAlert className="mt-0.5 shrink-0" size={16} aria-hidden="true" />
          {message}
        </p>
      )}
    </>
  );
}
