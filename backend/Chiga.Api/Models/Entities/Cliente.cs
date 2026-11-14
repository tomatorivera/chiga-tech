using Api.Models.Dto;

namespace Api.Models.Entities;

public record Cliente(
  int Id,
  TipoPersona TipoPersona,
  string NombreRazonSocial,
  string TipoDocumento,
  string NroDocumento,
  string CondicionIva,
  string? DomicilioFacturacion,
  string? Telefono,
  string? Correo,
  bool EsSistema,
  bool EstaActivo,
  string? MotivoBaja,
  string? Observacion,
  CuentaCorriente? CuentaCorriente
);
