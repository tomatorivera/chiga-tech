import { NavLink } from "react-router-dom";
import type { NavbarLink } from "./navbarSections";

export const NavbarItem = ({ icon: Icon, text, to }: NavbarLink) => {
  return (
    <li>
      <NavLink
        to={to}
        className={({ isActive }) =>
          `flex min-h-11 items-center gap-3 rounded-lg px-3 text-base transition-colors max-lg:min-h-15 max-lg:flex-col max-lg:justify-center max-lg:gap-1 max-lg:px-0.5 max-lg:py-2 max-lg:text-center max-lg:text-[13px] max-lg:leading-[1.15] focus-visible:-outline-offset-2 focus-visible:outline-2 ${
            isActive
              ? "bg-accent font-semibold text-brand focus-visible:outline-brand"
              : "text-white/82 hover:bg-white/8 hover:text-white focus-visible:outline-accent"
          }`
        }
      >
        <Icon aria-hidden="true" width={20} height={20} />
        {text}
      </NavLink>
    </li>
  );
};
