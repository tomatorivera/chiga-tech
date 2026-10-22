using System.Text.Json.Serialization;
using Npgsql;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

// Enums como texto: el frontend los tipa como uniones de strings (ADR técnico 0001).
builder.Services.AddControllers().AddJsonOptions(options => options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

// Acceso a datos con ADO.NET + Npgsql (ADR técnico 0004). El contenedor libera el data source al cerrar.
var connectionString = builder.Configuration.GetConnectionString("Default")
    ?? throw new InvalidOperationException("Falta ConnectionStrings:Default (variable de entorno ConnectionStrings__Default).");
builder.Services.AddSingleton(NpgsqlDataSource.Create(connectionString));

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();

    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/openapi/v1.json", "Mi API v1");
        options.RoutePrefix = "swagger"; // Disponible en /swagger
    });
    
    // Mapear "/" a "/swagger" en el navegador
    app.MapGet("/", () => Results.Redirect("/swagger"));
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();

// Expone Program a WebApplicationFactory en Chiga.IntegrationTests.
public partial class Program { }
