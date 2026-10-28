using Api.Exceptions;
using Api.Models;
using Api.Models.Dto;
using Api.Repositories;
using Api.Services;

namespace Chiga.UnitTests.Services;

public class AuthServiceTests
{
  [Fact]
  public async Task LoginAsync_ValidCredentials_ReturnsUserWithPermissionUnion()
  {
    var usuario = new Usuario
    {
      Id = 1,
      NombreUsuario = "multirol",
      Nombre = "Marta",
      Apellido = "Multirol",
      Roles =
      [
        new Rol { Id = 1, Nombre = "Vendedor", Permisos = [new Permiso { Id = 1, Modulo = "ventas.crear" }, new Permiso { Id = 2, Modulo = "ventas.ver" }] },
        new Rol { Id = 2, Nombre = "Supervisor", Permisos = [new Permiso { Id = 2, Modulo = "ventas.ver" }, new Permiso { Id = 3, Modulo = "ventas.autorizar" }] },
      ],
    };
    var hash = BCrypt.Net.BCrypt.HashPassword("chiga1234", workFactor: 4);
    var service = new AuthService(new FakeUserRepository((usuario, hash)));

    var result = await service.LoginAsync(new LoginRequestDTO { NombreUsuario = "multirol", Contrasena = "chiga1234" });

    Assert.Equal(1, result.Id);
    Assert.Equal(["Vendedor", "Supervisor"], result.Roles);
    Assert.Equal(["ventas.crear", "ventas.ver", "ventas.autorizar"], result.Permisos);
  }

  [Fact]
  public async Task LoginAsync_UnknownUser_ThrowsInvalidCredentials()
  {
    var service = new AuthService(new FakeUserRepository(null));

    await Assert.ThrowsAsync<InvalidCredentialsException>(
      () => service.LoginAsync(new LoginRequestDTO { NombreUsuario = "noexiste", Contrasena = "chiga1234" }));
  }

  [Fact]
  public async Task LoginAsync_WrongPassword_ThrowsInvalidCredentials()
  {
    var usuario = new Usuario { Id = 1, NombreUsuario = "vendedor", Nombre = "Valeria", Apellido = "Vendedor" };
    var hash = BCrypt.Net.BCrypt.HashPassword("chiga1234", workFactor: 4);
    var service = new AuthService(new FakeUserRepository((usuario, hash)));

    await Assert.ThrowsAsync<InvalidCredentialsException>(
      () => service.LoginAsync(new LoginRequestDTO { NombreUsuario = "vendedor", Contrasena = "incorrecta" }));
  }

  [Fact]
  public async Task LoginAsync_UsernameWithNullChar_ThrowsInvalidCredentialsWithoutQueryingRepository()
  {
    // Si el servicio consultara el repositorio, este usuario con su contraseña correcta iniciaría sesión.
    var usuario = new Usuario { Id = 1, NombreUsuario = "vendedor", Nombre = "Valeria", Apellido = "Vendedor" };
    var hash = BCrypt.Net.BCrypt.HashPassword("chiga1234", workFactor: 4);
    var service = new AuthService(new FakeUserRepository((usuario, hash)));

    await Assert.ThrowsAsync<InvalidCredentialsException>(
      () => service.LoginAsync(new LoginRequestDTO { NombreUsuario = "vendedor\0", Contrasena = "chiga1234" }));
  }

  [Theory]
  [InlineData("no-es-un-hash")]
  [InlineData("$2a$10$corto")]
  [InlineData("")]
  public async Task LoginAsync_StoredHashNotBcrypt_ThrowsInvalidCredentials(string hash)
  {
    var usuario = new Usuario { Id = 1, NombreUsuario = "vendedor", Nombre = "Valeria", Apellido = "Vendedor" };
    var service = new AuthService(new FakeUserRepository((usuario, hash)));

    await Assert.ThrowsAsync<InvalidCredentialsException>(
      () => service.LoginAsync(new LoginRequestDTO { NombreUsuario = "vendedor", Contrasena = "chiga1234" }));
  }

  private class FakeUserRepository((Usuario usuario, string Contrasenia)? resultado) : IUserRepository
  {
    public Task<(Usuario usuario, string Contrasenia)?> FindByNombreUsuarioAsync(string nombreUsuario, CancellationToken ct = default)
      => Task.FromResult(resultado);
  }
}
