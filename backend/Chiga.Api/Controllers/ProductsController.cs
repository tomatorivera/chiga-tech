using Api.Models.Dto;
using Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[Route("productos")]
[Authorize]
public class ProductsController(IProductsService productService) : ControllerBase
{
  [HttpGet]
  public async Task<ActionResult<PagedResponse<ProductoDTO>>> GetAll(
    [FromQuery] string? query, 
    [FromQuery] PageRequest pagination, 
    CancellationToken ct = default
  )
    => await productService.GetAll(query, pagination, ct);

  [HttpGet("codigo/{codigo}")]
  public async Task<ActionResult<ProductoDTO>> GetByBarcode(string codigo, CancellationToken ct = default)
  {
    var result = await productService.GetByBarcode(codigo, ct);
    if (result is null)
      return Problem(
        statusCode: StatusCodes.Status404NotFound,
        title: "Producto no encontrado",
        detail: $"No hay ningún producto con el código \"{codigo}\""
      );

    return Ok(result);
  }
}