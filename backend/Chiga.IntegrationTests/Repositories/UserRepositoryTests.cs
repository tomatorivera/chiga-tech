using Api.Repositories;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Npgsql;

namespace Chiga.IntegrationTests.Repositories;

// Necesita la BD levantada con migraciones (npm run db:reset).
// Inserta roles y permisos de prueba y los borra al terminar. Va en la colección "BD" para no
// correr en paralelo con tests que cuentan filas de esas tablas.
[Collection("BD")]
public class UserRepositoryTests(WebApplicationFactory<Program> factory)
  : IClassFixture<WebApplicationFactory<Program>>, IAsyncLifetime
{
  private const string Cleanup = """
    DELETE FROM usuario WHERE nombre_usuario IN ('test_con_roles', 'test_sin_roles');
    DELETE FROM rol WHERE rol IN ('Test Rol A', 'Test Rol B', 'Test Rol C');
    DELETE FROM permiso WHERE modulo IN ('test_auth.leer', 'test_auth.crear', 'test_auth.borrar');
    """;

  // Rol A: leer y crear. Rol B: crear y borrar (comparte "crear" con A). Rol C: sin permisos.
  // test_con_roles tiene los tres roles; test_sin_roles no tiene ninguno.
  private const string Setup = """
    INSERT INTO permiso (modulo) VALUES ('test_auth.leer'), ('test_auth.crear'), ('test_auth.borrar');
    INSERT INTO rol (rol) VALUES ('Test Rol A'), ('Test Rol B'), ('Test Rol C');
    INSERT INTO rol_permiso (id_rol, id_permiso)
    SELECT r.id_rol, p.id_permiso
    FROM (VALUES ('Test Rol A', 'test_auth.leer'), ('Test Rol A', 'test_auth.crear'),
                 ('Test Rol B', 'test_auth.crear'), ('Test Rol B', 'test_auth.borrar')) AS v(rol, modulo)
    JOIN rol r ON r.rol = v.rol
    JOIN permiso p ON p.modulo = v.modulo;
    INSERT INTO usuario (nombre_usuario, nombre, apellido, contrasena) VALUES
        ('test_con_roles', 'Con', 'Roles', 'hash-con-roles'),
        ('test_sin_roles', 'Sin', 'Roles', 'hash-sin-roles');
    INSERT INTO usuario_rol (id_usuario, id_rol)
    SELECT u.id_usuario, r.id_rol
    FROM usuario u, rol r
    WHERE u.nombre_usuario = 'test_con_roles' AND r.rol IN ('Test Rol A', 'Test Rol B', 'Test Rol C');
    """;

  private NpgsqlDataSource DataSource => factory.Services.GetRequiredService<NpgsqlDataSource>();
  private IUserRepository Repository => factory.Services.CreateScope().ServiceProvider.GetRequiredService<IUserRepository>();

  public async Task InitializeAsync()
  {
    await Execute(Cleanup);
    await Execute(Setup);
  }

  public async Task DisposeAsync() => await Execute(Cleanup);

  private async Task Execute(string sql)
  {
    await using var cmd = DataSource.CreateCommand(sql);
    await cmd.ExecuteNonQueryAsync();
  }

  [Fact]
  public async Task FindByNombreUsuarioAsync_UserWithRoles_GroupsPermissionsByRoleWithoutDuplicates()
  {
    var result = await Repository.FindByNombreUsuarioAsync("test_con_roles");

    Assert.NotNull(result);
    var (usuario, contrasenia) = result.Value;
    Assert.Equal("hash-con-roles", contrasenia);
    Assert.Equal(["Test Rol A", "Test Rol B", "Test Rol C"], usuario.Roles.Select(r => r.Nombre).Order());
    Assert.Equal(["test_auth.crear", "test_auth.leer"], PermisosDe(usuario, "Test Rol A"));
    Assert.Equal(["test_auth.borrar", "test_auth.crear"], PermisosDe(usuario, "Test Rol B"));
    Assert.Empty(PermisosDe(usuario, "Test Rol C"));
  }

  [Fact]
  public async Task FindByNombreUsuarioAsync_UserWithoutRoles_ReturnsUserWithEmptyRoles()
  {
    var result = await Repository.FindByNombreUsuarioAsync("test_sin_roles");

    Assert.NotNull(result);
    Assert.Equal("test_sin_roles", result.Value.usuario.NombreUsuario);
    Assert.Equal("hash-sin-roles", result.Value.Contrasenia);
    Assert.Empty(result.Value.usuario.Roles);
  }

  [Fact]
  public async Task FindByNombreUsuarioAsync_UnknownUser_ReturnsNull()
  {
    var result = await Repository.FindByNombreUsuarioAsync("test_no_existe");

    Assert.Null(result);
  }

  [Fact]
  public async Task FindByNombreUsuarioAsync_SqlInjectionAsUsername_ReturnsNullAndKeepsTables()
  {
    var result = await Repository.FindByNombreUsuarioAsync("x'; DROP TABLE usuario; --");

    Assert.Null(result);
    await using var cmd = DataSource.CreateCommand("SELECT count(*) FROM usuario");
    Assert.True((long)(await cmd.ExecuteScalarAsync())! > 0);
  }

  private static string[] PermisosDe(Api.Models.Usuario usuario, string rol) =>
    usuario.Roles.Single(r => r.Nombre == rol).Permisos.Select(p => p.Modulo).Order().ToArray();
}
