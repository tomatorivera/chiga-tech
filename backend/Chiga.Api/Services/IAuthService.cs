using Api.Models.Dto;

namespace Api.Services;

public interface IAuthService
{
  Task<UsuarioDTO> LoginAsync(LoginRequestDTO req, CancellationToken ct = default);
}