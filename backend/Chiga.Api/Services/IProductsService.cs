using Api.Models.Dto;
using Api.Models.Entities;

namespace Api.Services;

public interface IProductsService
{
  public Task<PagedResponse<ProductoDTO>> GetAll(string? query, PageRequest page, CancellationToken ct);
}