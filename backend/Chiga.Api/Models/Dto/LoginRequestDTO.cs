using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Api.Models.Dto;

public class LoginRequestDTO
{
  [JsonPropertyName("username")]
  [Display(Name = "nombre de usuario")]
  [Required(ErrorMessage = "El {0} es requerido")]
  [TrimmedStringLength(maximumLength: 50, MinimumLength = 4,ErrorMessage = "El {0} debe tener entre {1} y {2} caracteres")]
  public string NombreUsuario { get; set; } = "";

  [JsonPropertyName("password")]
  [Display(Name = "contraseña")]
  [Required(ErrorMessage = "La {0} es requerida")]
  public string Contrasena { get; set; } = "";
}