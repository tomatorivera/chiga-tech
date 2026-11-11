import { useEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Navbar } from "../components/navbar/Navbar";

export const MainLayout = () => {
  const mainRef = useRef<HTMLElement>(null);
  const { pathname, key } = useLocation();

  // Al navegar dentro de la app el lector no anuncia la página nueva: se lleva el foco a su título.
  // Depende solo de pathname: key cambia en cada navegación, aunque no cambie la página.
  useEffect(() => {
    if (key === "default") {
      return;
    }

    const main = mainRef.current;
    (main?.querySelector<HTMLElement>("h1[tabindex='-1']") ?? main)?.focus();
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <div className="grid min-h-dvh grid-cols-[112px_minmax(0,1fr)] bg-canvas lg:grid-cols-[240px_minmax(0,1fr)]">
      <a
        className="fixed top-3 left-3 z-20 translate-y-[-160%] rounded-md bg-surface px-3.5 py-2.5 text-brand focus:translate-y-0 focus:outline-2 focus:outline-offset-2 focus:outline-accent"
        href="#contenido"
      >
        Saltar al contenido
      </a>

      <Navbar />

      <main
        ref={mainRef}
        id="contenido"
        tabIndex={-1}
        className="flex min-w-0 flex-col outline-none"
      >
        <Outlet />
      </main>
    </div>
  );
};
