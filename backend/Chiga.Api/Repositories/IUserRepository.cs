using Api.Models.Entities;

namespace Api.Repositories;

public interface IUserRepository
{
  Task<(Usuario User, string Contrasenia)?> FindByNombreUsuarioAsync(string nombreUsuario, CancellationToken ct = default);
  Task<Usuario?> FindByIdAsync(int id, CancellationToken ct = default);
}