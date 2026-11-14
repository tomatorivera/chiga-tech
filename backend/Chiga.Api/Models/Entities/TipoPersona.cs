using System.Text.Json.Serialization;

namespace Api.Models.Entities;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum TipoPersona
{
  FISICA,
  JURIDICA,
}
