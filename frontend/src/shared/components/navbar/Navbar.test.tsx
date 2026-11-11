// @vitest-environment jsdom
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { useSesion } from "../../../features/auth/hooks/useSesion";
import type { UsuarioDTO } from "../../../features/auth/models/UsuarioDTO";
import type { Role } from "../../../features/users/models/Role";
import { Navbar } from "./Navbar";

function loginWithRoles(roles: Role[]) {
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

function renderNavbar(path = "/inicio") {
  const router = createMemoryRouter([{ path: "*", element: <Navbar /> }], {
    initialEntries: [path],
  });
  render(<RouterProvider router={router} />);
}

const sectionTitles = () =>
  within(screen.getByRole("navigation", { name: "Principal" }))
    .getAllByRole("heading", { level: 2 })
    .map((heading) => heading.textContent);

describe("Navbar", () => {
  afterEach(() => {
    cleanup();
    useSesion.getState().logout();
  });

  it.each<[Role, string[]]>([
    ["Vendedor", ["Mostrador"]],
    ["Supervisor", ["Mostrador", "Ventas", "Catálogo"]],
    ["Administrador", ["Mostrador", "Ventas", "Catálogo", "Administración"]],
    ["Dueño", ["Mostrador", "Ventas", "Catálogo", "Administración", "Sistema"]],
  ])("muestra a %s solo las secciones visibles desde su rol", (role, expected) => {
    loginWithRoles([role]);
    renderNavbar();

    expect(sectionTitles()).toEqual(expected);
  });

  it("muestra las secciones del rol más alto de un usuario con varios roles", () => {
    loginWithRoles(["Vendedor", "Administrador"]);
    renderNavbar();

    expect(sectionTitles()).toEqual(["Mostrador", "Ventas", "Catálogo", "Administración"]);
  });

  it("no muestra secciones a un usuario con un rol desconocido", () => {
    loginWithRoles(["Invitado"] as unknown as Role[]);
    renderNavbar();

    const nav = screen.getByRole("navigation", { name: "Principal" });
    expect(within(nav).queryAllByRole("heading")).toHaveLength(0);
  });

  it("nombra cada lista de links con el título de su sección", () => {
    loginWithRoles(["Supervisor"]);
    renderNavbar();

    const catalogo = screen.getByRole("list", { name: "Catálogo" });
    const links = within(catalogo)
      .getAllByRole("link")
      .map((link) => [link.textContent, link.getAttribute("href")]);

    expect(links).toEqual([
      ["Productos", "/productos"],
      ["Categorías", "/categorias"],
      ["Stock", "/stock"],
      ["Proveedores", "/proveedores"],
      ["Listas de precios", "/precios"],
    ]);
  });

  it("marca como actual solo el link de la ruta en la que está el usuario", () => {
    loginWithRoles(["Supervisor"]);
    renderNavbar("/productos");

    const current = screen
      .getAllByRole("link")
      .filter((link) => link.getAttribute("aria-current") === "page");

    expect(current.map((link) => link.textContent)).toEqual(["Productos"]);
  });

  it("muestra el usuario de la sesión y el botón para salir", () => {
    loginWithRoles(["Vendedor"]);
    renderNavbar();

    expect(screen.getByText("Ana Pérez")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Cerrar sesión" })).toBeTruthy();
  });
});
