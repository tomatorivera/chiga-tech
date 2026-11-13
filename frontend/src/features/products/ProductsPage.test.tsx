// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { productosDeEjemplo } from "./services/productos.mock-data";
import { productosService } from "./services/productos.service";
import { ProductsPage } from "./ProductsPage";

describe("ProductsPage", () => {
  beforeEach(() => {
    vi.spyOn(productosService, "buscar").mockResolvedValue(productosDeEjemplo);
    render(<ProductsPage />);
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("muestra productos agrupados por familia y categoría", async () => {
    expect(await screen.findByRole("heading", { name: "Hardware" })).not.toBeNull();
    expect(screen.getByRole("heading", { name: "CPUs" })).not.toBeNull();
    expect(screen.getByRole("button", { name: "Ver detalles de AMD Ryzen 5 7600" })).not.toBeNull();
  });

  it("abre el detalle con una fila y lo cierra con la X o Escape", async () => {
    const nombreProducto = "Ver detalles de AMD Ryzen 5 7600";
    const filaProducto = await screen.findByRole("button", { name: nombreProducto });
    fireEvent.click(filaProducto);
    expect(screen.getByRole("complementary", { name: "AMD Ryzen 5 7600" })).not.toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Cerrar el panel" }));
    await waitFor(() => {
      expect(screen.queryByRole("complementary", { name: "AMD Ryzen 5 7600" })).toBeNull();
      expect(document.activeElement).toBe(filaProducto);
    });

    fireEvent.click(filaProducto);
    fireEvent.keyDown(window, { key: "Escape" });
    await waitFor(() =>
      expect(screen.queryByRole("complementary", { name: "AMD Ryzen 5 7600" })).toBeNull(),
    );

    fireEvent.click(screen.getByRole("button", { name: nombreProducto }));
    fireEvent.click(screen.getByRole("button", { name: nombreProducto }));
    await waitFor(() =>
      expect(screen.queryByRole("complementary", { name: "AMD Ryzen 5 7600" })).toBeNull(),
    );
  });

  it("abre el detalle automáticamente al buscar un código de barras exacto", async () => {
    await screen.findByRole("button", { name: "Ver detalles de AMD Ryzen 5 7600" });
    fireEvent.change(screen.getByRole("searchbox", { name: "Buscar producto" }), {
      target: { value: "7791234500011" },
    });

    await waitFor(() =>
      expect(screen.getByRole("complementary", { name: "AMD Ryzen 5 7600" })).not.toBeNull(),
    );
  });
});
