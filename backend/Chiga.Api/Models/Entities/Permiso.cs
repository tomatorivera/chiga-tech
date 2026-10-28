namespace Api.Models.Entities;

public class Permiso
{
  public int Id { get; set; }
  public required string Modulo { get; set; }
  public string? Descripcion { get; set; }
}