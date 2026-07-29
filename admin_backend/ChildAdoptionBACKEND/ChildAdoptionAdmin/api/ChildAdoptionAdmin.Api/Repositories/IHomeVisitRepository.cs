using ChildAdoptionAdmin.Api.Models;

namespace ChildAdoptionAdmin.Api.Repositories;

public interface IHomeVisitRepository
{
    Task<HomeVisit?> GetByIdAsync(long id);
    Task<HomeVisit?> GetDetailByIdAsync(long id);
    Task<(List<HomeVisit> Items, int TotalCount)> GetPagedAsync(
        string? search, string? status, long? socialWorkerId, DateTime? visitDate, int page, int pageSize);
    Task<HomeVisit> AddAsync(HomeVisit entity);
    Task UpdateAsync(HomeVisit entity);
    Task<bool> HasActiveVisitForRequestAsync(long requestId);
    Task<int> CountByStatusAsync(string status);
}
