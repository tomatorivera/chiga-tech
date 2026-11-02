using Api.Models.Dto;

namespace Api.Services;

public interface IAuthService
{
  Task<UsuarioDTO> LoginAsync(LoginRequestDTO req, CancellationToken ct = default);
  Task<UsuarioDTO?> GetSessionUserAsync(int id, CancellationToken ct = default);
}