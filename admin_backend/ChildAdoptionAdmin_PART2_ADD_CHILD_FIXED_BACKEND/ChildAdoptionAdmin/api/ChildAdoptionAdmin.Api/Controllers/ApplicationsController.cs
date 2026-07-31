using ChildAdoptionAdmin.Api.Data;
using ChildAdoptionAdmin.Api.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace ChildAdoptionAdmin.Api.Controllers;

[ApiController]
[Route("api/applications")]
[Authorize(Roles="ADMIN,SUPER_ADMIN")]
public class ApplicationsController : ControllerBase
{
    private readonly AppDbContext _db;
    private static readonly string[] ReviewStatuses={"UNDER_REVIEW","APPROVED","REJECTED"};
    public ApplicationsController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<List<ApplicationResponse>>> GetAll([FromQuery] string? status,[FromQuery] string? search)
    {
        var query=_db.AdoptionRequests.AsNoTracking().Include(r=>r.User).Include(r=>r.Child).AsQueryable();
        if(!string.IsNullOrWhiteSpace(status)&&status!="ALL")query=query.Where(r=>r.Status==status.Trim().ToUpper());
        if(!string.IsNullOrWhiteSpace(search))
        {
            var s=search.Trim();
            query=query.Where(r=>r.ApplicationNumber.Contains(s)||(r.User!.FirstName+" "+(r.User.LastName??"")).Contains(s)||(r.Child!.FirstName+" "+(r.Child.LastName??"")).Contains(s));
        }
        return Ok(await query.OrderByDescending(r=>r.RequestDate).Select(r=>new ApplicationResponse(r.RequestId,r.ApplicationNumber,r.UserId,r.User!.FirstName+" "+(r.User.LastName??""),r.ChildId,r.Child!.FirstName+" "+(r.Child.LastName??""),r.RequestDate,r.Status,r.AdminRemark)).ToListAsync());
    }

    [HttpGet("{id:long}")]
    public async Task<ActionResult<ApplicationDetailResponse>> GetById(long id)
    {
        var r=await _db.AdoptionRequests.AsNoTracking().Include(x=>x.User).Include(x=>x.Child).FirstOrDefaultAsync(x=>x.RequestId==id);
        if(r is null||r.User is null||r.Child is null)return NotFound(new{message="Application not found."});

        var application=new ApplicationResponse(r.RequestId,r.ApplicationNumber,r.UserId,$"{r.User.FirstName} {r.User.LastName}".Trim(),r.ChildId,$"{r.Child.FirstName} {r.Child.LastName}".Trim(),r.RequestDate,r.Status,r.AdminRemark);
        var parent=new ParentResponse(r.User.UserId,r.User.FirstName,r.User.LastName,r.User.Email,r.User.Phone,r.User.Gender,r.User.Dob,r.User.AadhaarNumber,r.User.MaritalStatus,r.User.Occupation,r.User.AnnualIncome,r.User.Address,r.User.City,r.User.State,r.User.Pincode,r.User.ProfilePhoto,r.User.Status,r.User.CreatedAt);
        var age=CalculateAge(r.Child.Dob);
        var child=new ChildResponse(r.Child.ChildId,r.Child.FirstName,r.Child.LastName,r.Child.Gender,r.Child.Dob,age,r.Child.BloodGroup,r.Child.HealthStatus,r.Child.MedicalNotes,r.Child.SpecialNeeds,r.Child.Education,r.Child.Hobbies,r.Child.Description,r.Child.ProfilePhoto,r.Child.AdmissionDate,r.Child.Status,r.Child.CreatedAt);
        var documents=await _db.UserDocuments.AsNoTracking().Where(d=>d.UserId==r.UserId&&(d.RequestId==null||d.RequestId==id)).Select(d=>new ParentDocumentResponse(d.DocumentId,d.UserId,d.RequestId,d.DocumentType,d.FileName,d.FilePath,d.VerificationStatus,d.UploadedAt)).ToListAsync();
        var visits=await _db.HomeVisits.AsNoTracking().Where(v=>v.RequestId==id).Include(v=>v.SocialWorker).Select(v=>new HomeVisitResponse(v.HomeVisitId,v.VisitCode,v.RequestId,r.ApplicationNumber,$"{r.User.FirstName} {r.User.LastName}".Trim(),$"{r.Child.FirstName} {r.Child.LastName}".Trim(),v.SocialWorkerId,v.SocialWorker==null?"—":(v.SocialWorker.FirstName+" "+(v.SocialWorker.LastName??"")),v.ScheduledDate,v.ScheduledTime,v.Status,v.Remarks)).ToListAsync();
        return Ok(new ApplicationDetailResponse(application,parent,child,documents,visits));
    }

    [HttpPut("{id:long}/review")]
    public async Task<IActionResult> Review(long id,ReviewApplicationRequest request)
    {
        var status=(request.Status??"").Trim().ToUpperInvariant();
        if(!ReviewStatuses.Contains(status))return BadRequest(new{message="Status must be UNDER_REVIEW, APPROVED or REJECTED."});
        var r=await _db.AdoptionRequests.FindAsync(id);if(r is null)return NotFound(new{message="Application not found."});
        var adminIdClaim=User.FindFirstValue(ClaimTypes.NameIdentifier)??User.FindFirstValue("sub");
        r.Status=status;r.AdminRemark=request.AdminRemark?.Trim();r.StatusUpdatedAt=DateTime.UtcNow;r.ReviewedByAdminId=long.TryParse(adminIdClaim,out var adminId)?adminId:null;
        var child=await _db.Children.FindAsync(r.ChildId);
        if(child is not null)child.Status=status switch{"APPROVED"=>"ADOPTED","REJECTED"=>"AVAILABLE",_=>child.Status};
        await _db.SaveChangesAsync();return NoContent();
    }

    private static int? CalculateAge(DateTime? dob){if(!dob.HasValue)return null;var today=DateTime.Today;var age=today.Year-dob.Value.Year;if(dob.Value.Date>today.AddYears(-age))age--;return Math.Max(0,age);}
}
