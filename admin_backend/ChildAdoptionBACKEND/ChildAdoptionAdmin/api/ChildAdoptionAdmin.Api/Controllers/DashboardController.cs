using ChildAdoptionAdmin.Api.Data;
using ChildAdoptionAdmin.Api.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ChildAdoptionAdmin.Api.Controllers;

[ApiController]
[Route("api/dashboard")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly AppDbContext _db;
    public DashboardController(AppDbContext db) => _db = db;

    // GET /api/dashboard/stats
    [HttpGet("stats")]
    public async Task<ActionResult<DashboardStatsResponse>> GetStats()
    {
        var stats = new DashboardStatsResponse(
            TotalParents: await _db.Users.CountAsync(),
            TotalChildren: await _db.Children.CountAsync(),
            TotalApplications: await _db.AdoptionRequests.CountAsync(),
            UnderReviewApplications: await _db.AdoptionRequests.CountAsync(r => r.Status == "UNDER_REVIEW"),
            ApprovedApplications: await _db.AdoptionRequests.CountAsync(r => r.Status == "APPROVED"),
            RejectedApplications: await _db.AdoptionRequests.CountAsync(r => r.Status == "REJECTED"),
            PendingHomeVisits: await _db.HomeVisits.CountAsync(v => v.Status == "PENDING"),
            CompletedHomeVisits: await _db.HomeVisits.CountAsync(v => v.Status == "COMPLETED")
        );
        return Ok(stats);
    }

    // GET /api/dashboard/recent-activity
    [HttpGet("recent-activity")]
    public async Task<ActionResult> GetRecentActivity()
    {
        var recentApplications = await _db.AdoptionRequests
            .OrderByDescending(r => r.RequestDate)
            .Take(5)
            .Select(r => new { r.ApplicationNumber, r.Status, r.RequestDate })
            .ToListAsync();

        var recentVisits = await _db.HomeVisits
            .OrderByDescending(v => v.CreatedAt)
            .Take(5)
            .Select(v => new { v.VisitCode, v.Status, v.ScheduledDate })
            .ToListAsync();

        return Ok(new { recentApplications, recentVisits });
    }
}
