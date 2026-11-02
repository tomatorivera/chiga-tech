namespace Api.Models.Entities;

public class Rol
{
  public int Id { get; set; }
  public required string Nombre { get; set; }
  public string? Descripcion { get; set; }
  public List<Permiso> Permisos { get; set; } = new List<Permiso>();
}