namespace Api.Models;

public class Usuario
{
  public int Id { get; set; }
  public required string NombreUsuario { get; set; }
  public required string Nombre { get; set; }
  public required string Apellido { get; set; }
  public string? Correo { get; set; }
  public string? CodigoAutorizacion { get; set; }
  public bool Estado { get; set; } = true;
  public List<Rol> Roles { get; set; } = new List<Rol>();
}