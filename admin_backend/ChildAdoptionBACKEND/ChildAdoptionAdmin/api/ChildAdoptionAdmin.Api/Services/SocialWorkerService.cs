using ChildAdoptionAdmin.Api.DTOs;
using ChildAdoptionAdmin.Api.Models;
using ChildAdoptionAdmin.Api.Repositories;

namespace ChildAdoptionAdmin.Api.Services;

public class SocialWorkerService : ISocialWorkerService
{
    private readonly ISocialWorkerRepository _repo;

    public SocialWorkerService(ISocialWorkerRepository repo)
    {
        _repo = repo;
    }

    public async Task<ApiResponse<SocialWorkerResponse>> CreateAsync(CreateSocialWorkerRequest request, long? adminId)
    {
        // Validation
        if (string.IsNullOrWhiteSpace(request.FirstName))
            return ApiResponse<SocialWorkerResponse>.Fail("First Name is required.");

        if (string.IsNullOrWhiteSpace(request.Email) || !request.Email.Contains('@'))
            return ApiResponse<SocialWorkerResponse>.Fail("A valid Email is required.");

        if (string.IsNullOrWhiteSpace(request.Phone))
            return ApiResponse<SocialWorkerResponse>.Fail("Phone number is required.");

        if (request.Phone.Length < 10 || request.Phone.Length > 15 || !request.Phone.All(char.IsDigit))
            return ApiResponse<SocialWorkerResponse>.Fail("Phone must contain 10 to 15 digits.");

        if (string.IsNullOrWhiteSpace(request.Password))
            return ApiResponse<SocialWorkerResponse>.Fail("Password is required.");

        if (await _repo.ExistsEmailAsync(request.Email))
            return ApiResponse<SocialWorkerResponse>.Fail("Duplicate email found.");

        if (await _repo.ExistsPhoneAsync(request.Phone))
            return ApiResponse<SocialWorkerResponse>.Fail("Duplicate phone number found.");

        var count = await _repo.CountAsync();
        var code = CodeGenerator.Generate("SW", count + 1);

        var entity = new SocialWorker
        {
            SocialWorkerCode = code,
            FirstName = request.FirstName.Trim(),
            LastName = string.IsNullOrWhiteSpace(request.LastName) ? null : request.LastName.Trim(),
            Email = request.Email.Trim().ToLowerInvariant(),
            Password = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Phone = request.Phone.Trim(),
            District = string.IsNullOrWhiteSpace(request.District) ? null : request.District.Trim(),
            Area = string.IsNullOrWhiteSpace(request.Area) ? null : request.Area.Trim(),
            Status = string.IsNullOrWhiteSpace(request.Status) ? "ACTIVE" : request.Status.Trim().ToUpperInvariant(),
            CreatedByAdminId = adminId,
            CreatedAt = DateTime.UtcNow
        };

        var created = await _repo.AddAsync(entity);

        var dto = MapToDto(created, 0, 0, 0);
        return ApiResponse<SocialWorkerResponse>.Ok(dto, "Social Worker created successfully");
    }

    public async Task<ApiResponse<PagedResponse<SocialWorkerResponse>>> GetAllAsync(
        string? search, string? status, int page, int pageSize)
    {
        var (items, totalCount) = await _repo.GetPagedAsync(search, status, page, pageSize);

        var dtos = new List<SocialWorkerResponse>();
        foreach (var item in items)
        {
            var (assigned, completed, pending) = await _repo.GetVisitCountsAsync(item.SocialWorkerId);
            dtos.Add(MapToDto(item, assigned, completed, pending));
        }

        var paged = new PagedResponse<SocialWorkerResponse>(dtos, totalCount, page > 0 ? page : 1, pageSize > 0 ? pageSize : 10);
        return ApiResponse<PagedResponse<SocialWorkerResponse>>.Ok(paged, "Social Workers retrieved successfully");
    }

    public async Task<ApiResponse<SocialWorkerDetailResponse>> GetByIdAsync(long id)
    {
        var worker = await _repo.GetByIdAsync(id);
        if (worker is null)
            return ApiResponse<SocialWorkerDetailResponse>.Fail("Social worker not found.");

        var (assignedCount, completedCount, pendingCount) = await _repo.GetVisitCountsAsync(id);
        var profileDto = MapToDto(worker, assignedCount, completedCount, pendingCount);

        var visits = await _repo.GetVisitsByWorkerIdAsync(id);

        var visitDtos = visits.Select(v => new HomeVisitResponse(
            v.HomeVisitId,
            v.VisitCode,
            v.RequestId,
            v.Request?.ApplicationNumber ?? "",
            v.Request?.User != null ? $"{v.Request.User.FirstName} {v.Request.User.LastName}".Trim() : "",
            v.Request?.Child != null ? $"{v.Request.Child.FirstName} {v.Request.Child.LastName}".Trim() : "",
            v.SocialWorkerId,
            $"{worker.FirstName} {worker.LastName}".Trim(),
            v.ScheduledDate,
            v.ScheduledTime,
            v.Status,
            v.Remarks)).ToList();

        var assignedVisits = visitDtos;
        var completedVisits = visitDtos.Where(v => v.Status == "COMPLETED").ToList();
        var pendingVisits = visitDtos.Where(v => v.Status == "PENDING").ToList();

        var detail = new SocialWorkerDetailResponse(profileDto, assignedVisits, completedVisits, pendingVisits);
        return ApiResponse<SocialWorkerDetailResponse>.Ok(detail, "Social Worker profile retrieved successfully");
    }

    public async Task<ApiResponse<SocialWorkerResponse>> UpdateAsync(long id, UpdateSocialWorkerRequest request)
    {
        var entity = await _repo.GetByIdAsync(id);
        if (entity is null)
            return ApiResponse<SocialWorkerResponse>.Fail("Social worker not found.");

        if (string.IsNullOrWhiteSpace(request.FirstName))
            return ApiResponse<SocialWorkerResponse>.Fail("First Name is required.");

        if (string.IsNullOrWhiteSpace(request.Phone))
            return ApiResponse<SocialWorkerResponse>.Fail("Phone number is required.");

        if (request.Phone.Length < 10 || request.Phone.Length > 15 || !request.Phone.All(char.IsDigit))
            return ApiResponse<SocialWorkerResponse>.Fail("Phone must contain 10 to 15 digits.");

        if (await _repo.ExistsPhoneAsync(request.Phone, id))
            return ApiResponse<SocialWorkerResponse>.Fail("Duplicate phone number found.");

        entity.FirstName = request.FirstName.Trim();
        entity.LastName = string.IsNullOrWhiteSpace(request.LastName) ? null : request.LastName.Trim();
        entity.Phone = request.Phone.Trim();
        entity.District = string.IsNullOrWhiteSpace(request.District) ? null : request.District.Trim();
        entity.Area = string.IsNullOrWhiteSpace(request.Area) ? null : request.Area.Trim();
        if (!string.IsNullOrWhiteSpace(request.Status))
            entity.Status = request.Status.Trim().ToUpperInvariant();

        await _repo.UpdateAsync(entity);

        var (assigned, completed, pending) = await _repo.GetVisitCountsAsync(id);
        var dto = MapToDto(entity, assigned, completed, pending);

        return ApiResponse<SocialWorkerResponse>.Ok(dto, "Social Worker updated successfully");
    }

    public async Task<ApiResponse<SocialWorkerResponse>> ActivateAsync(long id)
    {
        var entity = await _repo.GetByIdAsync(id);
        if (entity is null)
            return ApiResponse<SocialWorkerResponse>.Fail("Social worker not found.");

        entity.Status = "ACTIVE";
        await _repo.UpdateAsync(entity);

        var (assigned, completed, pending) = await _repo.GetVisitCountsAsync(id);
        return ApiResponse<SocialWorkerResponse>.Ok(MapToDto(entity, assigned, completed, pending), "Social Worker activated successfully");
    }

    public async Task<ApiResponse<SocialWorkerResponse>> DeactivateAsync(long id)
    {
        var entity = await _repo.GetByIdAsync(id);
        if (entity is null)
            return ApiResponse<SocialWorkerResponse>.Fail("Social worker not found.");

        entity.Status = "INACTIVE";
        await _repo.UpdateAsync(entity);

        var (assigned, completed, pending) = await _repo.GetVisitCountsAsync(id);
        return ApiResponse<SocialWorkerResponse>.Ok(MapToDto(entity, assigned, completed, pending), "Social Worker deactivated successfully");
    }

    public async Task<ApiResponse> DeleteAsync(long id)
    {
        var entity = await _repo.GetByIdAsync(id);
        if (entity is null)
            return ApiResponse.Fail("Social worker not found.");

        var hasPending = await _repo.HasPendingHomeVisitsAsync(id);
        if (hasPending)
        {
            return ApiResponse.Fail("Cannot delete social worker because pending visits exist.");
        }

        await _repo.DeleteAsync(entity);
        return ApiResponse.Ok("Social worker deleted successfully");
    }

    private static SocialWorkerResponse MapToDto(SocialWorker s, int assigned, int completed, int pending) =>
        new SocialWorkerResponse(
            s.SocialWorkerId,
            s.SocialWorkerCode,
            s.FirstName,
            s.LastName,
            s.Email,
            s.Phone,
            s.District,
            s.Area,
            s.Status,
            s.CreatedAt,
            assigned,
            completed,
            pending);
}
