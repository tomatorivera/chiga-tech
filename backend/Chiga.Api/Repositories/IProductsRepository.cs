using Api.Models.Dto;
using Api.Models.Entities;

namespace Api.Repositories;

public interface IProductsRepository
{
  Task<PagedResponse<Producto>> FindAll(string? query, PageRequest page, CancellationToken ct = default);
  Task<Producto?> FindByCodigo(string codigo, CancellationToken ct = default);
}
