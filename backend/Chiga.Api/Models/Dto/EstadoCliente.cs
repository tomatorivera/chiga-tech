using System.Text.Json.Serialization;

namespace Api.Models.Dto;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum EstadoCliente
{
  ACTIVO,
  INACTIVO,
}
