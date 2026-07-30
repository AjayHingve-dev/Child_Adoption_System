using ChildAdoptionAdmin.Api.Data;
using ChildAdoptionAdmin.Api.DTOs;
using ChildAdoptionAdmin.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace ChildAdoptionAdmin.Api.Controllers;

[ApiController]
[Route("api/admins")]
[Authorize(Roles = "ADMIN,SUPER_ADMIN")]
public class AdminsController : ControllerBase
{
    private readonly AppDbContext _db;
    public AdminsController(AppDbContext db) => _db = db;

    private bool TryGetCurrentAdminId(out long adminId)
    {
        var value = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        return long.TryParse(value, out adminId);
    }

    [HttpGet]
    [Authorize(Roles = "SUPER_ADMIN")]
    public async Task<ActionResult<List<AdminResponse>>> GetAll([FromQuery] string? search)
    {
        var query = _db.Admins.AsNoTracking().AsQueryable();
        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim();
            query = query.Where(a => a.FirstName.Contains(term) ||
                                     (a.LastName != null && a.LastName.Contains(term)) ||
                                     a.Email.Contains(term));
        }

        return Ok(await query.OrderByDescending(a => a.CreatedAt)
            .Select(a => new AdminResponse(a.AdminId, a.FirstName, a.LastName, a.Email, a.Phone, a.Role, a.Status, a.CreatedAt))
            .ToListAsync());
    }

    [HttpPost]
    [Authorize(Roles = "SUPER_ADMIN")]
    public async Task<ActionResult<AdminResponse>> Create(CreateAdminRequest request)
    {
        var email = request.Email?.Trim().ToLowerInvariant();
        var phone = string.IsNullOrWhiteSpace(request.Phone) ? null : request.Phone.Trim();
        var role = request.Role?.Trim().ToUpperInvariant();

        if (string.IsNullOrWhiteSpace(request.FirstName) || string.IsNullOrWhiteSpace(email))
            return BadRequest(new { message = "First name and email are required." });
        if (request.Password?.Length < 8)
            return BadRequest(new { message = "Password must contain at least 8 characters." });
        if (role is not ("ADMIN" or "SUPER_ADMIN"))
            return BadRequest(new { message = "Role must be ADMIN or SUPER_ADMIN." });
        if (await _db.Admins.AnyAsync(a => a.Email == email))
            return Conflict(new { message = "An admin with this email already exists." });
        if (phone is not null && await _db.Admins.AnyAsync(a => a.Phone == phone))
            return Conflict(new { message = "An admin with this phone already exists." });

        var entity = new Admin
        {
            FirstName = request.FirstName.Trim(), LastName = string.IsNullOrWhiteSpace(request.LastName) ? null : request.LastName.Trim(),
            Email = email, Password = BCrypt.Net.BCrypt.HashPassword(request.Password), Phone = phone,
            Role = role, Status = "ACTIVE", CreatedAt = DateTime.UtcNow
        };
        _db.Admins.Add(entity);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetAll), new AdminResponse(entity.AdminId, entity.FirstName, entity.LastName, entity.Email, entity.Phone, entity.Role, entity.Status, entity.CreatedAt));
    }

    [HttpGet("me")]
    public async Task<ActionResult<AdminResponse>> GetMyProfile()
    {
        if (!TryGetCurrentAdminId(out var adminId)) return Unauthorized(new { message = "Invalid authentication token." });
        var a = await _db.Admins.AsNoTracking().FirstOrDefaultAsync(x => x.AdminId == adminId);
        if (a is null) return NotFound(new { message = "Admin profile was not found." });
        return Ok(new AdminResponse(a.AdminId, a.FirstName, a.LastName, a.Email, a.Phone, a.Role, a.Status, a.CreatedAt));
    }

    [HttpPut("me")]
    public async Task<ActionResult<AdminResponse>> UpdateMyProfile(UpdateAdminProfileRequest request)
    {
        if (!TryGetCurrentAdminId(out var adminId)) return Unauthorized(new { message = "Invalid authentication token." });
        var a = await _db.Admins.FindAsync(adminId);
        if (a is null) return NotFound(new { message = "Admin profile was not found." });

        var firstName = request.FirstName?.Trim();
        var phone = string.IsNullOrWhiteSpace(request.Phone) ? null : request.Phone.Trim();
        if (string.IsNullOrWhiteSpace(firstName)) return BadRequest(new { message = "First name is required." });
        if (phone is not null && (phone.Length < 10 || phone.Length > 15 || !phone.All(char.IsDigit)))
            return BadRequest(new { message = "Phone must contain 10 to 15 digits." });
        if (phone is not null && await _db.Admins.AnyAsync(x => x.Phone == phone && x.AdminId != adminId))
            return Conflict(new { message = "Another admin already uses this phone number." });

        a.FirstName = firstName;
        a.LastName = string.IsNullOrWhiteSpace(request.LastName) ? null : request.LastName.Trim();
        a.Phone = phone;
        await _db.SaveChangesAsync();
        return Ok(new AdminResponse(a.AdminId, a.FirstName, a.LastName, a.Email, a.Phone, a.Role, a.Status, a.CreatedAt));
    }

    [HttpPut("me/password")]
    public async Task<IActionResult> ChangePassword(ChangePasswordRequest request)
    {
        if (!TryGetCurrentAdminId(out var adminId)) return Unauthorized(new { message = "Invalid authentication token." });
        var a = await _db.Admins.FindAsync(adminId);
        if (a is null) return NotFound(new { message = "Admin profile was not found." });
        if (string.IsNullOrWhiteSpace(request.CurrentPassword) || !BCrypt.Net.BCrypt.Verify(request.CurrentPassword, a.Password))
            return BadRequest(new { message = "Current password is incorrect." });
        if (request.NewPassword?.Length < 8 || !request.NewPassword.Any(char.IsUpper) ||
            !request.NewPassword.Any(char.IsLower) || !request.NewPassword.Any(char.IsDigit) ||
            !request.NewPassword.Any(ch => !char.IsLetterOrDigit(ch)))
            return BadRequest(new { message = "New password must be at least 8 characters and include uppercase, lowercase, number, and special character." });
        if (BCrypt.Net.BCrypt.Verify(request.NewPassword, a.Password))
            return BadRequest(new { message = "New password must be different from the current password." });

        a.Password = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        await _db.SaveChangesAsync();
        return Ok(new { message = "Password changed successfully. Please sign in again." });
    }
}
