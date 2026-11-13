using System.ComponentModel.DataAnnotations;
using Api.Models.Dto;

namespace Chiga.UnitTests.Models.Dto;

public class PageRequestTests
{
  private static List<string> ValidationErrors(PageRequest request)
  {
    var results = new List<ValidationResult>();
    Validator.TryValidateObject(request, new ValidationContext(request), results, validateAllProperties: true);
    return results.SelectMany(r => r.MemberNames).ToList();
  }

  [Fact]
  public void Defaults_AreFirstPageOfTwenty()
  {
    var request = new PageRequest();

    Assert.Equal(1, request.Page);
    Assert.Equal(20, request.PageSize);
    Assert.Empty(ValidationErrors(request));
  }

  [Theory]
  [InlineData(1, 1)]
  [InlineData(1000, 500)]
  public void Validate_AcceptsValuesInRange(int page, int pageSize)
  {
    Assert.Empty(ValidationErrors(new PageRequest { Page = page, PageSize = pageSize }));
  }

  [Theory]
  [InlineData(0)]
  [InlineData(-1)]
  public void Validate_RejectsPageBelowOne(int page)
  {
    Assert.Equal(["Page"], ValidationErrors(new PageRequest { Page = page }));
  }

  [Theory]
  [InlineData(0)]
  [InlineData(501)]
  public void Validate_RejectsPageSizeOutOfRange(int pageSize)
  {
    Assert.Equal(["PageSize"], ValidationErrors(new PageRequest { PageSize = pageSize }));
  }
}
