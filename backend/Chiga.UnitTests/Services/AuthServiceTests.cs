using Api.Exceptions;
using Api.Models.Entities;
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

  [Fact]
  public async Task LoginAsync_DisabledUserCorrectPassword_ThrowsDisabledUser()
  {
    var service = ServiceWithUser(estado: false);

    await Assert.ThrowsAsync<DisabledUserException>(() => service.LoginAsync(LoginAs("chiga1234")));
  }

  [Fact]
  public async Task LoginAsync_DisabledUserWrongPassword_ThrowsInvalidCredentialsNotDisabledUser()
  {
    // Si el estado se revisara antes que la contraseña, cualquiera podría saber qué cuentas están inhabilitadas.
    var service = ServiceWithUser(estado: false);

    await Assert.ThrowsAsync<InvalidCredentialsException>(() => service.LoginAsync(LoginAs("incorrecta")));
  }

  [Fact]
  public async Task LoginAsync_EnabledUserCorrectPassword_DoesNotThrow()
  {
    var service = ServiceWithUser(estado: true);

    var result = await service.LoginAsync(LoginAs("chiga1234"));

    Assert.Equal("vendedor", result.NombreUsuario);
  }

  [Fact]
  public async Task GetSessionUserAsync_ActiveUser_ReturnsUser()
  {
    var service = ServiceWithUser(estado: true);

    var result = await service.GetSessionUserAsync(1);

    Assert.NotNull(result);
    Assert.Equal("vendedor", result.NombreUsuario);
    Assert.Equal("Valeria", result.Nombre);
  }

  [Fact]
  public async Task GetSessionUserAsync_DisabledUser_ReturnsNull()
  {
    var service = ServiceWithUser(estado: false);

    Assert.Null(await service.GetSessionUserAsync(1));
  }

  [Fact]
  public async Task GetSessionUserAsync_UnknownUser_ReturnsNull()
  {
    var service = new AuthService(new FakeUserRepository(null));

    Assert.Null(await service.GetSessionUserAsync(1));
  }

  private static AuthService ServiceWithUser(bool estado)
  {
    var usuario = new Usuario { Id = 1, NombreUsuario = "vendedor", Nombre = "Valeria", Apellido = "Vendedor", Estado = estado };
    var hash = BCrypt.Net.BCrypt.HashPassword("chiga1234", workFactor: 4);
    return new AuthService(new FakeUserRepository((usuario, hash)));
  }

  private static LoginRequestDTO LoginAs(string password) =>
    new() { NombreUsuario = "vendedor", Contrasena = password };

  private class FakeUserRepository((Usuario User, string Contrasenia)? resultado) : IUserRepository
  {
    public Task<(Usuario User, string Contrasenia)?> FindByNombreUsuarioAsync(string nombreUsuario, CancellationToken ct = default)
      => Task.FromResult(resultado);

    public Task<Usuario?> FindByIdAsync(int id, CancellationToken ct = default)
      => Task.FromResult(resultado?.User);
  }
}
