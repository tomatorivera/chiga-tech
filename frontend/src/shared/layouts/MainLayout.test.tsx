// @vitest-environment jsdom
import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { useSesion } from "../../features/auth/hooks/useSesion";
import { MainLayout } from "./MainLayout";

function renderAt(path: string) {
  const router = createMemoryRouter(
    [
      {
        element: <MainLayout />,
        children: [
          { path: "/inicio", element: <h1 tabIndex={-1}>Inicio</h1> },
          { path: "/ventas", element: <h1 tabIndex={-1}>Ventas</h1> },
          { path: "/sin-titulo", element: <p>Sin título</p> },
        ],
      },
    ],
    { initialEntries: [path] },
  );
  render(<RouterProvider router={router} />);
  return router;
}

describe("MainLayout", () => {
  beforeEach(() => {
    useSesion.getState().login({
      id: 1,
      nombreUsuario: "lbenitez",
      nombre: "Lucas",
      apellido: "Benítez",
      roles: ["Vendedor"],
      permisos: [],
    });
  });

  afterEach(() => {
    cleanup();
    useSesion.getState().logout();
  });

  it("ofrece saltar el menú hasta el contenido", () => {
    renderAt("/inicio");

    const skipLink = screen.getByRole("link", { name: "Saltar al contenido" });
    expect(skipLink.getAttribute("href")).toBe("#contenido");
    expect(screen.getByRole("main").id).toBe("contenido");
  });

  it("no mueve el foco en la primera carga", () => {
    renderAt("/inicio");

    expect(document.activeElement).toBe(document.body);
  });

  it("lleva el foco al título de la página al navegar", async () => {
    const router = renderAt("/inicio");

    await act(() => router.navigate("/ventas"));

    expect(document.activeElement).toBe(screen.getByRole("heading", { name: "Ventas" }));
  });

  it("lleva el foco al contenido si la página no tiene título", async () => {
    const router = renderAt("/inicio");

    await act(() => router.navigate("/sin-titulo"));

    expect(document.activeElement).toBe(screen.getByRole("main"));
  });
});
