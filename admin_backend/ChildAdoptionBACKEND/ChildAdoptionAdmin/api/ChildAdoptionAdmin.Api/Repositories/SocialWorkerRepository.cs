using ChildAdoptionAdmin.Api.Data;
using ChildAdoptionAdmin.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace ChildAdoptionAdmin.Api.Repositories;

public class SocialWorkerRepository : ISocialWorkerRepository
{
    private readonly AppDbContext _db;

    public SocialWorkerRepository(AppDbContext db) => _db = db;

    public async Task<SocialWorker?> GetByIdAsync(long id) =>
        await _db.SocialWorkers
            .Include(sw => sw.HomeVisits!)
                .ThenInclude(v => v.Request!)
                    .ThenInclude(r => r.User)
            .Include(sw => sw.HomeVisits!)
                .ThenInclude(v => v.Request!)
                    .ThenInclude(r => r.Child)
            .FirstOrDefaultAsync(sw => sw.SocialWorkerId == id);

    public async Task<SocialWorker?> GetByEmailAsync(string email) =>
        await _db.SocialWorkers
            .FirstOrDefaultAsync(sw => sw.Email.ToLower() == email.Trim().ToLower());

    public async Task<SocialWorker?> GetByPhoneAsync(string phone) =>
        await _db.SocialWorkers
            .FirstOrDefaultAsync(sw => sw.Phone == phone.Trim());

    public async Task<bool> ExistsEmailAsync(string email, long? excludeId = null)
    {
        var normalized = email.Trim().ToLower();
        return await _db.SocialWorkers.AnyAsync(sw =>
            sw.Email.ToLower() == normalized && (!excludeId.HasValue || sw.SocialWorkerId != excludeId.Value));
    }

    public async Task<bool> ExistsPhoneAsync(string phone, long? excludeId = null)
    {
        var normalized = phone.Trim();
        return await _db.SocialWorkers.AnyAsync(sw =>
            sw.Phone == normalized && (!excludeId.HasValue || sw.SocialWorkerId != excludeId.Value));
    }

    public async Task<(List<SocialWorker> Items, int TotalCount)> GetPagedAsync(
        string? search, string? status, int page, int pageSize)
    {
        var query = _db.SocialWorkers.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(sw =>
                sw.FirstName.ToLower().Contains(term) ||
                (sw.LastName != null && sw.LastName.ToLower().Contains(term)) ||
                sw.Email.ToLower().Contains(term) ||
                sw.Phone.Contains(term) ||
                sw.SocialWorkerCode.ToLower().Contains(term));
        }

        if (!string.IsNullOrWhiteSpace(status) && !status.Equals("ALL", StringComparison.OrdinalIgnoreCase))
        {
            var normalizedStatus = status.Trim().ToUpperInvariant();
            query = query.Where(sw => sw.Status.ToUpper() == normalizedStatus);
        }

        var totalCount = await query.CountAsync();

        var pageNum = page > 0 ? page : 1;
        var size = pageSize > 0 ? pageSize : 10;

        var items = await query
            .OrderByDescending(sw => sw.CreatedAt)
            .Skip((pageNum - 1) * size)
            .Take(size)
            .Include(sw => sw.HomeVisits)
            .ToListAsync();

        return (items, totalCount);
    }

    public async Task<int> CountAsync() =>
        await _db.SocialWorkers.CountAsync();

    public async Task<SocialWorker> AddAsync(SocialWorker entity)
    {
        _db.SocialWorkers.Add(entity);
        await _db.SaveChangesAsync();
        return entity;
    }

    public async Task UpdateAsync(SocialWorker entity)
    {
        _db.SocialWorkers.Update(entity);
        await _db.SaveChangesAsync();
    }

    public async Task DeleteAsync(SocialWorker entity)
    {
        _db.SocialWorkers.Remove(entity);
        await _db.SaveChangesAsync();
    }

    public async Task<bool> HasPendingHomeVisitsAsync(long socialWorkerId) =>
        await _db.HomeVisits.AnyAsync(v =>
            v.SocialWorkerId == socialWorkerId && v.Status == "PENDING");

    public async Task<(int Assigned, int Completed, int Pending)> GetVisitCountsAsync(long socialWorkerId)
    {
        var visits = await _db.HomeVisits
            .Where(v => v.SocialWorkerId == socialWorkerId)
            .Select(v => v.Status)
            .ToListAsync();

        var assigned = visits.Count;
        var completed = visits.Count(s => s == "COMPLETED");
        var pending = visits.Count(s => s == "PENDING");

        return (assigned, completed, pending);
    }

    public async Task<List<HomeVisit>> GetVisitsByWorkerIdAsync(long socialWorkerId) =>
        await _db.HomeVisits.AsNoTracking()
            .Where(v => v.SocialWorkerId == socialWorkerId)
            .Include(v => v.Request!).ThenInclude(r => r.User)
            .Include(v => v.Request!).ThenInclude(r => r.Child)
            .OrderByDescending(v => v.ScheduledDate)
            .ToListAsync();
}
