using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Api.Models.Dto;

public class LoginRequestDTO
{
  [JsonPropertyName("username")]
  [Display(Name = "nombre de usuario")]
  [MaxLength(50, ErrorMessage = "El {0} admite hasta {1} caracteres")]
  [Required]
  public string NombreUsuario { get; set; } = "";

  [JsonPropertyName("password")]
  [Display(Name = "contraseña")]
  [Required]
  public string Contrasena { get; set; } = "";
}