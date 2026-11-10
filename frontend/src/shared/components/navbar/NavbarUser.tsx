import { useActionState } from "react";
import { useSesion } from "../../../features/auth/hooks/useSesion";
import { logoutAction } from "../../../features/auth/actions/logout.action";
import { CircleAlert, LoaderCircle, LogOut } from "lucide-react";

export const NavbarUser = () => {
  const usuario = useSesion((state) => state.usuario!);
  const [state, formAction, isPending] = useActionState(logoutAction, { status: "idle" });

  const message = !isPending && state.status === "error" ? state.message : undefined;
  const nameParts = [usuario.nombre, usuario.apellido].map((part) => part.trim()).filter(Boolean);
  const fullName = nameParts.join(" ") || "Usuario";
  const firstName = nameParts[0] ?? "Usuario";
  const initials = (
    nameParts.length > 0 ? nameParts.map((part) => part[0]).join("") : "U"
  ).toUpperCase();

  return (
    <div className="flex flex-col gap-3 rounded-xl bg-white/7 p-3 max-lg:gap-2 max-lg:p-2">
      <div className="flex items-center gap-3 max-lg:flex-col max-lg:gap-1 max-lg:pt-1 max-lg:text-center">
        <span
          className="grid size-10 shrink-0 place-items-center rounded-full bg-accent text-sm font-bold text-brand"
          aria-hidden="true"
        >
          {initials}
        </span>
        <p className="min-w-0 max-lg:w-full">
          <span className="block truncate font-semibold text-white">
            <span className="max-lg:sr-only">{fullName}</span>
            <span className="lg:hidden" aria-hidden="true">
              {firstName}
            </span>
          </span>
          <span className="block text-sm text-white/72 max-lg:text-[13px]">
            {usuario.roles.join(", ")}
          </span>
        </p>
      </div>

      {message && (
        <p className="flex items-start gap-2 text-[13px] leading-5 text-[#ffb4a6]" role="alert">
          <CircleAlert className="mt-0.5 shrink-0" size={16} aria-hidden="true" />
          {message}
        </p>
      )}

      <form action={formAction}>
        <span role="status" className="sr-only">
          {isPending ? "Cerrando sesión…" : ""}
        </span>
        <button
          type="submit"
          disabled={isPending}
          className={`flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-white/24 text-white transition-colors hover:bg-white/8 disabled:cursor-wait disabled:text-white/62 max-lg:min-h-14 max-lg:flex-col max-lg:gap-0.5 max-lg:px-1 max-lg:py-1.5 max-lg:text-[13px] focus-visible:-outline-offset-2 focus-visible:outline-2 focus-visible:outline-accent`}
        >
          {isPending ? (
            <LoaderCircle className="animate-spin" size={18} aria-hidden="true" />
          ) : (
            <LogOut size={18} aria-hidden="true" />
          )}
          {isPending ? "Cerrando..." : "Cerrar sesión"}
        </button>
      </form>
    </div>
  );
};
