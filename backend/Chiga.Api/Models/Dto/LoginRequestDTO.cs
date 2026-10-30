using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Api.Models.Dto;

public class LoginRequestDTO
{
  [JsonPropertyName("username")]
  [Required(ErrorMessage = "El nombre de usuario es requerido")]
  [StringLength(maximumLength: 50, MinimumLength = 4,ErrorMessage = "El nombre de usuario debe tener entre {2} y {1} caracteres")]
  public string NombreUsuario { get; set; } = "";

  [JsonPropertyName("password")]
  [Required(ErrorMessage = "La contraseña es requerida")]
  public string Contrasena { get; set; } = "";
}