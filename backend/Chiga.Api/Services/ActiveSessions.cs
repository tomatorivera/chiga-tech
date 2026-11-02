using Microsoft.Extensions.Caching.Memory;

namespace Api.Services;

/// <summary>
/// Sesiones abiertas (ADR técnico 0003). Una cookie solo vale si su sesión sigue acá, así que
/// una copia deja de servir después del logout. Al estar en memoria, reiniciar la API las cierra todas.
/// </summary>
public class ActiveSessions(IMemoryCache cache)
{
  public static readonly TimeSpan Duration = TimeSpan.FromHours(10);

  public string Start()
  {
    var sid = Guid.NewGuid().ToString();
    cache.Set(sid, true, new MemoryCacheEntryOptions { SlidingExpiration = Duration });
    return sid;
  }

  public bool IsActive(string sid) => cache.TryGetValue(sid, out _);

  public void End(string sid) => cache.Remove(sid);
}
