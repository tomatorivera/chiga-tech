using Api.Models.Dto;
using Api.Models.Entities;

namespace Api.Repositories;

public interface IClientsRepository
{
  Task<PagedResponse<Cliente>> FindAll(string? query, PageRequest page, CancellationToken ct = default);
}