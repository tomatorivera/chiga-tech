using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Npgsql;

namespace Chiga.IntegrationTests.Data;

// Necesita la BD levantada con migraciones (npm run db:reset).
public class NpgsqlDataSourceTests(WebApplicationFactory<Program> factory)
  : IClassFixture<WebApplicationFactory<Program>>
{
  [Fact]
  public async Task Query_ReturnsPredefinedRoles()
  {
    var dataSource = factory.Services.GetRequiredService<NpgsqlDataSource>();
    await using var command = dataSource.CreateCommand("SELECT rol FROM rol ORDER BY id_rol");
    await using var reader = await command.ExecuteReaderAsync();

    var roles = new List<string>();
    while (await reader.ReadAsync()) roles.Add(reader.GetString(0));

    Assert.Equal(["Vendedor", "Supervisor", "Administrador", "Dueño"], roles);
  }
}
