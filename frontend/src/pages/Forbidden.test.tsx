// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { useSesion } from "../features/auth/hooks/useSesion";
import { RoleGuard } from "../features/auth/components/RoleGuard";
import { Forbidden } from "./Forbidden";

function renderFrom(initialEntries: string[]) {
  const router = createMemoryRouter(
    [
      { path: "/inicio", element: <p>inicio</p> },
      { path: "/ventas", element: <p>ventas</p> },
      { path: "/forbidden", element: <Forbidden /> },
      {
        element: <RoleGuard minimumRole="Administrador" />,
        children: [{ path: "/usuarios", element: <p>usuarios</p> }],
      },
    ],
    { initialEntries, initialIndex: initialEntries.length - 1 },
  );
  render(<RouterProvider router={router} />);
  return router;
}

describe("Forbidden", () => {
  beforeEach(() => {
    useSesion.getState().login({
      id: 1,
      nombreUsuario: "lbenitez",
      nombre: "Lucas",
      apellido: "Benítez",
      roles: ["Vendedor", "Supervisor"],
      permisos: [],
    });
  });

  afterEach(() => {
    cleanup();
    useSesion.getState().logout();
  });

  it("nombra la sección a la que no se pudo entrar", () => {
    renderFrom(["/usuarios"]);

    expect(
      screen.getByRole("heading", { name: "No tenés permiso para entrar a Usuarios" }),
    ).toBeTruthy();
  });

  it("habla de la sección en general si se abre sin venir de una ruta protegida", () => {
    renderFrom(["/forbidden"]);

    expect(
      screen.getByRole("heading", { name: "No tenés permiso para entrar a esta sección" }),
    ).toBeTruthy();
  });

  it("muestra el usuario de la sesión y cada uno de sus roles", () => {
    renderFrom(["/usuarios"]);

    expect(screen.getByText("Lucas Benítez")).toBeTruthy();
    const roles = screen.getByRole("list", { name: "Tus roles" });
    expect(roles.textContent).toBe("VendedorSupervisor");
  });

  it("vuelve a la página anterior", () => {
    const router = renderFrom(["/ventas", "/usuarios"]);

    fireEvent.click(screen.getByRole("button", { name: "Volver a la página anterior" }));

    expect(router.state.location.pathname).toBe("/ventas");
  });

  it("ofrece ir al inicio si no hay una página anterior en el sistema", () => {
    const router = renderFrom(["/usuarios"]);

    fireEvent.click(screen.getByRole("button", { name: "Ir al inicio" }));

    expect(router.state.location.pathname).toBe("/inicio");
  });

  it("titula la pestaña del navegador", () => {
    renderFrom(["/usuarios"]);

    expect(document.title).toBe("Sin acceso - Chiga Tech");
  });
});
