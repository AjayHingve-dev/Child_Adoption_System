using ChildAdoptionAdmin.Api.Models;

namespace ChildAdoptionAdmin.Api.Repositories;

public interface ISocialWorkerRepository
{
    Task<SocialWorker?> GetByIdAsync(long id);
    Task<SocialWorker?> GetByEmailAsync(string email);
    Task<SocialWorker?> GetByPhoneAsync(string phone);
    Task<bool> ExistsEmailAsync(string email, long? excludeId = null);
    Task<bool> ExistsPhoneAsync(string phone, long? excludeId = null);
    Task<(List<SocialWorker> Items, int TotalCount)> GetPagedAsync(
        string? search, string? status, int page, int pageSize);
    Task<int> CountAsync();
    Task<SocialWorker> AddAsync(SocialWorker entity);
    Task UpdateAsync(SocialWorker entity);
    Task DeleteAsync(SocialWorker entity);
    Task<bool> HasPendingHomeVisitsAsync(long socialWorkerId);
    Task<(int Assigned, int Completed, int Pending)> GetVisitCountsAsync(long socialWorkerId);
    Task<List<HomeVisit>> GetVisitsByWorkerIdAsync(long socialWorkerId);
}
