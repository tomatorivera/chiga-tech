import { describe, expect, it } from "vitest";
import { productosDeEjemplo } from "../services/productos.mock-data";
import {
  agruparPorFamilia,
  filtrarProductos,
  formatoPrecio,
  obtenerEstadoStock,
  obtenerTextoStock,
} from "./productos.utils";

describe("obtenerEstadoStock", () => {
  it.each([
    [-1, 2, "negativo"],
    [0, 2, "sinStock"],
    [1, 2, "bajo"],
    [2, 2, "bajo"],
    [3, 2, "normal"],
  ] as const)("clasifica stock %i con mínimo %i", (stock, minimo, estado) => {
    expect(obtenerEstadoStock(stock, minimo)).toBe(estado);
  });

  it.each([
    [-1, "Faltan 1"],
    [0, "Sin stock"],
    [1, "Queda 1"],
    [4, "Quedan 4"],
  ])("describe el stock %i en palabras", (stock, texto) => {
    expect(obtenerTextoStock(stock)).toBe(texto);
  });
});

describe("filtrarProductos", () => {
  it("combina familia y estado, y no incluye productos inactivos en stock bajo", () => {
    const productos = filtrarProductos(productosDeEjemplo, {
      familia: "Hardware",
      estado: "Stock bajo",
    });

    expect(productos.map((producto) => producto.nombre)).toEqual([
      "AMD Radeon RX 7600",
      "Corsair Vengeance 32GB DDR5",
      "Kingston NV3 2TB",
      "Fuente Cooler Master 650W",
    ]);
  });

  it("filtra productos inactivos sin depender del stock", () => {
    const productos = filtrarProductos(productosDeEjemplo, {
      familia: "",
      estado: "Inactivos",
    });

    expect(productos.map((producto) => producto.nombre)).toEqual([
      "Intel Core i3-12100F",
      "Mouse Genius DX-110",
    ]);
  });
});

describe("formatoPrecio", () => {
  it("omite decimales en importes enteros y conserva los centavos", () => {
    expect(formatoPrecio(320000)).toContain("320.000");
    expect(formatoPrecio(320000)).not.toContain(",00");
    expect(formatoPrecio(1500.5)).toContain("1.500,50");
  });
});

describe("agruparPorFamilia", () => {
  it("ordena familias y categorías y cuenta solo el stock bajo activo", () => {
    const grupos = agruparPorFamilia(productosDeEjemplo);

    expect(grupos.map(({ nombre }) => nombre)).toEqual(["Hardware", "Periféricos"]);
    expect(grupos[0].categorias.map(({ nombre }) => nombre)).toEqual([
      "Almacenamiento",
      "CPUs",
      "Fuentes",
      "Gabinetes",
      "GPUs",
      "Memorias RAM",
    ]);
    expect(grupos[0].cantidadStockBajo).toBe(4);
  });
});
