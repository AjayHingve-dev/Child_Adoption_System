namespace ChildAdoptionAdmin.Api.DTOs;

// ---------- Auth ----------
public record LoginRequest(string Email, string Password);
public record LoginResponse(string Token, string FullName, string Email, string Role);

public record RegisterAdminRequest(
    string FirstName,
    string? LastName,
    string Email,
    string Password,
    string Phone);

public record RegisterAdminResponse(
    long AdminId,
    string FirstName,
    string? LastName,
    string FullName,
    string Email,
    string Phone,
    string Role,
    string Status,
    DateTime CreatedAt);

public record LogoutResponse(string Message);

// ---------- Dashboard ----------
public record DashboardStatsResponse(
    int TotalParents,
    int TotalChildren,
    int TotalApplications,
    int UnderReviewApplications,
    int ApprovedApplications,
    int RejectedApplications,
    int PendingHomeVisits,
    int CompletedHomeVisits
);

// ---------- Social Workers ----------
public record CreateSocialWorkerRequest(
    string FirstName, string? LastName, string Email, string Password,
    string Phone, string? District, string? Area);

public record UpdateSocialWorkerRequest(
    string FirstName, string? LastName, string? District, string? Area, string Status);

public record SocialWorkerResponse(
    long SocialWorkerId, string SocialWorkerCode, string FirstName, string? LastName,
    string Email, string Phone, string? District, string? Area, string Status, DateTime CreatedAt);

// ---------- Admins ----------
public record CreateAdminRequest(string FirstName, string? LastName, string Email, string Password, string? Phone, string Role);
public record AdminResponse(long AdminId, string FirstName, string? LastName, string Email, string? Phone, string Role, string Status, DateTime CreatedAt);
public record UpdateAdminProfileRequest(string FirstName, string? LastName, string? Phone);
public record ChangePasswordRequest(string CurrentPassword, string NewPassword);

// ---------- Parents (Users) ----------
public record ParentResponse(
    long UserId, string FirstName, string? LastName, string Email, string Phone,
    string? Gender, DateTime? Dob, string? AadhaarNumber, string? MaritalStatus, string? Occupation,
    decimal? AnnualIncome, string? Address, string? City, string? State, string? Pincode,
    string? ProfilePhoto, string Status, DateTime CreatedAt);
public record UpdateParentStatusRequest(string Status);
public record VerifyDocumentRequest(string VerificationStatus);
public record ParentDocumentResponse(long DocumentId,long UserId,long? RequestId,string DocumentType,string FileName,string FilePath,string VerificationStatus,DateTime UploadedAt);

// ---------- Children ----------
public record CreateChildRequest(
    string FirstName, string? LastName, string? Gender, DateTime? Dob,
    string? BloodGroup, string? MedicalNotes, string? HealthStatus, bool? SpecialNeeds,
    string? Education, string? Hobbies, string? Description, string? ProfilePhoto,
    DateTime? AdmissionDate, string? Status);
public record UpdateChildRequest(
    string? HealthStatus, string? Education, string? MedicalNotes, bool? SpecialNeeds,
    string? Description, string? ProfilePhoto, string Status);
public record ChildResponse(
    long ChildId, string FirstName, string? LastName, string? Gender, DateTime? Dob, int? Age,
    string? BloodGroup, string? HealthStatus, string? MedicalNotes, bool SpecialNeeds,
    string? Education, string? Hobbies, string? Description, string? ProfilePhoto,
    DateTime? AdmissionDate, string Status, DateTime CreatedAt);

// ---------- Applications (Adoption Requests) ----------
public record ApplicationResponse(
    long RequestId, string ApplicationNumber, long UserId, string ParentName,
    long ChildId, string ChildName, DateTime RequestDate, string Status, string? AdminRemark);

public record ReviewApplicationRequest(string Status, string? AdminRemark); // Status: UNDER_REVIEW | APPROVED | REJECTED

// ---------- Home Visits ----------
public record ScheduleHomeVisitRequest(long RequestId, long SocialWorkerId, DateTime ScheduledDate, TimeSpan? ScheduledTime, string? Notes);
public record UpdateHomeVisitRequest(long SocialWorkerId, DateTime ScheduledDate, TimeSpan? ScheduledTime, string? Notes);

public record CompleteHomeVisitRequest(
    string? OverallImpression, string? FamilyEnvironment, string? FinancialStability,
    string? FamilySupport, string? AnyConcern, string? Remarks);

public record HomeVisitResponse(
    long HomeVisitId, string VisitCode, long RequestId, string ApplicationNumber, string ParentName,
    string ChildName, long SocialWorkerId, string SocialWorkerName, DateTime ScheduledDate,
    TimeSpan? ScheduledTime, string Status, string? Remarks);

public record HomeVisitDetailResponse(
    long HomeVisitId, string VisitCode, long RequestId, string ApplicationNumber,
    long ParentId, string ParentName, string ParentEmail, string ParentPhone, string? ParentAddress, string? ParentCity, string? ParentState,
    long ChildId, string ChildName, long SocialWorkerId, string SocialWorkerName, string SocialWorkerPhone,
    DateTime ScheduledDate, TimeSpan? ScheduledTime, string Status,
    string? OverallImpression, string? FamilyEnvironment, string? FinancialStability,
    string? FamilySupport, string? AnyConcern, string? Remarks, DateTime? CompletedAt, DateTime CreatedAt);

// ---------- Reports ----------
public record ReportRequest(string ReportType, DateTime? From, DateTime? To); // e.g. APPLICATION_SUMMARY, HOME_VISIT, CHILD_MATCHING, ADOPTION_DECISION, MONTHLY_ACTIVITY, USER_ACTIVITY

// ---------- System Settings ----------
public record UpdateSettingRequest(string Key, string? Value);
public record SettingResponse(string Key, string? Value, DateTime UpdatedAt);

public record ChildMedicalHistoryResponse(long MedicalId,string? Disease,string? Allergy,string? Treatment,string? DoctorName);
public record VaccinationResponse(long VaccinationId,string VaccineName,DateTime? VaccineDate);
public record ChildDetailResponse(ChildResponse Child,List<ChildMedicalHistoryResponse> MedicalHistory,List<VaccinationResponse> Vaccinations,int AdoptionRequestCount);

public record ApplicationDetailResponse(
    ApplicationResponse Application,
    ParentResponse Parent,
    ChildResponse Child,
    List<ParentDocumentResponse> Documents,
    List<HomeVisitResponse> HomeVisits);
