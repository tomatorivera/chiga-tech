using Api.Models.Dto;
using Api.Repositories;
using Api.Utils;

namespace Api.Services;

public class ProductsService(IProductsRepository repository) : IProductsService
{
  public async Task<PagedResponse<ProductoDTO>> GetAll(string? query, PageRequest page, CancellationToken ct)
  {
    var cleanQuery = SearchQuery.Clean(query);
    var result = await repository.FindAll(cleanQuery, page, ct);
    
    return new PagedResponse<ProductoDTO>(
      [.. result.Data.Select(ProductoDTO.From)],
      result.Page,
      result.PageSize,
      result.Total
    );
  }
  
  public async Task<ProductoDTO?> GetByBarcode(string barcode, CancellationToken ct)
  {
    var product = await repository.FindByCodigo(barcode.Trim(), ct);

    return product is not null
      ? ProductoDTO.From(product)
      : null;
  }
}