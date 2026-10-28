namespace Api.Exceptions;

public class DisabledUserException : Exception
{
  public DisabledUserException()
  {
  }

  public DisabledUserException(string? message) : base(message)
  {
  }
}