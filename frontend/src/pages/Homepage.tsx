import { useSesion } from "../features/auth/hooks/useSesion";

export function Homepage() {
  const usuario = useSesion((state) => state.usuario!);

  return (
    <main className="px-6 py-14 sm:px-10 sm:py-20">
      <h1 className="font-display text-[clamp(2rem,4vw,3rem)] leading-tight font-semibold tracking-[-0.03em] text-ink">
        Hola, {usuario.nombre} {usuario.apellido}.
      </h1>
      <p className="mt-3 text-sm leading-6 text-muted">
        Ingresaste como <span className="font-semibold text-ink-soft">{usuario.nombreUsuario}</span>{" "}
        · {usuario.roles.join(", ")}
      </p>
    </main>
  );
}
