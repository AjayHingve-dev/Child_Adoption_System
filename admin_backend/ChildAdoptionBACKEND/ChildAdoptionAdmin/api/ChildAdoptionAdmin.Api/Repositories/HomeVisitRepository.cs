using ChildAdoptionAdmin.Api.Data;
using ChildAdoptionAdmin.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace ChildAdoptionAdmin.Api.Repositories;

public class HomeVisitRepository : IHomeVisitRepository
{
    private readonly AppDbContext _db;

    public HomeVisitRepository(AppDbContext db) => _db = db;

    public async Task<HomeVisit?> GetByIdAsync(long id) =>
        await _db.HomeVisits
            .Include(v => v.Request)
            .Include(v => v.SocialWorker)
            .FirstOrDefaultAsync(v => v.HomeVisitId == id);

    public async Task<HomeVisit?> GetDetailByIdAsync(long id) =>
        await _db.HomeVisits.AsNoTracking()
            .Include(v => v.Request!)
                .ThenInclude(r => r.User)
            .Include(v => v.Request!)
                .ThenInclude(r => r.Child)
            .Include(v => v.SocialWorker)
            .FirstOrDefaultAsync(v => v.HomeVisitId == id);

    public async Task<(List<HomeVisit> Items, int TotalCount)> GetPagedAsync(
        string? search, string? status, long? socialWorkerId, DateTime? visitDate, int page, int pageSize)
    {
        var query = _db.HomeVisits.AsNoTracking()
            .Include(v => v.Request!)
                .ThenInclude(r => r.User)
            .Include(v => v.Request!)
                .ThenInclude(r => r.Child)
            .Include(v => v.SocialWorker)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(status) && !status.Equals("ALL", StringComparison.OrdinalIgnoreCase))
        {
            var normalizedStatus = status.Trim().ToUpperInvariant();
            query = query.Where(v => v.Status == normalizedStatus);
        }

        if (socialWorkerId.HasValue)
            query = query.Where(v => v.SocialWorkerId == socialWorkerId.Value);

        if (visitDate.HasValue)
            query = query.Where(v => v.ScheduledDate.Date == visitDate.Value.Date);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(v =>
                v.VisitCode.ToLower().Contains(term) ||
                (v.Request != null && v.Request.ApplicationNumber.ToLower().Contains(term)) ||
                (v.Request != null && v.Request.User != null &&
                    (v.Request.User.FirstName + " " + (v.Request.User.LastName ?? "")).ToLower().Contains(term)) ||
                (v.Request != null && v.Request.Child != null &&
                    (v.Request.Child.FirstName + " " + (v.Request.Child.LastName ?? "")).ToLower().Contains(term)) ||
                (v.SocialWorker != null &&
                    (v.SocialWorker.FirstName + " " + (v.SocialWorker.LastName ?? "")).ToLower().Contains(term)));
        }

        var totalCount = await query.CountAsync();

        var pageNum = page > 0 ? page : 1;
        var size = pageSize > 0 ? pageSize : 10;

        var items = await query
            .OrderByDescending(v => v.ScheduledDate)
            .ThenByDescending(v => v.ScheduledTime)
            .Skip((pageNum - 1) * size)
            .Take(size)
            .ToListAsync();

        return (items, totalCount);
    }

    public async Task<HomeVisit> AddAsync(HomeVisit entity)
    {
        _db.HomeVisits.Add(entity);
        await _db.SaveChangesAsync();
        return entity;
    }

    public async Task UpdateAsync(HomeVisit entity)
    {
        _db.HomeVisits.Update(entity);
        await _db.SaveChangesAsync();
    }

    public async Task<bool> HasActiveVisitForRequestAsync(long requestId) =>
        await _db.HomeVisits.AnyAsync(v =>
            v.RequestId == requestId && v.Status != "CANCELLED" && v.Status != "COMPLETED");

    public async Task<int> CountByStatusAsync(string status) =>
        await _db.HomeVisits.CountAsync(v => v.Status == status.ToUpper());
}
