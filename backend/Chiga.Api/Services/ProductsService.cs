using Api.Models.Dto;
using Api.Repositories;

namespace Api.Services;

public class ProductsService(IProductsRepository repository) : IProductsService
{
  public async Task<PagedResponse<ProductoDTO>> GetAll(string? query, PageRequest page, CancellationToken ct)
  {
    var cleanQuery = GetCleanQuery(query);
    var result = await repository.FindAll(cleanQuery, page, ct);
    
    return new PagedResponse<ProductoDTO>(
      [.. result.Data.Select(ProductoDTO.From)],
      result.Page,
      result.PageSize,
      result.Total
    );
  }

  // Lo extraigo de GetAll() para hacerle tests unitarios
  // Es muy poca lógica pero si algo se cambia y se rompe, daña toda una consulta
  internal static string? GetCleanQuery(string? query)
    => string.IsNullOrWhiteSpace(query) 
        ? null 
        : query.Trim().Replace("\\", "\\\\").Replace("%", "\\%").Replace("_", "\\_");
}