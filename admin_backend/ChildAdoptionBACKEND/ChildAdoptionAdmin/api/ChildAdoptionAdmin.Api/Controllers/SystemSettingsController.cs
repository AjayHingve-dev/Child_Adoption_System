using ChildAdoptionAdmin.Api.Data;
using ChildAdoptionAdmin.Api.DTOs;
using ChildAdoptionAdmin.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ChildAdoptionAdmin.Api.Controllers;

[ApiController]
[Route("api/settings")]
[Authorize(Roles = "SUPER_ADMIN")]
public class SystemSettingsController : ControllerBase
{
    private readonly AppDbContext _db;
    public SystemSettingsController(AppDbContext db) => _db = db;

    // GET /api/settings
    [HttpGet]
    public async Task<ActionResult<List<SettingResponse>>> GetAll()
    {
        var list = await _db.SystemSettings
            .Select(s => new SettingResponse(s.SettingKey, s.SettingValue, s.UpdatedAt))
            .ToListAsync();

        return Ok(list);
    }

    // PUT /api/settings  (upsert a single setting — used by General/Roles/Application/Document settings panels)
    [HttpPut]
    public async Task<ActionResult<SettingResponse>> Upsert(UpdateSettingRequest request)
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
}
