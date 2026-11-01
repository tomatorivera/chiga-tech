using Microsoft.AspNetCore.DataProtection.KeyManagement;
using Microsoft.AspNetCore.DataProtection.Repositories;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;

namespace Chiga.IntegrationTests;

public class ProgramTests(WebApplicationFactory<Program> factory)
  : IClassFixture<WebApplicationFactory<Program>>
{
  // Las claves son secretas: el directorio por defecto es el que está en el .gitignore (backend/Chiga.Api/keys).
  [Fact]
  public void DataProtectionKeys_WithoutConfiguredPath_UseKeysDirectoryInContentRoot()
  {
    var options = factory.Services.GetRequiredService<IOptions<KeyManagementOptions>>().Value;
    var environment = factory.Services.GetRequiredService<IWebHostEnvironment>();

    var repository = Assert.IsType<FileSystemXmlRepository>(options.XmlRepository);

    Assert.Equal(Path.Combine(environment.ContentRootPath, "keys"), repository.Directory.FullName);
  }
}
