namespace ChildAdoptionAdmin.Api.Services;

public static class CodeGenerator
{
    public static string Generate(string prefix, long sequence) => $"{prefix}-{sequence:D3}";
}
