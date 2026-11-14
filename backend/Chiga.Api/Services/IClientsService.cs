using Api.Models.Dto;

namespace Api.Services;

public interface IClientsService
{
  Task<PagedResponse<ClienteDTO>> GetAll(string? query, PageRequest page, CancellationToken ct = default);
}