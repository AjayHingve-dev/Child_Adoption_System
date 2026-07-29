using ChildAdoptionAdmin.Api.DTOs;

namespace ChildAdoptionAdmin.Api.Services;

public interface ISocialWorkerService
{
    Task<ApiResponse<SocialWorkerResponse>> CreateAsync(CreateSocialWorkerRequest request, long? adminId);
    Task<ApiResponse<PagedResponse<SocialWorkerResponse>>> GetAllAsync(string? search, string? status, int page, int pageSize);
    Task<ApiResponse<SocialWorkerDetailResponse>> GetByIdAsync(long id);
    Task<ApiResponse<SocialWorkerResponse>> UpdateAsync(long id, UpdateSocialWorkerRequest request);
    Task<ApiResponse<SocialWorkerResponse>> ActivateAsync(long id);
    Task<ApiResponse<SocialWorkerResponse>> DeactivateAsync(long id);
    Task<ApiResponse> DeleteAsync(long id);
}
