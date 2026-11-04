// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { AxiosError, type AxiosResponse } from "axios";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { authService } from "../services/auth.service";
import { LoginForm } from "./LoginForm";

const login = vi.spyOn(authService, "login");

function credencialesInvalidas(): AxiosError {
  const response = { status: 401, data: { detail: "El usuario o la contraseña son incorrectos." } };
  return new AxiosError("error", undefined, undefined, undefined, response as AxiosResponse);
}

function completar(username: string, password: string) {
  fireEvent.change(screen.getByLabelText("Usuario"), { target: { value: username } });
  fireEvent.change(screen.getByLabelText("Contraseña"), { target: { value: password } });
  fireEvent.click(screen.getByRole("button", { name: "Iniciar sesión" }));
}

describe("LoginForm", () => {
  beforeEach(() => {
    login.mockReset();
    login.mockRejectedValue(credencialesInvalidas());
    render(<LoginForm />);
  });

  afterEach(cleanup);

  it("pone el foco en el usuario al abrirse", () => {
    expect(document.activeElement).toBe(screen.getByLabelText("Usuario"));
  });

  it("muestra el error general dentro del formulario, antes de los campos", async () => {
    completar("vendedor", "incorrecta");

    const alerta = await screen.findByText("El usuario o la contraseña son incorrectos.");
    const contenedor = alerta.closest("[role=alert]")!;
    expect(contenedor.closest("form")).not.toBeNull();
    expect(
      contenedor.compareDocumentPosition(screen.getByLabelText("Usuario")) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("conserva el usuario y la contraseña después de un error, sin exponerla en el atributo value", async () => {
    completar("vendedor", "incorrecta");
    await screen.findByText("El usuario o la contraseña son incorrectos.");

    const password = screen.getByLabelText<HTMLInputElement>("Contraseña");
    expect(screen.getByLabelText<HTMLInputElement>("Usuario").value).toBe("vendedor");
    expect(password.value).toBe("incorrecta");
    expect(password.getAttribute("value")).toBeNull();
  });

  it("pone el foco en la contraseña ante un error general", async () => {
    completar("vendedor", "incorrecta");

    await screen.findByText("El usuario o la contraseña son incorrectos.");
    expect(document.activeElement).toBe(screen.getByLabelText("Contraseña"));
  });

  it("pone el foco en el primer campo con error", async () => {
    completar("vendedor", "");

    await screen.findByText("La contraseña es requerida");
    expect(document.activeElement).toBe(screen.getByLabelText("Contraseña"));
    expect(login).not.toHaveBeenCalled();
  });

  it("avisa mientras Bloq Mayús está activado en la contraseña", () => {
    const password = screen.getByLabelText("Contraseña");

    fireEvent.keyUp(password, { key: "A", modifierCapsLock: true });
    expect(screen.getByRole("status")).toHaveProperty("textContent", "Bloq Mayús está activado.");

    fireEvent.blur(password);
    expect(screen.queryByRole("status")).toBeNull();
  });
});
