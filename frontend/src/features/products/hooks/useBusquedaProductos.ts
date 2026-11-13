import { useEffect, useState } from "react";
import { getErrorMessage } from "../../../shared/lib/http";
import type { ProductoDTO } from "../models/ProductoDTO";
import { productosService } from "../services/productos.service";

export function useBusquedaProductos() {
  const [busqueda, setBusqueda] = useState("");
  const [productos, setProductos] = useState<ProductoDTO[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let vigente = true;
    const timeoutId = window.setTimeout(
      () => {
        setCargando(true);
        setError(null);

        void productosService
          .buscar(busqueda)
          .then((resultado) => {
            if (vigente) setProductos(resultado);
          })
          .catch((cause: unknown) => {
            if (vigente) setError(getErrorMessage(cause));
          })
          .finally(() => {
            if (vigente) setCargando(false);
          });
      },
      busqueda ? 250 : 0,
    );

    return () => {
      vigente = false;
      window.clearTimeout(timeoutId);
    };
  }, [busqueda]);

  return {
    busqueda,
    setBusqueda,
    productos,
    cargando,
    error,
  };
}
