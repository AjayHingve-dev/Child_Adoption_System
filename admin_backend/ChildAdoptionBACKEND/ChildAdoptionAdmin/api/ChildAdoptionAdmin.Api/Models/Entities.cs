using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ChildAdoptionAdmin.Api.Models;

[Table("admins")]
public class Admin
{
    [Key] public long AdminId { get; set; }
    public string FirstName { get; set; } = null!;
    public string? LastName { get; set; }
    public string Email { get; set; } = null!;
    public string Password { get; set; } = null!;
    public string? Phone { get; set; }
    public string Role { get; set; } = "ADMIN"; // ADMIN | SUPER_ADMIN
    public string Status { get; set; } = "ACTIVE";
    public DateTime CreatedAt { get; set; }
}

[Table("social_workers")]
public class SocialWorker
{
    [Key] public long SocialWorkerId { get; set; }
    public string SocialWorkerCode { get; set; } = null!;
    public string FirstName { get; set; } = null!;
    public string? LastName { get; set; }
    public string Email { get; set; } = null!;
    public string Password { get; set; } = null!;
    public string Phone { get; set; } = null!;
    public string? District { get; set; }
    public string? Area { get; set; }
    public string Status { get; set; } = "ACTIVE";
    public long? CreatedByAdminId { get; set; }
    public DateTime CreatedAt { get; set; }

    public ICollection<HomeVisit>? HomeVisits { get; set; }
}

[Table("users")]
public class ParentUser
{
    [Key] public long UserId { get; set; }
    public string FirstName { get; set; } = null!;
    public string? LastName { get; set; }
    public string Email { get; set; } = null!;
    public string Password { get; set; } = null!;
    public string Phone { get; set; } = null!;
    public string? Gender { get; set; }
    public DateTime? Dob { get; set; }
    public string? AadhaarNumber { get; set; }
    public string? MaritalStatus { get; set; }
    public string? Occupation { get; set; }
    public decimal? AnnualIncome { get; set; }
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? Pincode { get; set; }
    public string? ProfilePhoto { get; set; }
    public string Status { get; set; } = "ACTIVE";
    public DateTime CreatedAt { get; set; }
}

[Table("children")]
public class Child
{
    [Key] public long ChildId { get; set; }
    public string FirstName { get; set; } = null!;
    public string? LastName { get; set; }
    public string? Gender { get; set; }
    public DateTime? Dob { get; set; }
    public string? BloodGroup { get; set; }
    public string? MedicalNotes { get; set; }
    public string? HealthStatus { get; set; }
    public bool SpecialNeeds { get; set; }
    public string? Education { get; set; }
    public string? Hobbies { get; set; }
    public string? Description { get; set; }
    public string? ProfilePhoto { get; set; }
    public DateTime? AdmissionDate { get; set; }
    public string Status { get; set; } = "AVAILABLE"; // AVAILABLE | UNDER_PROCESS | ADOPTED
    public DateTime CreatedAt { get; set; }

    public ICollection<ChildMedicalHistory>? MedicalHistory { get; set; }
    public ICollection<Vaccination>? Vaccinations { get; set; }
}

[Table("adoption_requests")]
public class AdoptionRequest
{
    [Key] public long RequestId { get; set; }
    public string ApplicationNumber { get; set; } = null!;
    public long UserId { get; set; }
    public long ChildId { get; set; }
    public DateTime RequestDate { get; set; }
    public string Status { get; set; } = "PENDING"; // PENDING | UNDER_REVIEW | APPROVED | REJECTED
    public DateTime? StatusUpdatedAt { get; set; }
    public long? ReviewedByAdminId { get; set; }
    public string? AdminRemark { get; set; }

    public ParentUser? User { get; set; }
    public Child? Child { get; set; }
    public ICollection<HomeVisit>? HomeVisits { get; set; }
}

[Table("home_visits")]
public class HomeVisit
{
    [Key] public long HomeVisitId { get; set; }
    public string VisitCode { get; set; } = null!;
    public long RequestId { get; set; }
    public long SocialWorkerId { get; set; }
    public DateTime ScheduledDate { get; set; }
    public TimeSpan? ScheduledTime { get; set; }
    public string Status { get; set; } = "PENDING"; // PENDING | COMPLETED | CANCELLED
    public string? OverallImpression { get; set; }
    public string? FamilyEnvironment { get; set; }
    public string? FinancialStability { get; set; }
    public string? FamilySupport { get; set; }
    public string? AnyConcern { get; set; }
    public string? HomeCondition { get; set; }
    public string? FinancialStatus { get; set; }
    public string? FamilyBackground { get; set; }
    public string? Observations { get; set; }
    public string? Remarks { get; set; }
    public string? Recommendation { get; set; }
    public DateTime? CompletedAt { get; set; }
    public DateTime CreatedAt { get; set; }

    public AdoptionRequest? Request { get; set; }
    public SocialWorker? SocialWorker { get; set; }
}

[Table("user_documents")]
public class UserDocument
{
    [Key] public long DocumentId { get; set; }
    public long UserId { get; set; }
    public long? RequestId { get; set; }
    public string DocumentType { get; set; } = null!;
    public string FileName { get; set; } = null!;
    public string FilePath { get; set; } = null!;
    public string VerificationStatus { get; set; } = "PENDING";
    public DateTime UploadedAt { get; set; }
}

[Table("adoption_records")]
public class AdoptionRecord
{
    [Key] public long AdoptionId { get; set; }
    public long RequestId { get; set; }
    public long UserId { get; set; }
    public long ChildId { get; set; }
    public DateTime AdoptionDate { get; set; }
    public string? CertificateNumber { get; set; }
}

[Table("child_medical_history")]
public class ChildMedicalHistory
{
    [Key] public long MedicalId { get; set; }
    public long ChildId { get; set; }
    public string? Disease { get; set; }
    public string? Allergy { get; set; }
    public string? Treatment { get; set; }
    public string? DoctorName { get; set; }
}

[Table("vaccinations")]
public class Vaccination
{
    [Key] public long VaccinationId { get; set; }
    public long ChildId { get; set; }
    public string VaccineName { get; set; } = null!;
    public DateTime? VaccineDate { get; set; }
}

[Table("feedback")]
public class Feedback
{
    [Key] public long FeedbackId { get; set; }
    public long UserId { get; set; }
    public int Rating { get; set; }
    public string? Comments { get; set; }
    public DateTime CreatedAt { get; set; }
}

[Table("contact_us")]
public class ContactUs
{
    [Key] public long ContactId { get; set; }
    public string Name { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string? Phone { get; set; }
    public string Subject { get; set; } = null!;
    public string Message { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
}

[Table("system_settings")]
public class SystemSetting
{
    [Key] public string SettingKey { get; set; } = null!;
    public string? SettingValue { get; set; }
    public DateTime UpdatedAt { get; set; }
}
