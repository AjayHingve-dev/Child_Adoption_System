using ChildAdoptionAdmin.Api.Data;
using ChildAdoptionAdmin.Api.DTOs;
using ChildAdoptionAdmin.Api.Models;
using ChildAdoptionAdmin.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ChildAdoptionAdmin.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly JwtService _jwt;

    public AuthController(AppDbContext db, JwtService jwt)
    {
        _db = db;
        _jwt = jwt;
    }

    // Admin registration requested for the admin portal.
    // Only the five registration fields are accepted from the frontend.
    [AllowAnonymous]
    [HttpPost("register")]
    public async Task<ActionResult<RegisterAdminResponse>> RegisterAdmin(RegisterAdminRequest request)
    {
        var firstName = request.FirstName?.Trim();
        var lastName = NullIfWhiteSpace(request.LastName);
        var email = request.Email?.Trim().ToLowerInvariant();
        var phone = request.Phone?.Trim();

        if (string.IsNullOrWhiteSpace(firstName))
            return BadRequest(new { message = "First name is required." });
        if (firstName.Length > 50)
            return BadRequest(new { message = "First name cannot exceed 50 characters." });
        if (lastName?.Length > 50)
            return BadRequest(new { message = "Last name cannot exceed 50 characters." });
        if (string.IsNullOrWhiteSpace(email) || !email.Contains('@'))
            return BadRequest(new { message = "A valid email is required." });
        if (string.IsNullOrWhiteSpace(phone))
            return BadRequest(new { message = "Phone number is required." });
        if (phone.Length < 10 || phone.Length > 15 || !phone.All(char.IsDigit))
            return BadRequest(new { message = "Phone must contain 10 to 15 digits." });
        if (!IsStrongPassword(request.Password))
            return BadRequest(new { message = "Password must be at least 8 characters and include uppercase, lowercase, number, and special character." });

        if (await _db.Admins.AnyAsync(a => a.Email == email))
            return Conflict(new { message = "An admin account with this email already exists." });
        if (await _db.Admins.AnyAsync(a => a.Phone == phone))
            return Conflict(new { message = "An admin account with this phone number already exists." });

        var admin = new Admin
        {
            FirstName = firstName,
            LastName = lastName,
            Email = email,
            Password = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Phone = phone,
            Role = "ADMIN",
            Status = "ACTIVE",
            CreatedAt = DateTime.UtcNow
        };

        _db.Admins.Add(admin);
        await _db.SaveChangesAsync();

        var fullName = $"{admin.FirstName} {admin.LastName}".Trim();
        return CreatedAtAction(nameof(RegisterAdmin), new RegisterAdminResponse(
            admin.AdminId, admin.FirstName, admin.LastName, fullName, admin.Email,
            admin.Phone!, admin.Role, admin.Status, admin.CreatedAt));
    }

    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<ActionResult<LoginResponse>> Login(LoginRequest request)
    {
        var email = request.Email?.Trim().ToLowerInvariant();
        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(request.Password))
            return BadRequest(new { message = "Email and password are required." });

        var admin = await _db.Admins.FirstOrDefaultAsync(a => a.Email == email);
        if (admin is null || !string.Equals(admin.Status, "ACTIVE", StringComparison.OrdinalIgnoreCase) ||
            !BCrypt.Net.BCrypt.Verify(request.Password, admin.Password))
        {
            return Unauthorized(new { message = "Invalid email or password, or the account is inactive." });
        }

        var fullName = $"{admin.FirstName} {admin.LastName}".Trim();
        var token = _jwt.GenerateToken(admin.AdminId, admin.Email, fullName, admin.Role);
        return Ok(new LoginResponse(token, fullName, admin.Email, admin.Role));
    }

    // JWT logout is completed client-side by deleting the token.
    // This protected endpoint lets the frontend complete a consistent logout request.
    [Authorize(Roles = "ADMIN,SUPER_ADMIN")]
    [HttpPost("logout")]
    public ActionResult<LogoutResponse> Logout() => Ok(new LogoutResponse("Logged out successfully."));

    [Authorize(Roles = "ADMIN,SUPER_ADMIN")]
    [HttpGet("me")]
    public async Task<ActionResult<AdminResponse>> GetMe()
    {
        var emailClaim = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;
        if (string.IsNullOrEmpty(emailClaim)) return Unauthorized();

        var admin = await _db.Admins.FirstOrDefaultAsync(a => a.Email == emailClaim);
        if (admin is null) return NotFound(new { message = "Admin not found." });

        return Ok(new AdminResponse(admin.AdminId, admin.FirstName, admin.LastName, admin.Email, admin.Phone, admin.Role, admin.Status, admin.CreatedAt));
    }

    [Authorize(Roles = "ADMIN,SUPER_ADMIN")]
    [HttpPut("profile")]
    public async Task<ActionResult<AdminResponse>> UpdateProfile(UpdateAdminProfileRequest r)
    {
        var emailClaim = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;
        if (string.IsNullOrEmpty(emailClaim)) return Unauthorized();

        var admin = await _db.Admins.FirstOrDefaultAsync(a => a.Email == emailClaim);
        if (admin is null) return NotFound(new { message = "Admin not found." });

        if (!string.IsNullOrWhiteSpace(r.FirstName)) admin.FirstName = r.FirstName.Trim();
        if (r.LastName != null) admin.LastName = NullIfWhiteSpace(r.LastName);
        if (!string.IsNullOrWhiteSpace(r.Phone)) admin.Phone = r.Phone.Trim();

        await _db.SaveChangesAsync();
        return Ok(new AdminResponse(admin.AdminId, admin.FirstName, admin.LastName, admin.Email, admin.Phone, admin.Role, admin.Status, admin.CreatedAt));
    }

    [Authorize(Roles = "ADMIN,SUPER_ADMIN")]
    [HttpPost("change-password")]
    public async Task<ActionResult> ChangePassword(ChangePasswordRequest r)
    {
        var emailClaim = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;
        if (string.IsNullOrEmpty(emailClaim)) return Unauthorized();

        var admin = await _db.Admins.FirstOrDefaultAsync(a => a.Email == emailClaim);
        if (admin is null) return NotFound(new { message = "Admin not found." });

        if (!BCrypt.Net.BCrypt.Verify(r.CurrentPassword, admin.Password))
            return BadRequest(new { message = "Current password is incorrect." });

        if (!IsStrongPassword(r.NewPassword))
            return BadRequest(new { message = "New password must be at least 8 characters and include uppercase, lowercase, number, and special character." });

        admin.Password = BCrypt.Net.BCrypt.HashPassword(r.NewPassword);
        await _db.SaveChangesAsync();
        return Ok(new { message = "Password changed successfully." });
    }

    private static bool IsStrongPassword(string? password) =>
        !string.IsNullOrWhiteSpace(password) && password.Length >= 8 &&
        password.Any(char.IsUpper) && password.Any(char.IsLower) &&
        password.Any(char.IsDigit) && password.Any(ch => !char.IsLetterOrDigit(ch));

    private static string? NullIfWhiteSpace(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}
