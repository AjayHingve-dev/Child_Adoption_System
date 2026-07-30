using ChildAdoptionAdmin.Api.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ChildAdoptionAdmin.Api.Controllers;

[ApiController]
[Route("api/reports")]
[Authorize]
public class ReportsController : ControllerBase
{
    private readonly AppDbContext _db;
    public ReportsController(AppDbContext db) => _db = db;

    // GET /api/reports/application-summary
    [HttpGet("application-summary")]
    public async Task<ActionResult> ApplicationSummary([FromQuery] DateTime? from, [FromQuery] DateTime? to)
    {
        var query = _db.AdoptionRequests.AsQueryable();
        if (from.HasValue) query = query.Where(r => r.RequestDate >= from);
        if (to.HasValue) query = query.Where(r => r.RequestDate <= to);

        var byStatus = await query.GroupBy(r => r.Status)
            .Select(g => new { Status = g.Key, Count = g.Count() })
            .ToListAsync();

        return Ok(new { total = await query.CountAsync(), byStatus });
    }

    // GET /api/reports/home-visits
    [HttpGet("home-visits")]
    public async Task<ActionResult> HomeVisitStats([FromQuery] DateTime? from, [FromQuery] DateTime? to)
    {
        var query = _db.HomeVisits.AsQueryable();
        if (from.HasValue) query = query.Where(v => v.ScheduledDate >= from);
        if (to.HasValue) query = query.Where(v => v.ScheduledDate <= to);

        var byStatus = await query.GroupBy(v => v.Status)
            .Select(g => new { Status = g.Key, Count = g.Count() })
            .ToListAsync();

        return Ok(new { total = await query.CountAsync(), byStatus });
    }

    // GET /api/reports/child-matching
    [HttpGet("child-matching")]
    public async Task<ActionResult> ChildMatching()
    {
        var byStatus = await _db.Children.GroupBy(c => c.Status)
            .Select(g => new { Status = g.Key, Count = g.Count() })
            .ToListAsync();

        return Ok(new { total = await _db.Children.CountAsync(), byStatus });
    }

    // GET /api/reports/adoption-decisions
    [HttpGet("adoption-decisions")]
    public async Task<ActionResult> AdoptionDecisions([FromQuery] DateTime? from, [FromQuery] DateTime? to)
    {
        var query = _db.AdoptionRequests.Where(r => r.Status == "APPROVED" || r.Status == "REJECTED");
        if (from.HasValue) query = query.Where(r => r.StatusUpdatedAt >= from);
        if (to.HasValue) query = query.Where(r => r.StatusUpdatedAt <= to);

        var decisions = await query
            .Select(r => new { r.ApplicationNumber, r.Status, r.StatusUpdatedAt, r.AdminRemark })
            .ToListAsync();

        return Ok(decisions);
    }

    // GET /api/reports/monthly-activity
    [HttpGet("monthly-activity")]
    public async Task<ActionResult> MonthlyActivity([FromQuery] int year)
    {
        var applications = await _db.AdoptionRequests
            .Where(r => r.RequestDate.Year == year)
            .GroupBy(r => r.RequestDate.Month)
            .Select(g => new { Month = g.Key, Count = g.Count() })
            .ToListAsync();

        var visits = await _db.HomeVisits
            .Where(v => v.ScheduledDate.Year == year)
            .GroupBy(v => v.ScheduledDate.Month)
            .Select(g => new { Month = g.Key, Count = g.Count() })
            .ToListAsync();

        return Ok(new { applications, visits });
    }

    // GET /api/reports/user-activity
    [HttpGet("user-activity")]
    public async Task<ActionResult> UserActivity()
    {
        var newUsersLast30Days = await _db.Users.CountAsync(u => u.CreatedAt >= DateTime.UtcNow.AddDays(-30));
        var activeUsers = await _db.Users.CountAsync(u => u.Status == "ACTIVE");

        return Ok(new { newUsersLast30Days, activeUsers, totalUsers = await _db.Users.CountAsync() });
    }
}
