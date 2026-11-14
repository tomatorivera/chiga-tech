namespace Api.Models.Entities;

public record Producto(
  int Id,
  string Nombre,
  string? Descripcion,
  Categoria Categoria,
  Ubicacion? Ubicacion,
  decimal Precio,
  int StockMinimo,
  int StockActual,
  string? Imagen,
  bool EstaActivo,
  string? MotivoBaja,
  string? Observacion,
  List<string> CodigosBarra
);
