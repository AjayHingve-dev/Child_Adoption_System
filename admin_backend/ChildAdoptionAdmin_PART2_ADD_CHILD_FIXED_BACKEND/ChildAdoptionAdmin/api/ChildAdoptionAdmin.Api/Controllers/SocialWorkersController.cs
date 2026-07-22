using ChildAdoptionAdmin.Api.Data;
using ChildAdoptionAdmin.Api.DTOs;
using ChildAdoptionAdmin.Api.Models;
using ChildAdoptionAdmin.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace ChildAdoptionAdmin.Api.Controllers;

[ApiController]
[Route("api/social-workers")]
[Authorize]
public class SocialWorkersController : ControllerBase
{
    private readonly AppDbContext _db;
    public SocialWorkersController(AppDbContext db) => _db = db;

    // GET /api/social-workers?search=&status=
    [HttpGet]
    public async Task<ActionResult<List<SocialWorkerResponse>>> GetAll([FromQuery] string? search, [FromQuery] string? status)
    {
        var query = _db.SocialWorkers.AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(s => s.FirstName.Contains(search) || s.Email.Contains(search) || s.Phone.Contains(search));

        if (!string.IsNullOrWhiteSpace(status))
            query = query.Where(s => s.Status == status);

        var list = await query.OrderByDescending(s => s.CreatedAt)
            .Select(s => new SocialWorkerResponse(
                s.SocialWorkerId, s.SocialWorkerCode, s.FirstName, s.LastName,
                s.Email, s.Phone, s.District, s.Area, s.Status, s.CreatedAt))
            .ToListAsync();

        return Ok(list);
    }

    // GET /api/social-workers/5
    [HttpGet("{id:long}")]
    public async Task<ActionResult<SocialWorkerResponse>> GetById(long id)
    {
        var s = await _db.SocialWorkers.FindAsync(id);
        if (s is null) return NotFound();

        return Ok(new SocialWorkerResponse(
            s.SocialWorkerId, s.SocialWorkerCode, s.FirstName, s.LastName,
            s.Email, s.Phone, s.District, s.Area, s.Status, s.CreatedAt));
    }

    // POST /api/social-workers
    [HttpPost]
    public async Task<ActionResult<SocialWorkerResponse>> Create(CreateSocialWorkerRequest request)
    {
        if (await _db.SocialWorkers.AnyAsync(s => s.Email == request.Email || s.Phone == request.Phone))
            return Conflict(new { message = "A social worker with this email or phone already exists." });

        var count = await _db.SocialWorkers.CountAsync();
        var adminIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");

        var entity = new SocialWorker
        {
            SocialWorkerCode = CodeGenerator.Generate("SW", count + 1),
            FirstName = request.FirstName,
            LastName = request.LastName,
            Email = request.Email,
            Password = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Phone = request.Phone,
            District = request.District,
            Area = request.Area,
            Status = "ACTIVE",
            CreatedByAdminId = adminIdClaim != null ? long.Parse(adminIdClaim) : null,
            CreatedAt = DateTime.UtcNow
        };

        _db.SocialWorkers.Add(entity);
        await _db.SaveChangesAsync();

        var response = new SocialWorkerResponse(
            entity.SocialWorkerId, entity.SocialWorkerCode, entity.FirstName, entity.LastName,
            entity.Email, entity.Phone, entity.District, entity.Area, entity.Status, entity.CreatedAt);

        return CreatedAtAction(nameof(GetById), new { id = entity.SocialWorkerId }, response);
    }

    // PUT /api/social-workers/5
    [HttpPut("{id:long}")]
    public async Task<ActionResult<SocialWorkerResponse>> Update(long id, UpdateSocialWorkerRequest request)
    {
        var entity = await _db.SocialWorkers.FindAsync(id);
        if (entity is null) return NotFound();

        entity.FirstName = request.FirstName;
        entity.LastName = request.LastName;
        entity.District = request.District;
        entity.Area = request.Area;
        entity.Status = request.Status;

        await _db.SaveChangesAsync();

        return Ok(new SocialWorkerResponse(
            entity.SocialWorkerId, entity.SocialWorkerCode, entity.FirstName, entity.LastName,
            entity.Email, entity.Phone, entity.District, entity.Area, entity.Status, entity.CreatedAt));
    }

    // DELETE /api/social-workers/5
    [HttpDelete("{id:long}")]
    public async Task<IActionResult> Delete(long id)
    {
        var entity = await _db.SocialWorkers.FindAsync(id);
        if (entity is null) return NotFound();

        _db.SocialWorkers.Remove(entity);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
