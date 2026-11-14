namespace Api.Models.Entities;

public record Categoria(
  int Id,
  string Nombre,
  string? Descripcion,
  Categoria? Familia,
  bool EstaActiva
);
