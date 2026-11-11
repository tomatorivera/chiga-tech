import type { NavbarGroup } from "./navbarSections";
import { NavbarItem } from "./NavbarItem";

export const NavbarSection = ({ id, title, items }: NavbarGroup) => {
  return (
    <div>
      <h2
        id={`navbar-${id}`}
        className="pt-1 pb-2 max-lg:sr-only text-sm leading-[19.6px] font-bold tracking-[0.01em] text-white/94"
      >
        {title}
      </h2>
      <ul aria-labelledby={`navbar-${id}`} className="flex flex-col gap-0.5">
        {items.map((item) => (
          <NavbarItem key={item.to} {...item} />
        ))}
      </ul>
    </div>
  );
};
