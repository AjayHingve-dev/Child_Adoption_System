using ChildAdoptionAdmin.Api.Data;
using ChildAdoptionAdmin.Api.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ChildAdoptionAdmin.Api.Controllers;

[ApiController]
[Route("api/admin/dashboard")]
[Route("api/dashboard")]
[Authorize(Roles = "ADMIN,SUPER_ADMIN")]
public class DashboardController : ControllerBase
{
    private readonly AppDbContext _db;

    public DashboardController(AppDbContext db) => _db = db;

    // GET /api/admin/dashboard or GET /api/dashboard
    [HttpGet]
    [HttpGet("stats")]
    public async Task<IActionResult> GetStats()
    {
        var totalSocialWorkers = await _db.SocialWorkers.CountAsync();
        var activeWorkers = await _db.SocialWorkers.CountAsync(w => w.Status == "ACTIVE");
        var inactiveWorkers = await _db.SocialWorkers.CountAsync(w => w.Status == "INACTIVE");
        var pendingVisits = await _db.HomeVisits.CountAsync(v => v.Status == "PENDING");
        var completedVisits = await _db.HomeVisits.CountAsync(v => v.Status == "COMPLETED");

        var totalParents = await _db.Users.CountAsync();
        var totalChildren = await _db.Children.CountAsync();
        var totalApplications = await _db.AdoptionRequests.CountAsync();
        var underReviewApplications = await _db.AdoptionRequests.CountAsync(r => r.Status == "UNDER_REVIEW");
        var approvedApplications = await _db.AdoptionRequests.CountAsync(r => r.Status == "APPROVED");
        var rejectedApplications = await _db.AdoptionRequests.CountAsync(r => r.Status == "REJECTED");

        var stats = new DashboardStatsResponse(
            TotalParents: totalParents,
            TotalChildren: totalChildren,
            TotalApplications: totalApplications,
            UnderReviewApplications: underReviewApplications,
            ApprovedApplications: approvedApplications,
            RejectedApplications: rejectedApplications,
            PendingHomeVisits: pendingVisits,
            CompletedHomeVisits: completedVisits,
            TotalSocialWorkers: totalSocialWorkers,
            ActiveWorkers: activeWorkers,
            InactiveWorkers: inactiveWorkers
        );

        return Ok(ApiResponse<DashboardStatsResponse>.Ok(stats, "Dashboard metrics retrieved successfully"));
    }

    // GET /api/admin/dashboard/recent-activity or GET /api/dashboard/recent-activity or /api/dashboard/activities
    [HttpGet("recent-activity")]
    [HttpGet("activities")]
    public async Task<IActionResult> GetRecentActivity()
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

        return Ok(ApiResponse<object>.Ok(new { recentApplications, recentVisits }, "Recent activity retrieved successfully"));
    }
}
