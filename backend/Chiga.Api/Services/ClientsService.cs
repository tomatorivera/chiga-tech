using Api.Models.Dto;
using Api.Repositories;
using Api.Utils;

namespace Api.Services;

public class ClientsService(IClientsRepository repository) : IClientsService
{
  public async Task<PagedResponse<ClienteDTO>> GetAll(string? query, PageRequest page, CancellationToken ct)
  {
    var cleanQuery = SearchQuery.Clean(query);
    var result = await repository.FindAll(cleanQuery, page, ct);

    return new PagedResponse<ClienteDTO>(
      [.. result.Data.Select(ClienteDTO.From)],
      result.Page,
      result.PageSize,
      result.Total
    );
  }
}