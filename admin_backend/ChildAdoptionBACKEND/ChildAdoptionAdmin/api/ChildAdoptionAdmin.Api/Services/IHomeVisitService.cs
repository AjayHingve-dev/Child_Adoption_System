using ChildAdoptionAdmin.Api.DTOs;

namespace ChildAdoptionAdmin.Api.Services;

public interface IHomeVisitService
{
    Task<ApiResponse<HomeVisitResponse>> AssignVisitAsync(AdminAssignHomeVisitRequest request);
    Task<ApiResponse<PagedResponse<HomeVisitResponse>>> GetVisitsAsync(
        string? search, string? status, long? socialWorkerId, DateTime? visitDate, int page, int pageSize);
    Task<ApiResponse<HomeVisitDetailResponse>> GetVisitDetailAsync(long id);
    Task<ApiResponse<HomeVisitResponse>> UpdateVisitAsync(long id, AdminUpdateHomeVisitRequest request);
    Task<ApiResponse<HomeVisitResponse>> CancelVisitAsync(long id);
    Task<ApiResponse<HomeVisitReportResponse>> GetReportAsync(long id);
    Task<ApiResponse<HomeVisitReportResponse>> SubmitVisitReportAsync(long visitId, GenerateVisitReportRequest request);
    Task<ApiResponse<List<SocialWorkerMyHomeVisitResponse>>> GetMyVisitsAsync(long? socialWorkerId, string? email);
}
