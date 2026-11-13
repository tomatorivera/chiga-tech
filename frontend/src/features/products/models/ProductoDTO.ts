export type EstadoProducto = "Activo" | "Inactivo";

export interface UbicacionDTO {
  sector: string;
  estante: string;
}

export interface ProductoDTO {
  id: number;
  nombre: string;
  familia: string;
  categoria: string;
  codigosBarras: string[];
  costoUnitario: number;
  precioUnitario: number;
  stockActual: number;
  stockMinimo: number;
  ubicacion: UbicacionDTO | null;
  estado: EstadoProducto;
  motivoBaja: string | null;
}
