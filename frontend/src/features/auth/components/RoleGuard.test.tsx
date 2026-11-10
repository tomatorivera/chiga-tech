// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { useSesion } from "../hooks/useSesion";
import type { UsuarioDTO } from "../models/UsuarioDTO";
import type { Role } from "../../users/models/Role";
import { RoleGuard } from "./RoleGuard";

function loginWithRoles(roles: string[]) {
  const usuario: UsuarioDTO = {
    id: 1,
    nombreUsuario: "usuario",
    nombre: "Ana",
    apellido: "Pérez",
    roles,
    permisos: [],
  };
  useSesion.getState().login(usuario);
}

function renderGuard(minimumRole: Role) {
  const router = createMemoryRouter(
    [
      { path: "/login", element: <p>login</p> },
      { path: "/forbidden", element: <p>forbidden</p> },
      {
        element: <RoleGuard minimumRole={minimumRole} />,
        children: [{ path: "/seccion", element: <p>seccion</p> }],
      },
    ],
    { initialEntries: ["/seccion"] },
  );
  render(<RouterProvider router={router} />);
  return router;
}

describe("RoleGuard", () => {
  afterEach(() => {
    cleanup();
    useSesion.getState().logout();
  });

  it("redirige a /login si no hay usuario", () => {
    const router = renderGuard("Vendedor");

    expect(router.state.location.pathname).toBe("/login");
  });

  it.each<[Role, Role]>([
    ["Vendedor", "Vendedor"],
    ["Supervisor", "Vendedor"],
    ["Supervisor", "Supervisor"],
    ["Administrador", "Supervisor"],
    ["Administrador", "Administrador"],
    ["Dueño", "Supervisor"],
    ["Dueño", "Administrador"],
    ["Dueño", "Dueño"],
  ])("deja pasar a %s cuando el mínimo es %s", (role, minimumRole) => {
    loginWithRoles([role]);
    const router = renderGuard(minimumRole);

    expect(router.state.location.pathname).toBe("/seccion");
    expect(screen.getByText("seccion")).toBeTruthy();
  });

  it.each<[Role, Role]>([
    ["Vendedor", "Supervisor"],
    ["Vendedor", "Dueño"],
    ["Supervisor", "Administrador"],
    ["Administrador", "Dueño"],
  ])("redirige a /forbidden a %s cuando el mínimo es %s", (role, minimumRole) => {
    loginWithRoles([role]);
    const router = renderGuard(minimumRole);

    expect(router.state.location.pathname).toBe("/forbidden");
  });

  it("deja pasar a un usuario con varios roles si alguno alcanza el mínimo", () => {
    loginWithRoles(["Vendedor", "Administrador"]);
    const router = renderGuard("Administrador");

    expect(router.state.location.pathname).toBe("/seccion");
  });

  it("redirige a /forbidden a un usuario con varios roles si ninguno alcanza el mínimo", () => {
    loginWithRoles(["Vendedor", "Supervisor"]);
    const router = renderGuard("Administrador");

    expect(router.state.location.pathname).toBe("/forbidden");
  });

  it("redirige a /forbidden a un usuario con un rol desconocido", () => {
    loginWithRoles(["Invitado"]);
    const router = renderGuard("Vendedor");

    expect(router.state.location.pathname).toBe("/forbidden");
  });

  it("redirige a /forbidden a un usuario sin roles", () => {
    loginWithRoles([]);
    const router = renderGuard("Vendedor");

    expect(router.state.location.pathname).toBe("/forbidden");
  });
});
