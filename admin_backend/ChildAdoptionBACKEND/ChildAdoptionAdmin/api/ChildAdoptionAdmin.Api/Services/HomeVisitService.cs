using ChildAdoptionAdmin.Api.Data;
using ChildAdoptionAdmin.Api.DTOs;
using ChildAdoptionAdmin.Api.Models;
using ChildAdoptionAdmin.Api.Repositories;
using Microsoft.EntityFrameworkCore;

namespace ChildAdoptionAdmin.Api.Services;

public class HomeVisitService : IHomeVisitService
{
    private readonly IHomeVisitRepository _visitRepo;
    private readonly ISocialWorkerRepository _workerRepo;
    private readonly AppDbContext _db;

    public HomeVisitService(
        IHomeVisitRepository visitRepo,
        ISocialWorkerRepository workerRepo,
        AppDbContext db)
    {
        _visitRepo = visitRepo;
        _workerRepo = workerRepo;
        _db = db;
    }

    public async Task<ApiResponse<HomeVisitResponse>> AssignVisitAsync(AdminAssignHomeVisitRequest request)
    {
        if (request.VisitDate.Date < DateTime.Today)
            return ApiResponse<HomeVisitResponse>.Fail("Visit date cannot be in the past.");

        var adoptionRequest = await _db.AdoptionRequests
            .Include(r => r.Child)
            .Include(r => r.User)
            .FirstOrDefaultAsync(r => r.RequestId == request.AdoptionRequestId);

        if (adoptionRequest is null)
            return ApiResponse<HomeVisitResponse>.Fail("Adoption request does not exist.");

        if (adoptionRequest.Status is "APPROVED" or "REJECTED")
            return ApiResponse<HomeVisitResponse>.Fail("Cannot assign home visit to a closed application.");

        var socialWorker = await _workerRepo.GetByIdAsync(request.SocialWorkerId);
        if (socialWorker is null)
            return ApiResponse<HomeVisitResponse>.Fail("Social worker does not exist.");

        if (!socialWorker.Status.Equals("ACTIVE", StringComparison.OrdinalIgnoreCase))
            return ApiResponse<HomeVisitResponse>.Fail("Only active social workers can be assigned.");

        var hasActive = await _visitRepo.HasActiveVisitForRequestAsync(request.AdoptionRequestId);
        if (hasActive)
            return ApiResponse<HomeVisitResponse>.Fail("This adoption request already has an active or pending home visit.");

        var count = await _db.HomeVisits.CountAsync();
        var visitCode = CodeGenerator.Generate("HV", count + 1);

        var entity = new HomeVisit
        {
            VisitCode = visitCode,
            RequestId = request.AdoptionRequestId,
            SocialWorkerId = request.SocialWorkerId,
            ScheduledDate = request.VisitDate.Date,
            Status = "PENDING",
            Remarks = request.Remarks?.Trim(),
            CreatedAt = DateTime.UtcNow
        };

        // Automatically update Adoption Request Status
        adoptionRequest.Status = "HOME_VISIT_ASSIGNED";
        adoptionRequest.StatusUpdatedAt = DateTime.UtcNow;
        if (adoptionRequest.Child != null && adoptionRequest.Child.Status == "AVAILABLE")
        {
            adoptionRequest.Child.Status = "UNDER_PROCESS";
        }

        var created = await _visitRepo.AddAsync(entity);

        var dto = new HomeVisitResponse(
            created.HomeVisitId,
            created.VisitCode,
            created.RequestId,
            adoptionRequest.ApplicationNumber,
            $"{adoptionRequest.User?.FirstName} {adoptionRequest.User?.LastName}".Trim(),
            $"{adoptionRequest.Child?.FirstName} {adoptionRequest.Child?.LastName}".Trim(),
            created.SocialWorkerId,
            $"{socialWorker.FirstName} {socialWorker.LastName}".Trim(),
            created.ScheduledDate,
            created.ScheduledTime,
            created.Status,
            created.Remarks);

        return ApiResponse<HomeVisitResponse>.Ok(dto, "Home Visit assigned successfully");
    }

    public async Task<ApiResponse<PagedResponse<HomeVisitResponse>>> GetVisitsAsync(
        string? search, string? status, long? socialWorkerId, DateTime? visitDate, int page, int pageSize)
    {
        var (items, totalCount) = await _visitRepo.GetPagedAsync(
            search, status, socialWorkerId, visitDate, page, pageSize);

        var dtos = items.Select(v => new HomeVisitResponse(
            v.HomeVisitId,
            v.VisitCode,
            v.RequestId,
            v.Request?.ApplicationNumber ?? "",
            v.Request?.User != null ? $"{v.Request.User.FirstName} {v.Request.User.LastName}".Trim() : "",
            v.Request?.Child != null ? $"{v.Request.Child.FirstName} {v.Request.Child.LastName}".Trim() : "",
            v.SocialWorkerId,
            v.SocialWorker != null ? $"{v.SocialWorker.FirstName} {v.SocialWorker.LastName}".Trim() : "",
            v.ScheduledDate,
            v.ScheduledTime,
            v.Status,
            v.Remarks)).ToList();

        var paged = new PagedResponse<HomeVisitResponse>(dtos, totalCount, page > 0 ? page : 1, pageSize > 0 ? pageSize : 10);
        return ApiResponse<PagedResponse<HomeVisitResponse>>.Ok(paged, "Home Visits retrieved successfully");
    }

    public async Task<ApiResponse<HomeVisitDetailResponse>> GetVisitDetailAsync(long id)
    {
        var v = await _visitRepo.GetDetailByIdAsync(id);
        if (v is null || v.Request is null || v.Request.User is null || v.Request.Child is null || v.SocialWorker is null)
            return ApiResponse<HomeVisitDetailResponse>.Fail("Home visit not found.");

        var dto = new HomeVisitDetailResponse(
            v.HomeVisitId,
            v.VisitCode,
            v.RequestId,
            v.Request.ApplicationNumber,
            v.Request.UserId,
            $"{v.Request.User.FirstName} {v.Request.User.LastName}".Trim(),
            v.Request.User.Email,
            v.Request.User.Phone,
            v.Request.User.Address,
            v.Request.User.City,
            v.Request.User.State,
            v.Request.ChildId,
            $"{v.Request.Child.FirstName} {v.Request.Child.LastName}".Trim(),
            v.SocialWorkerId,
            $"{v.SocialWorker.FirstName} {v.SocialWorker.LastName}".Trim(),
            v.SocialWorker.Phone,
            v.ScheduledDate,
            v.ScheduledTime,
            v.Status,
            v.OverallImpression,
            v.FamilyEnvironment,
            v.FinancialStability,
            v.FamilySupport,
            v.AnyConcern,
            v.Remarks,
            v.CompletedAt,
            v.CreatedAt);

        return ApiResponse<HomeVisitDetailResponse>.Ok(dto, "Home visit detail retrieved successfully");
    }

    public async Task<ApiResponse<HomeVisitResponse>> UpdateVisitAsync(long id, AdminUpdateHomeVisitRequest request)
    {
        var visit = await _visitRepo.GetByIdAsync(id);
        if (visit is null)
            return ApiResponse<HomeVisitResponse>.Fail("Home visit not found.");

        if (visit.Status == "COMPLETED")
            return ApiResponse<HomeVisitResponse>.Fail("Completed visit cannot be updated.");

        if (visit.Status == "CANCELLED")
            return ApiResponse<HomeVisitResponse>.Fail("Cancelled visit cannot be updated.");

        if (request.VisitDate.HasValue && request.VisitDate.Value.Date < DateTime.Today)
            return ApiResponse<HomeVisitResponse>.Fail("Visit date cannot be in the past.");

        if (request.SocialWorkerId.HasValue && request.SocialWorkerId.Value != visit.SocialWorkerId)
        {
            var worker = await _workerRepo.GetByIdAsync(request.SocialWorkerId.Value);
            if (worker is null)
                return ApiResponse<HomeVisitResponse>.Fail("Social worker not found.");
            if (!worker.Status.Equals("ACTIVE", StringComparison.OrdinalIgnoreCase))
                return ApiResponse<HomeVisitResponse>.Fail("Only active social workers can be assigned.");

            visit.SocialWorkerId = request.SocialWorkerId.Value;
        }

        if (request.VisitDate.HasValue)
            visit.ScheduledDate = request.VisitDate.Value.Date;

        if (request.Remarks != null)
            visit.Remarks = request.Remarks.Trim();

        await _visitRepo.UpdateAsync(visit);

        var updatedDetail = await _visitRepo.GetDetailByIdAsync(id);
        var dto = new HomeVisitResponse(
            visit.HomeVisitId,
            visit.VisitCode,
            visit.RequestId,
            updatedDetail?.Request?.ApplicationNumber ?? "",
            updatedDetail?.Request?.User != null ? $"{updatedDetail.Request.User.FirstName} {updatedDetail.Request.User.LastName}".Trim() : "",
            updatedDetail?.Request?.Child != null ? $"{updatedDetail.Request.Child.FirstName} {updatedDetail.Request.Child.LastName}".Trim() : "",
            visit.SocialWorkerId,
            updatedDetail?.SocialWorker != null ? $"{updatedDetail.SocialWorker.FirstName} {updatedDetail.SocialWorker.LastName}".Trim() : "",
            visit.ScheduledDate,
            visit.ScheduledTime,
            visit.Status,
            visit.Remarks);

        return ApiResponse<HomeVisitResponse>.Ok(dto, "Home Visit updated successfully");
    }

    public async Task<ApiResponse<HomeVisitResponse>> CancelVisitAsync(long id)
    {
        var visit = await _visitRepo.GetByIdAsync(id);
        if (visit is null)
            return ApiResponse<HomeVisitResponse>.Fail("Home visit not found.");

        if (visit.Status == "COMPLETED")
            return ApiResponse<HomeVisitResponse>.Fail("Completed visit cannot be cancelled.");

        if (visit.Status == "CANCELLED")
            return ApiResponse<HomeVisitResponse>.Fail("This visit is already cancelled.");

        visit.Status = "CANCELLED";

        if (visit.Request != null)
        {
            visit.Request.Status = "PENDING";
            visit.Request.StatusUpdatedAt = DateTime.UtcNow;
        }

        await _visitRepo.UpdateAsync(visit);

        var updatedDetail = await _visitRepo.GetDetailByIdAsync(id);
        var dto = new HomeVisitResponse(
            visit.HomeVisitId,
            visit.VisitCode,
            visit.RequestId,
            updatedDetail?.Request?.ApplicationNumber ?? "",
            updatedDetail?.Request?.User != null ? $"{updatedDetail.Request.User.FirstName} {updatedDetail.Request.User.LastName}".Trim() : "",
            updatedDetail?.Request?.Child != null ? $"{updatedDetail.Request.Child.FirstName} {updatedDetail.Request.Child.LastName}".Trim() : "",
            visit.SocialWorkerId,
            updatedDetail?.SocialWorker != null ? $"{updatedDetail.SocialWorker.FirstName} {updatedDetail.SocialWorker.LastName}".Trim() : "",
            visit.ScheduledDate,
            visit.ScheduledTime,
            visit.Status,
            visit.Remarks);

        return ApiResponse<HomeVisitResponse>.Ok(dto, "Home Visit cancelled successfully");
    }

    public async Task<ApiResponse<HomeVisitReportResponse>> GetReportAsync(long id)
    {
        var visit = await _visitRepo.GetByIdAsync(id);
        if (visit is null)
            return ApiResponse<HomeVisitReportResponse>.Fail("Home visit not found.");

        var report = new HomeVisitReportResponse(
            visit.HomeVisitId,
            visit.VisitCode,
            visit.RequestId,
            visit.SocialWorkerId,
            HomeCondition: visit.OverallImpression ?? visit.FamilyEnvironment,
            FamilyBackground: visit.FamilyEnvironment,
            FinancialStability: visit.FinancialStability,
            CriminalBackground: visit.AnyConcern != null && visit.AnyConcern.ToLower().Contains("criminal") ? visit.AnyConcern : "No criminal background reported",
            ParentInteraction: visit.FamilySupport,
            ChildSafety: visit.AnyConcern ?? "Satisfactory and safe environment",
            Recommendation: visit.Remarks ?? visit.OverallImpression ?? "Recommended for approval",
            Remarks: visit.Remarks,
            CompletedAt: visit.CompletedAt);

        return ApiResponse<HomeVisitReportResponse>.Ok(report, "Home visit report retrieved successfully");
    }
}
