using ChildAdoptionAdmin.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace ChildAdoptionAdmin.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Admin> Admins => Set<Admin>();
    public DbSet<SocialWorker> SocialWorkers => Set<SocialWorker>();
    public DbSet<ParentUser> Users => Set<ParentUser>();
    public DbSet<Child> Children => Set<Child>();
    public DbSet<AdoptionRequest> AdoptionRequests => Set<AdoptionRequest>();
    public DbSet<HomeVisit> HomeVisits => Set<HomeVisit>();
    public DbSet<UserDocument> UserDocuments => Set<UserDocument>();
    public DbSet<AdoptionRecord> AdoptionRecords => Set<AdoptionRecord>();
    public DbSet<ChildMedicalHistory> ChildMedicalHistories => Set<ChildMedicalHistory>();
    public DbSet<Vaccination> Vaccinations => Set<Vaccination>();
    public DbSet<Feedback> Feedbacks => Set<Feedback>();
    public DbSet<ContactUs> ContactMessages => Set<ContactUs>();
    public DbSet<SystemSetting> SystemSettings => Set<SystemSetting>();

    // Explicit column name mapping (snake_case in MySQL -> PascalCase in C#)
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Admin>(e =>
        {
            e.Property(p => p.AdminId).HasColumnName("admin_id");
            e.Property(p => p.FirstName).HasColumnName("first_name");
            e.Property(p => p.LastName).HasColumnName("last_name");
            e.Property(p => p.Email).HasColumnName("email");
            e.Property(p => p.Password).HasColumnName("password");
            e.Property(p => p.Phone).HasColumnName("phone");
            e.Property(p => p.Role).HasColumnName("role");
            e.Property(p => p.Status).HasColumnName("status");
            e.Property(p => p.CreatedAt).HasColumnName("created_at");
        });

        modelBuilder.Entity<SocialWorker>(e =>
        {
            e.Property(p => p.SocialWorkerId).HasColumnName("social_worker_id");
            e.Property(p => p.SocialWorkerCode).HasColumnName("social_worker_code");
            e.Property(p => p.FirstName).HasColumnName("first_name");
            e.Property(p => p.LastName).HasColumnName("last_name");
            e.Property(p => p.Email).HasColumnName("email");
            e.Property(p => p.Password).HasColumnName("password");
            e.Property(p => p.Phone).HasColumnName("phone");
            e.Property(p => p.District).HasColumnName("district");
            e.Property(p => p.Area).HasColumnName("area");
            e.Property(p => p.Status).HasColumnName("status");
            e.Property(p => p.CreatedByAdminId).HasColumnName("created_by_admin_id");
            e.Property(p => p.CreatedAt).HasColumnName("created_at");
        });

        modelBuilder.Entity<ParentUser>(e =>
        {
            e.ToTable("users");
            e.Property(p => p.UserId).HasColumnName("user_id");
            e.Property(p => p.FirstName).HasColumnName("first_name");
            e.Property(p => p.LastName).HasColumnName("last_name");
            e.Property(p => p.Email).HasColumnName("email");
            e.Property(p => p.Password).HasColumnName("password");
            e.Property(p => p.Phone).HasColumnName("phone");
            e.Property(p => p.Gender).HasColumnName("gender");
            e.Property(p => p.Dob).HasColumnName("dob");
            e.Property(p => p.AadhaarNumber).HasColumnName("aadhaar_number");
            e.Property(p => p.MaritalStatus).HasColumnName("marital_status");
            e.Property(p => p.Occupation).HasColumnName("occupation");
            e.Property(p => p.AnnualIncome).HasColumnName("annual_income");
            e.Property(p => p.Address).HasColumnName("address");
            e.Property(p => p.City).HasColumnName("city");
            e.Property(p => p.State).HasColumnName("state");
            e.Property(p => p.Pincode).HasColumnName("pincode");
            e.Property(p => p.ProfilePhoto).HasColumnName("profile_photo");
            e.Property(p => p.Status).HasColumnName("status");
            e.Property(p => p.CreatedAt).HasColumnName("created_at");
        });

        modelBuilder.Entity<Child>(e =>
        {
            e.Property(p => p.ChildId).HasColumnName("child_id");
            e.Property(p => p.FirstName).HasColumnName("first_name");
            e.Property(p => p.LastName).HasColumnName("last_name");
            e.Property(p => p.Gender).HasColumnName("gender");
            e.Property(p => p.Dob).HasColumnName("dob");
            e.Property(p => p.BloodGroup).HasColumnName("blood_group");
            e.Property(p => p.MedicalNotes).HasColumnName("medical_notes");
            e.Property(p => p.HealthStatus).HasColumnName("health_status");
            e.Property(p => p.SpecialNeeds).HasColumnName("special_needs");
            e.Property(p => p.Education).HasColumnName("education");
            e.Property(p => p.Hobbies).HasColumnName("hobbies");
            e.Property(p => p.Description).HasColumnName("description");
            e.Property(p => p.ProfilePhoto).HasColumnName("profile_photo");
            e.Property(p => p.AdmissionDate).HasColumnName("admission_date");
            e.Property(p => p.Status).HasColumnName("status");
            e.Property(p => p.CreatedAt).HasColumnName("created_at");
        });

        modelBuilder.Entity<AdoptionRequest>(e =>
        {
            e.Property(p => p.RequestId).HasColumnName("request_id");
            e.Property(p => p.ApplicationNumber).HasColumnName("application_number");
            e.Property(p => p.UserId).HasColumnName("user_id");
            e.Property(p => p.ChildId).HasColumnName("child_id");
            e.Property(p => p.RequestDate).HasColumnName("request_date");
            e.Property(p => p.Status).HasColumnName("status");
            e.Property(p => p.StatusUpdatedAt).HasColumnName("status_updated_at");
            e.Property(p => p.ReviewedByAdminId).HasColumnName("reviewed_by_admin_id");
            e.Property(p => p.AdminRemark).HasColumnName("admin_remark");

            e.HasOne(p => p.User).WithMany().HasForeignKey(p => p.UserId);
            e.HasOne(p => p.Child).WithMany().HasForeignKey(p => p.ChildId);
        });

        modelBuilder.Entity<HomeVisit>(e =>
        {
            e.Property(p => p.HomeVisitId).HasColumnName("home_visit_id");
            e.Property(p => p.VisitCode).HasColumnName("visit_code");
            e.Property(p => p.RequestId).HasColumnName("request_id");
            e.Property(p => p.SocialWorkerId).HasColumnName("social_worker_id");
            e.Property(p => p.ScheduledDate).HasColumnName("scheduled_date");
            e.Property(p => p.ScheduledTime).HasColumnName("scheduled_time");
            e.Property(p => p.Status).HasColumnName("status");
            e.Property(p => p.OverallImpression).HasColumnName("overall_impression");
            e.Property(p => p.FamilyEnvironment).HasColumnName("family_environment");
            e.Property(p => p.FinancialStability).HasColumnName("financial_stability");
            e.Property(p => p.FamilySupport).HasColumnName("family_support");
            e.Property(p => p.AnyConcern).HasColumnName("any_concern");
            e.Property(p => p.Remarks).HasColumnName("remarks");
            e.Property(p => p.CompletedAt).HasColumnName("completed_at");
            e.Property(p => p.CreatedAt).HasColumnName("created_at");

            e.HasOne(p => p.Request).WithMany(r => r.HomeVisits).HasForeignKey(p => p.RequestId);
            e.HasOne(p => p.SocialWorker).WithMany(s => s.HomeVisits).HasForeignKey(p => p.SocialWorkerId);
        });

        modelBuilder.Entity<UserDocument>(e =>
        {
            e.Property(p => p.DocumentId).HasColumnName("document_id");
            e.Property(p => p.UserId).HasColumnName("user_id");
            e.Property(p => p.RequestId).HasColumnName("request_id");
            e.Property(p => p.DocumentType).HasColumnName("document_type");
            e.Property(p => p.FileName).HasColumnName("file_name");
            e.Property(p => p.FilePath).HasColumnName("file_path");
            e.Property(p => p.VerificationStatus).HasColumnName("verification_status");
            e.Property(p => p.UploadedAt).HasColumnName("uploaded_at");
        });

        modelBuilder.Entity<AdoptionRecord>(e =>
        {
            e.Property(p => p.AdoptionId).HasColumnName("adoption_id");
            e.Property(p => p.RequestId).HasColumnName("request_id");
            e.Property(p => p.UserId).HasColumnName("user_id");
            e.Property(p => p.ChildId).HasColumnName("child_id");
            e.Property(p => p.AdoptionDate).HasColumnName("adoption_date");
            e.Property(p => p.CertificateNumber).HasColumnName("certificate_number");
        });

        modelBuilder.Entity<ChildMedicalHistory>(e =>
        {
            e.ToTable("child_medical_history");
            e.Property(p => p.MedicalId).HasColumnName("medical_id");
            e.Property(p => p.ChildId).HasColumnName("child_id");
            e.Property(p => p.Disease).HasColumnName("disease");
            e.Property(p => p.Allergy).HasColumnName("allergy");
            e.Property(p => p.Treatment).HasColumnName("treatment");
            e.Property(p => p.DoctorName).HasColumnName("doctor_name");

            e.HasOne<Child>().WithMany(c => c.MedicalHistory).HasForeignKey(p => p.ChildId);
        });

        modelBuilder.Entity<Vaccination>(e =>
        {
            e.Property(p => p.VaccinationId).HasColumnName("vaccination_id");
            e.Property(p => p.ChildId).HasColumnName("child_id");
            e.Property(p => p.VaccineName).HasColumnName("vaccine_name");
            e.Property(p => p.VaccineDate).HasColumnName("vaccine_date");

            e.HasOne<Child>().WithMany(c => c.Vaccinations).HasForeignKey(p => p.ChildId);
        });

        modelBuilder.Entity<Feedback>(e =>
        {
            e.Property(p => p.FeedbackId).HasColumnName("feedback_id");
            e.Property(p => p.UserId).HasColumnName("user_id");
            e.Property(p => p.Rating).HasColumnName("rating");
            e.Property(p => p.Comments).HasColumnName("comments");
            e.Property(p => p.CreatedAt).HasColumnName("created_at");
        });

        modelBuilder.Entity<ContactUs>(e =>
        {
            e.ToTable("contact_us");
            e.Property(p => p.ContactId).HasColumnName("contact_id");
            e.Property(p => p.Name).HasColumnName("name");
            e.Property(p => p.Email).HasColumnName("email");
            e.Property(p => p.Phone).HasColumnName("phone");
            e.Property(p => p.Subject).HasColumnName("subject");
            e.Property(p => p.Message).HasColumnName("message");
            e.Property(p => p.CreatedAt).HasColumnName("created_at");
        });

        modelBuilder.Entity<SystemSetting>(e =>
        {
            e.ToTable("system_settings");
            e.Property(p => p.SettingKey).HasColumnName("setting_key");
            e.Property(p => p.SettingValue).HasColumnName("setting_value");
            e.Property(p => p.UpdatedAt).HasColumnName("updated_at");
        });
    }
}
