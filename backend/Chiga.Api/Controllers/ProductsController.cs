using Api.Models.Dto;
using Api.Models.Entities;
using Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[Route("productos")]
public class ProductsController(IProductsService productService) : ControllerBase
{
  [HttpGet]
  [Authorize]
  public async Task<ActionResult<PagedResponse<ProductoDTO>>> GetAll(
    [FromQuery] string? query, 
    [FromQuery] PageRequest pagination, 
    CancellationToken ct = default
  )
    => await productService.GetAll(query, pagination, ct);
}