using System.ComponentModel.DataAnnotations;

namespace Api.Models.Dto;

// Mide el largo sin los espacios de los extremos. No modifica el valor.
public class TrimmedStringLengthAttribute(int maximumLength) : StringLengthAttribute(maximumLength)
{
  public override bool IsValid(object? value) => base.IsValid((value as string)?.Trim());
}
