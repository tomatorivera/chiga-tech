using Api.Models.Entities;

namespace Api.Models.Dto;

public record ProductoDTO(
  int Id,
  string Nombre,
  string Categoria,
  IReadOnlyList<string> CodigosBarras,
  decimal PrecioUnitario,
  int StockActual,
  int StockMinimo,
  EstadoProducto Estado,
  string? MotivoBaja
)
{
  public static ProductoDTO From(Producto producto) => new(
    producto.Id,
    producto.Nombre,
    producto.Categoria.Nombre,
    producto.CodigosBarra,
    producto.Precio,
    producto.StockActual,
    producto.StockMinimo,
    producto.EstaActivo ? EstadoProducto.ACTIVO : EstadoProducto.INACTIVO,
    producto.MotivoBaja
  );
}
