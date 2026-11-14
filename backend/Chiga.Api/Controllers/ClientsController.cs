using Api.Models.Dto;
using Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[Route("clientes")]
[Authorize]
public class ClientsController(IClientsService clientsService) : ControllerBase
{
  [HttpGet]
  public async Task<ActionResult<PagedResponse<ClienteDTO>>> GetAll(
    [FromQuery] string? query,
    [FromQuery] PageRequest pagination,
    CancellationToken ct = default
  )
    => await clientsService.GetAll(query, pagination, ct);
}