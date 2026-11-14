using Api.Models.Entities;

namespace Api.Models.Dto;

public record ClienteDTO(
  int Id,
  string NombreRazonSocial,
  string TipoDocumento,
  string NroDocumento,
  string CondicionIva,
  EstadoCliente Estado,
  string? MotivoBaja,
  bool EsConsumidorFinal,
  CuentaCorrienteDTO? CuentaCorriente
)
{
  public static ClienteDTO From(Cliente cliente) => new(
    cliente.Id,
    cliente.NombreRazonSocial,
    cliente.TipoDocumento,
    cliente.NroDocumento,
    cliente.CondicionIva,
    cliente.EstaActivo ? EstadoCliente.ACTIVO : EstadoCliente.INACTIVO,
    cliente.MotivoBaja,
    cliente.EsSistema,
    cliente.CuentaCorriente is { } cc ? new CuentaCorrienteDTO(cc.LimiteCredito, cc.Saldo) : null
  );
}
