import {
  startTransition,
  useActionState,
  useEffect,
  useRef,
  useState,
  type SubmitEvent,
  type KeyboardEvent,
} from "react";
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
  const [formState, formAction, isPending] = useActionState(loginAction, { status: "idle" });

  const errorState = formState.status === "error" ? formState : undefined;
  const fieldErrors = isPending ? undefined : errorState?.fieldErrors;
  const message = isPending ? undefined : errorState?.message;

  const [capsLock, setCapsLock] = useState(false);
  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  // Mover el foco al campo que tiene errores luego de intentar loguearse
  useEffect(() => {
    if (isPending || formState.status !== "error") return;

    const input = formState.fieldErrors?.username ? usernameRef.current : passwordRef.current;

    input?.focus();
    input?.select();
  }, [formState, isPending]);

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(() => formAction(formData));
  };

  const handlePasswordKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "CapsLock") {
      if (event.type === "keydown") setCapsLock((active) => !active);

      return;
    }
    setCapsLock(event.getModifierState("CapsLock"));
  };

  return (
    <form id="login-form" className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
      {message && (
        <p
          className="flex items-start gap-2 rounded-lg motion-safe:animate-reveal border border-danger-line bg-danger-surface px-3.5 py-3 text-sm leading-5 font-medium text-danger-ink"
          role="alert"
        >
          <CircleAlert className="mt-0.5 shrink-0" size={16} aria-hidden="true" />
          <span className="min-w-0 wrap-break-word">{message}</span>
        </p>
      )}

      <section>
        <label htmlFor="username" className="mb-2 block text-[13px] font-semibold text-ink-soft">
          Usuario
        </label>
        <div className="relative">
          <UserRound
            className="pointer-events-none absolute top-1/2 left-3.75 -translate-y-1/2 text-muted"
            size={18}
            aria-hidden="true"
          />
          <input
            ref={usernameRef}
            id="username"
            name="username"
            // oxlint-disable-next-line jsx-a11y/no-autofocus
            autoFocus
            type="text"
            autoComplete="username"
            aria-required="true"
            aria-invalid={Boolean(fieldErrors?.username)}
            aria-describedby={fieldErrors?.username ? "username-error" : undefined}
            className="w-full rounded-lg border border-line-control bg-surface py-3.5 pl-11 pr-4 text-ink caret-primary shadow-control transition hover:border-muted focus:border-focus focus:outline-2 focus:outline-offset-2 focus:outline-focus aria-invalid:border-danger aria-invalid:focus:outline-danger"
          />
        </div>
        {fieldErrors?.username && (
          <p
            id="username-error"
            className="mt-1.5 text-[13px] text-danger-ink motion-safe:animate-reveal"
          >
            {fieldErrors.username}
          </p>
        )}
      </section>

      <section>
        <label htmlFor="password" className="mb-2 block text-[13px] font-semibold text-ink-soft">
          Contraseña
        </label>
        <div className="relative">
          <LockKeyhole
            className="pointer-events-none absolute top-1/2 left-3.75 -translate-y-1/2 text-muted"
            size={18}
            aria-hidden="true"
          />
          <input
            ref={passwordRef}
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            aria-required="true"
            aria-invalid={Boolean(fieldErrors?.password)}
            aria-describedby={
              [fieldErrors?.password && "password-error", capsLock && "password-caps"]
                .filter(Boolean)
                .join(" ") || undefined
            }
            onKeyDown={handlePasswordKey}
            onKeyUp={handlePasswordKey}
            onBlur={() => setCapsLock(false)}
            className="w-full rounded-lg border border-line-control bg-surface py-3.5 pl-11 pr-12 text-ink caret-primary shadow-control transition hover:border-muted focus:border-focus focus:outline-2 focus:outline-offset-2 focus:outline-focus aria-invalid:border-danger aria-invalid:focus:outline-danger"
          />
          <button
            className="absolute inset-y-0 right-0 grid w-11 cursor-pointer place-items-center rounded-r-lg text-muted transition hover:text-primary focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-focus"
            type="button"
            onClick={() => setShowPassword((visible) => !visible)}
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            aria-pressed={showPassword}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {fieldErrors?.password && (
          <p
            id="password-error"
            className="mt-1.5 text-[13px] text-danger-ink motion-safe:animate-reveal"
          >
            {fieldErrors.password}
          </p>
        )}
        <p id="password-caps" className="mt-1.5 text-[13px] text-muted empty:mt-0" role="status">
          {capsLock && "Bloq Mayús está activado."}
        </p>
      </section>

      <button
        className="group mt-8 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3.5 text-white shadow-action transition hover:bg-primary-hover hover:shadow-action-hover motion-safe:active:translate-y-px active:shadow-control disabled:cursor-wait disabled:bg-primary/85 disabled:shadow-none focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-focus"
        type="submit"
        disabled={isPending}
      >
        {isPending ? (
          <>
            <LoaderCircle className="animate-spin" size={17} aria-hidden="true" />
            Iniciando sesión…
          </>
        ) : (
          <>
            Iniciar sesión
            <ArrowRight
              className="transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
              size={17}
              aria-hidden="true"
            />
          </>
        )}
      </button>

      <p className="text-center text-[13px] leading-5 text-pretty text-muted">
        ¿Te olvidaste la contraseña? Pedile una nueva al administrador.
      </p>
    </form>
  );
}
