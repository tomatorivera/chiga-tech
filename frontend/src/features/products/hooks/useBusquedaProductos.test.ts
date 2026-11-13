// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { productosDeEjemplo } from "../services/productos.mock-data";
import { productosService } from "../services/productos.service";
import { useBusquedaProductos } from "./useBusquedaProductos";

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe("useBusquedaProductos", () => {
  it("espera 250 ms antes de buscar lo que se escribió", async () => {
    vi.useFakeTimers();
    const buscar = vi.spyOn(productosService, "buscar").mockResolvedValue(productosDeEjemplo);
    const { result } = renderHook(() => useBusquedaProductos());

    act(() => result.current.setBusqueda("ryzen"));
    await act(async () => vi.advanceTimersByTimeAsync(249));
    expect(buscar).not.toHaveBeenCalled();

    await act(async () => vi.advanceTimersByTimeAsync(1));

    expect(buscar).toHaveBeenCalledWith("ryzen");
    expect(result.current.productos).toEqual(productosDeEjemplo);
  });

  it("ignora una respuesta anterior cuando cambia la búsqueda", async () => {
    vi.useFakeTimers();
    let resolverAnterior: ((productos: typeof productosDeEjemplo) => void) | undefined;
    const buscar = vi
      .spyOn(productosService, "buscar")
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolverAnterior = resolve;
          }),
      )
      .mockResolvedValueOnce([productosDeEjemplo[0]]);
    const { result } = renderHook(() => useBusquedaProductos());

    act(() => result.current.setBusqueda("primera"));
    await act(async () => vi.advanceTimersByTimeAsync(250));

    act(() => result.current.setBusqueda("segunda"));
    await act(async () => vi.advanceTimersByTimeAsync(250));

    await act(async () => resolverAnterior?.(productosDeEjemplo.slice(1)));
    expect(result.current.productos).toEqual([productosDeEjemplo[0]]);
    expect(buscar).toHaveBeenCalledTimes(2);
  });
});
