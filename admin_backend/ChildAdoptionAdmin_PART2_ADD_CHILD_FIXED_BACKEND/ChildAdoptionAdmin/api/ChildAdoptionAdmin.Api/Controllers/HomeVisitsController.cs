using ChildAdoptionAdmin.Api.Data;
using ChildAdoptionAdmin.Api.DTOs;
using ChildAdoptionAdmin.Api.Models;
using ChildAdoptionAdmin.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ChildAdoptionAdmin.Api.Controllers;

[ApiController]
[Route("api/home-visits")]
[Authorize(Roles = "ADMIN,SUPER_ADMIN")]
public class HomeVisitsController : ControllerBase
{
    private readonly AppDbContext _db;
    public HomeVisitsController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<List<HomeVisitResponse>>> GetAll(
        [FromQuery] string? status,
        [FromQuery] string? search,
        [FromQuery] long? socialWorkerId,
        [FromQuery] DateTime? visitDate)
    {
        var query = _db.HomeVisits.AsNoTracking()
            .Include(v => v.Request)!.ThenInclude(r => r!.User)
            .Include(v => v.Request)!.ThenInclude(r => r!.Child)
            .Include(v => v.SocialWorker)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(status) && !status.Equals("ALL", StringComparison.OrdinalIgnoreCase))
        {
            var normalized = status.Trim().ToUpperInvariant();
            query = query.Where(v => v.Status == normalized);
        }

        if (socialWorkerId.HasValue)
            query = query.Where(v => v.SocialWorkerId == socialWorkerId.Value);

        if (visitDate.HasValue)
            query = query.Where(v => v.ScheduledDate.Date == visitDate.Value.Date);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim();
            query = query.Where(v =>
                v.VisitCode.Contains(term) ||
                v.Request!.ApplicationNumber.Contains(term) ||
                (v.Request.User!.FirstName + " " + (v.Request.User.LastName ?? "")).Contains(term) ||
                (v.Request.Child!.FirstName + " " + (v.Request.Child.LastName ?? "")).Contains(term) ||
                (v.SocialWorker!.FirstName + " " + (v.SocialWorker.LastName ?? "")).Contains(term));
        }

        var list = await query.OrderByDescending(v => v.ScheduledDate).ThenByDescending(v => v.ScheduledTime)
            .Select(v => new HomeVisitResponse(
                v.HomeVisitId,
                v.VisitCode,
                v.RequestId,
                v.Request!.ApplicationNumber,
                v.Request.User!.FirstName + " " + (v.Request.User.LastName ?? ""),
                v.Request.Child!.FirstName + " " + (v.Request.Child.LastName ?? ""),
                v.SocialWorkerId,
                v.SocialWorker!.FirstName + " " + (v.SocialWorker.LastName ?? ""),
                v.ScheduledDate,
                v.ScheduledTime,
                v.Status,
                v.Remarks))
            .ToListAsync();

        return Ok(list);
    }

    [HttpGet("{id:long}")]
    public async Task<ActionResult<HomeVisitDetailResponse>> GetById(long id)
    {
        var v = await _db.HomeVisits.AsNoTracking()
            .Include(x => x.Request)!.ThenInclude(r => r!.User)
            .Include(x => x.Request)!.ThenInclude(r => r!.Child)
            .Include(x => x.SocialWorker)
            .FirstOrDefaultAsync(x => x.HomeVisitId == id);

        if (v is null || v.Request is null || v.Request.User is null || v.Request.Child is null || v.SocialWorker is null)
            return NotFound(new { message = "Home visit not found." });

        return Ok(new HomeVisitDetailResponse(
            v.HomeVisitId,
            v.VisitCode,
            v.RequestId,
            v.Request.ApplicationNumber,
            v.Request.UserId,
            $"{v.Request.User.FirstName} {v.Request.User.LastName}".Trim(),
            v.Request.User.Email,
            v.Request.User.Phone,
            v.Request.User.Address,
            v.Request.User.City,
            v.Request.User.State,
            v.Request.ChildId,
            $"{v.Request.Child.FirstName} {v.Request.Child.LastName}".Trim(),
            v.SocialWorkerId,
            $"{v.SocialWorker.FirstName} {v.SocialWorker.LastName}".Trim(),
            v.SocialWorker.Phone,
            v.ScheduledDate,
            v.ScheduledTime,
            v.Status,
            v.OverallImpression,
            v.FamilyEnvironment,
            v.FinancialStability,
            v.FamilySupport,
            v.AnyConcern,
            v.Remarks,
            v.CompletedAt,
            v.CreatedAt));
    }

    [HttpPost]
    public async Task<ActionResult> Schedule(ScheduleHomeVisitRequest request)
    {
        if (request.ScheduledDate.Date < DateTime.Today)
            return BadRequest(new { message = "Visit date cannot be in the past." });

        var adoptionRequest = await _db.AdoptionRequests.Include(r => r.Child)
            .FirstOrDefaultAsync(r => r.RequestId == request.RequestId);
        if (adoptionRequest is null)
            return NotFound(new { message = "Adoption application not found." });
        if (adoptionRequest.Status is "APPROVED" or "REJECTED")
            return BadRequest(new { message = "A visit cannot be assigned to a closed application." });

        var worker = await _db.SocialWorkers.FindAsync(request.SocialWorkerId);
        if (worker is null)
            return NotFound(new { message = "Social worker not found." });
        if (!worker.Status.Equals("ACTIVE", StringComparison.OrdinalIgnoreCase))
            return BadRequest(new { message = "Only an active social worker can be assigned." });

        var duplicate = await _db.HomeVisits.AnyAsync(v =>
            v.RequestId == request.RequestId && v.Status != "CANCELLED" && v.Status != "COMPLETED");
        if (duplicate)
            return Conflict(new { message = "This application already has a pending home visit." });

        var lastId = await _db.HomeVisits.OrderByDescending(v => v.HomeVisitId)
            .Select(v => (long?)v.HomeVisitId).FirstOrDefaultAsync() ?? 0;

        var entity = new HomeVisit
        {
            VisitCode = CodeGenerator.Generate("HV", (int)(lastId + 1)),
            RequestId = request.RequestId,
            SocialWorkerId = request.SocialWorkerId,
            ScheduledDate = request.ScheduledDate.Date,
            ScheduledTime = request.ScheduledTime,
            Status = "PENDING",
            Remarks = request.Notes?.Trim(),
            CreatedAt = DateTime.UtcNow
        };

        adoptionRequest.Status = "HOME_VISIT_ASSIGNED";
        adoptionRequest.StatusUpdatedAt = DateTime.UtcNow;
        if (adoptionRequest.Child is not null && adoptionRequest.Child.Status == "AVAILABLE")
            adoptionRequest.Child.Status = "RESERVED";

        _db.HomeVisits.Add(entity);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = entity.HomeVisitId }, new { entity.HomeVisitId, entity.VisitCode });
    }

    [HttpPut("{id:long}")]
    public async Task<IActionResult> Reschedule(long id, UpdateHomeVisitRequest request)
    {
        var visit = await _db.HomeVisits.FindAsync(id);
        if (visit is null) return NotFound(new { message = "Home visit not found." });
        if (visit.Status == "COMPLETED") return BadRequest(new { message = "A completed visit cannot be edited." });
        if (visit.Status == "CANCELLED") return BadRequest(new { message = "A cancelled visit cannot be edited." });
        if (request.ScheduledDate.Date < DateTime.Today)
            return BadRequest(new { message = "Visit date cannot be in the past." });

        var worker = await _db.SocialWorkers.FindAsync(request.SocialWorkerId);
        if (worker is null) return NotFound(new { message = "Social worker not found." });
        if (!worker.Status.Equals("ACTIVE", StringComparison.OrdinalIgnoreCase))
            return BadRequest(new { message = "Only an active social worker can be assigned." });

        visit.SocialWorkerId = request.SocialWorkerId;
        visit.ScheduledDate = request.ScheduledDate.Date;
        visit.ScheduledTime = request.ScheduledTime;
        visit.Remarks = request.Notes?.Trim();
        visit.Status = "PENDING";
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPut("{id:long}/complete")]
    public async Task<IActionResult> Complete(long id, CompleteHomeVisitRequest request)
    {
        var visit = await _db.HomeVisits.Include(v => v.Request).FirstOrDefaultAsync(v => v.HomeVisitId == id);
        if (visit is null) return NotFound(new { message = "Home visit not found." });
        if (visit.Status == "CANCELLED") return BadRequest(new { message = "A cancelled visit cannot be completed." });
        if (visit.Status == "COMPLETED") return BadRequest(new { message = "This visit is already completed." });

        visit.OverallImpression = request.OverallImpression?.Trim();
        visit.FamilyEnvironment = request.FamilyEnvironment?.Trim();
        visit.FinancialStability = request.FinancialStability?.Trim();
        visit.FamilySupport = request.FamilySupport?.Trim();
        visit.AnyConcern = request.AnyConcern?.Trim();
        visit.Remarks = request.Remarks?.Trim();
        visit.Status = "COMPLETED";
        visit.CompletedAt = DateTime.UtcNow;

        if (visit.Request is not null)
        {
            visit.Request.Status = "UNDER_REVIEW";
            visit.Request.StatusUpdatedAt = DateTime.UtcNow;
        }

        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPut("{id:long}/cancel")]
    public async Task<IActionResult> Cancel(long id)
    {
        var visit = await _db.HomeVisits.Include(v => v.Request).ThenInclude(r => r!.Child)
            .FirstOrDefaultAsync(v => v.HomeVisitId == id);
        if (visit is null) return NotFound(new { message = "Home visit not found." });
        if (visit.Status == "COMPLETED") return BadRequest(new { message = "A completed visit cannot be cancelled." });
        if (visit.Status == "CANCELLED") return BadRequest(new { message = "This visit is already cancelled." });

        visit.Status = "CANCELLED";
        if (visit.Request is not null)
        {
            visit.Request.Status = "PENDING";
            visit.Request.StatusUpdatedAt = DateTime.UtcNow;
            if (visit.Request.Child is not null && visit.Request.Child.Status == "RESERVED")
                visit.Request.Child.Status = "AVAILABLE";
        }

        await _db.SaveChangesAsync();
        return NoContent();
    }
}
