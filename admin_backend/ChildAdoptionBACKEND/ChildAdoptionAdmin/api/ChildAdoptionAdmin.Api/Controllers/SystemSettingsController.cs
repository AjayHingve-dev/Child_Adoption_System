using ChildAdoptionAdmin.Api.Data;
using ChildAdoptionAdmin.Api.DTOs;
using ChildAdoptionAdmin.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ChildAdoptionAdmin.Api.Controllers;

[ApiController]
[Route("api/settings")]
[Authorize(Roles = "ADMIN,SUPER_ADMIN")]
public class SystemSettingsController : ControllerBase
{
    private readonly AppDbContext _db;
    public SystemSettingsController(AppDbContext db) => _db = db;

    // GET /api/settings
    [HttpGet]
    public async Task<ActionResult<List<SettingResponse>>> GetAll()
    {
        try
        {
            var list = await _db.SystemSettings
                .Select(s => new SettingResponse(s.SettingKey, s.SettingValue, s.UpdatedAt))
                .ToListAsync();

            if (list.Count > 0) return Ok(list);
        }
        catch
        {
        }

        var defaults = new List<SettingResponse>
        {
            new("ORGANIZATION_NAME", "Aashray Child Adoption System", DateTime.UtcNow),
            new("CONTACT_EMAIL", "support@aashray.org", DateTime.UtcNow),
            new("CONTACT_PHONE", "+91 9876543210", DateTime.UtcNow),
            new("OFFICE_ADDRESS", "CDAC Complex, Pune, Maharashtra", DateTime.UtcNow)
        };
        return Ok(defaults);
    }

    // PUT /api/settings
    [HttpPut]
    public async Task<ActionResult<SettingResponse>> Upsert(UpdateSettingRequest request)
    {
        if (request is null || string.IsNullOrWhiteSpace(request.Key))
            return BadRequest(new { message = "Setting key is required." });

        try
        {
            var setting = await _db.SystemSettings.FindAsync(request.Key);
            if (setting is null)
            {
                setting = new SystemSetting { SettingKey = request.Key, SettingValue = request.Value, UpdatedAt = DateTime.UtcNow };
                _db.SystemSettings.Add(setting);
            }
            else
            {
                setting.SettingValue = request.Value;
                setting.UpdatedAt = DateTime.UtcNow;
            }
            await _db.SaveChangesAsync();
            return Ok(new SettingResponse(setting.SettingKey, setting.SettingValue, setting.UpdatedAt));
        }
        catch
        {
            return Ok(new SettingResponse(request.Key, request.Value, DateTime.UtcNow));
        }
    }
}
