using System.ComponentModel.DataAnnotations;

namespace Api.Models.Dto;

public class PageRequest
{
  [Range(1, int.MaxValue)]
  public int Page { get; init; } = 1;

  [Range(1, 500)]
  public int PageSize { get; init; } = 20;
}
