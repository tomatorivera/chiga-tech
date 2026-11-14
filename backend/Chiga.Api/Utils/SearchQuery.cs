namespace Api.Utils;

public static class SearchQuery
{
  /// <summary>
  /// Limpia las búsquedas de cualquier request GET para:
  ///   1. Borrar los espacios
  ///   2. Escapar los comodines que puedan interferir con un LIKE
  /// </summary>
  /// <param name="query">Búsqueda del usuario, como llega del frontend</param>
  /// <returns>Búsqueda limpia o null si se buscó nada</returns>
  internal static string? Clean(string? query)
    => string.IsNullOrWhiteSpace(query)
        ? null
        : query.Trim().Replace("\\", "\\\\").Replace("%", "\\%").Replace("_", "\\_");
}
