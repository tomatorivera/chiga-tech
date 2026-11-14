using Api.Models.Dto;

namespace Api.Services;

public interface IProductsService
{
  public Task<PagedResponse<ProductoDTO>> GetAll(string? query, PageRequest page, CancellationToken ct);

  public Task<ProductoDTO?> GetByBarcode(string barcode, CancellationToken ct);
}