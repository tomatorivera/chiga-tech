namespace Api.Models.Dto;

public class UsuarioDTO
{
  public int Id { get; set; }
  public required string NombreUsuario { get; set; }
  public required string Nombre { get; set; }
  public required string Apellido { get; set; }
  public List<string> Roles { get; set; } = [];
  public List<string> Permisos { get; set; } = [];
}