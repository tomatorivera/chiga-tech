import { Wordmark } from "../Wordmark";
import { sections } from "./navbarSections";
import { NavbarSection } from "./NavbarSection";
import { NavbarUser } from "./NavbarUser";
import { hasMinimumRole } from "../../../features/users/utils/role.utils";
import { useSesion } from "../../../features/auth/hooks/useSesion";

export const Navbar = () => {
  const user = useSesion((state) => state.usuario);
  const visibleSections = Object.entries(sections).filter(([, section]) =>
    hasMinimumRole(user?.roles ?? [], section.visibleFrom),
  );

  return (
    <aside className="sticky top-0 flex h-dvh w-full flex-col bg-brand px-3 pt-5 pb-4 max-lg:px-2">
      <Wordmark className="px-3 pb-5 text-canvas max-lg:justify-center max-lg:px-0 max-lg:[&>span:last-child]:hidden" />

      <nav
        aria-label="Principal"
        className="scroll-shadows -mx-3 flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-3 pb-4 max-lg:-mx-2 max-lg:gap-3 max-lg:px-2"
      >
        {visibleSections.map(([id, section]) => (
          <NavbarSection key={id} id={id} {...section} />
        ))}
      </nav>

      <NavbarUser />
    </aside>
  );
};
