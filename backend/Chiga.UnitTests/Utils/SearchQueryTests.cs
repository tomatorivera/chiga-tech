using Api.Utils;

namespace Chiga.UnitTests.Utils;

public class SearchQueryTests
{
  [Theory]
  [InlineData(null)]
  [InlineData("")]
  [InlineData("   ")]
  [InlineData("\t\r\n")]
  public void Clean_NullOrWhitespace_ReturnsNull(string? query)
  {
    Assert.Null(SearchQuery.Clean(query));
  }

  [Theory]
  [InlineData("  ryzen  ", "ryzen")]
  [InlineData("\tryzen\n", "ryzen")]
  [InlineData(" rtx  5060 ", "rtx  5060")] // los espacios del medio se conservan
  [InlineData("Ryzen", "Ryzen")]           // no cambia mayúsculas: ILIKE ya no las distingue
  public void Clean_Text_TrimsEnds(string query, string expected)
  {
    Assert.Equal(expected, SearchQuery.Clean(query));
  }

  [Theory]
  [InlineData("100%", @"100\%")]
  [InlineData("a_b", @"a\_b")]
  [InlineData(@"c\d", @"c\\d")]
  [InlineData("%", @"\%")]
  [InlineData(@"\%", @"\\\%")] // la barra se escapa antes que el comodín, si no el escape del % se duplica
  [InlineData(@"\_", @"\\\_")]
  [InlineData(" 50%_off ", @"50\%\_off")]
  public void Clean_LikeWildcards_EscapesThem(string query, string expected)
  {
    Assert.Equal(expected, SearchQuery.Clean(query));
  }
}
