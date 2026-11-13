namespace Api.Models.Dto;

public record PagedResponse<T>(IReadOnlyList<T> Data, int Page, int PageSize, int Total);
