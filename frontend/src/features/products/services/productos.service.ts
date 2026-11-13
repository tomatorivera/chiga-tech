import type { ProductoDTO } from "../models/ProductoDTO";
import { productosDeEjemplo } from "./productos.mock-data";

export interface IProductosService {
  buscar: (busqueda?: string) => Promise<ProductoDTO[]>;
}

const esperarRespuesta = () => new Promise<void>((resolve) => setTimeout(resolve, 350));

export const productosMockService: IProductosService = {
  buscar: async (busqueda = ""): Promise<ProductoDTO[]> => {
    await esperarRespuesta();

    const texto = busqueda.trim().toLocaleLowerCase("es-AR");

    return productosDeEjemplo
      .filter(
        (producto) =>
          !texto ||
          producto.nombre.toLocaleLowerCase("es-AR").includes(texto) ||
          producto.codigosBarras.some((codigo) => codigo.toLocaleLowerCase("es-AR") === texto),
      )
      .sort((a, b) => a.nombre.localeCompare(b.nombre, "es", { sensitivity: "base" }))
      .slice(0, 20);
  },
};

export const productosService: IProductosService = productosMockService;
