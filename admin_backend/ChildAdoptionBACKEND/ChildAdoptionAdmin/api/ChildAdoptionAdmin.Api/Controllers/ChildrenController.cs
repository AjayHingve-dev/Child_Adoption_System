using ChildAdoptionAdmin.Api.Data;
using ChildAdoptionAdmin.Api.DTOs;
using ChildAdoptionAdmin.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ChildAdoptionAdmin.Api.Controllers;

[ApiController, Route("api/children"), Authorize(Roles="ADMIN,SUPER_ADMIN")]
public class ChildrenController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IWebHostEnvironment _env;
    private static readonly string[] Statuses={"AVAILABLE","RESERVED","ADOPTED"};
    public ChildrenController(AppDbContext db,IWebHostEnvironment env){_db=db;_env=env;}
    private static int? Age(DateTime? dob){if(!dob.HasValue)return null;var t=DateTime.Today;var a=t.Year-dob.Value.Year;if(dob.Value.Date>t.AddYears(-a))a--;return Math.Max(0,a);}
    private static ChildResponse Map(Child c)=>new(c.ChildId,c.FirstName,c.LastName,c.Gender,c.Dob,Age(c.Dob),c.BloodGroup,c.HealthStatus,c.MedicalNotes,c.SpecialNeeds,c.Education,c.Hobbies,c.Description,c.ProfilePhoto,c.AdmissionDate,c.Status,c.CreatedAt);

    [HttpGet]
    public async Task<ActionResult<List<ChildResponse>>> GetAll(string? search,string? gender,string? status,int? minAge,int? maxAge)
    {
        var q=_db.Children.AsNoTracking().AsQueryable();
        if(!string.IsNullOrWhiteSpace(search)){var s=search.Trim();q=q.Where(c=>(c.FirstName+" "+(c.LastName??"")).Contains(s));}
        if(!string.IsNullOrWhiteSpace(gender))q=q.Where(c=>c.Gender==gender.ToUpper());
        if(!string.IsNullOrWhiteSpace(status))q=q.Where(c=>c.Status==status.ToUpper());
        var list=await q.OrderByDescending(c=>c.CreatedAt).ToListAsync();
        return Ok(list.Select(Map).Where(c=>(!minAge.HasValue||c.Age>=minAge)&&(!maxAge.HasValue||c.Age<=maxAge)).ToList());
    }

    [HttpGet("{id:long}")]
    public async Task<ActionResult<ChildDetailResponse>> GetById(long id)
    {
        var child=await _db.Children.AsNoTracking().FirstOrDefaultAsync(x=>x.ChildId==id);
        if(child is null)return NotFound(new{message="Child not found."});

        List<ChildMedicalHistoryResponse> medical;
        try
        {
            medical = await _db.ChildMedicalHistories.AsNoTracking()
                .Where(x => x.ChildId == id)
                .Select(x => new ChildMedicalHistoryResponse(x.MedicalId, x.Disease, x.Allergy, x.Treatment, x.DoctorName))
                .ToListAsync();
        }
        catch
        {
            medical = new List<ChildMedicalHistoryResponse>();
        }

        List<VaccinationResponse> vaccinations;
        try
        {
            vaccinations = await _db.Vaccinations.AsNoTracking()
                .Where(x => x.ChildId == id)
                .Select(x => new VaccinationResponse(x.VaccinationId, x.VaccineName, x.VaccineDate))
                .ToListAsync();
        }
        catch
        {
            vaccinations = new List<VaccinationResponse>();
        }

        var requestCount = await _db.AdoptionRequests.CountAsync(x => x.ChildId == id);

        return Ok(new ChildDetailResponse(Map(child), medical, vaccinations, requestCount));
    }

    [HttpPost]
    public async Task<ActionResult<ChildResponse>> Create(CreateChildRequest r)
    {
        if(string.IsNullOrWhiteSpace(r.FirstName))return BadRequest(new{message="Child name is required."});
        if(r.Dob.HasValue && r.Dob.Value.Date > DateTime.Today)return BadRequest(new{message="Date of birth cannot be in the future."});
        if(r.AdmissionDate.HasValue && r.AdmissionDate.Value.Date > DateTime.Today)return BadRequest(new{message="Admission date cannot be in the future."});
        if(r.Dob.HasValue && r.AdmissionDate.HasValue && r.AdmissionDate.Value.Date < r.Dob.Value.Date)return BadRequest(new{message="Admission date cannot be before date of birth."});
        var status=(r.Status??"AVAILABLE").Trim().ToUpperInvariant();if(!Statuses.Contains(status))return BadRequest(new{message="Status must be AVAILABLE, RESERVED or ADOPTED."});
        var gender=string.IsNullOrWhiteSpace(r.Gender)?null:r.Gender.Trim().ToUpperInvariant();
        if(gender is not null && !new[]{"MALE","FEMALE","OTHER"}.Contains(gender))return BadRequest(new{message="Gender must be MALE, FEMALE or OTHER."});
        var c=new Child{FirstName=r.FirstName.Trim(),LastName=string.IsNullOrWhiteSpace(r.LastName)?null:r.LastName.Trim(),Gender=gender,Dob=r.Dob?.Date,BloodGroup=string.IsNullOrWhiteSpace(r.BloodGroup)?null:r.BloodGroup.Trim().ToUpperInvariant(),MedicalNotes=r.MedicalNotes?.Trim(),HealthStatus=r.HealthStatus?.Trim(),SpecialNeeds=r.SpecialNeeds??false,Education=r.Education?.Trim(),Hobbies=r.Hobbies?.Trim(),Description=r.Description?.Trim(),ProfilePhoto=r.ProfilePhoto,AdmissionDate=(r.AdmissionDate??DateTime.Today).Date,Status=status,CreatedAt=DateTime.UtcNow};
        _db.Children.Add(c);await _db.SaveChangesAsync();return CreatedAtAction(nameof(GetById),new{id=c.ChildId},Map(c));
    }

    [HttpPut("{id:long}")]
    public async Task<ActionResult<ChildResponse>> Update(long id, UpdateChildRequest r)
    {
        var c = await _db.Children.FindAsync(id);
        if (c is null) return NotFound(new { message = "Child not found." });

        if (!string.IsNullOrWhiteSpace(r.FirstName)) c.FirstName = r.FirstName.Trim();
        if (r.LastName != null) c.LastName = string.IsNullOrWhiteSpace(r.LastName) ? null : r.LastName.Trim();
        if (!string.IsNullOrWhiteSpace(r.Gender)) c.Gender = r.Gender.Trim().ToUpperInvariant();
        if (r.Dob.HasValue) c.Dob = r.Dob.Value.Date;
        if (!string.IsNullOrWhiteSpace(r.BloodGroup)) c.BloodGroup = r.BloodGroup.Trim().ToUpperInvariant();

        c.HealthStatus = r.HealthStatus?.Trim();
        c.Education = r.Education?.Trim();
        c.MedicalNotes = r.MedicalNotes?.Trim();
        c.Hobbies = r.Hobbies?.Trim();
        c.SpecialNeeds = r.SpecialNeeds ?? c.SpecialNeeds;
        c.Description = r.Description?.Trim();
        if (!string.IsNullOrWhiteSpace(r.ProfilePhoto)) c.ProfilePhoto = r.ProfilePhoto;

        var status = (r.Status ?? c.Status).Trim().ToUpperInvariant();
        if (!Statuses.Contains(status)) return BadRequest(new { message = "Invalid child status." });
        c.Status = status;

        await _db.SaveChangesAsync();
        return Ok(Map(c));
    }

    [HttpPost("{id:long}/photo")]
    public async Task<ActionResult> UploadPhoto(long id,IFormFile file)
    {
        var c=await _db.Children.FindAsync(id);if(c is null)return NotFound(new{message="Child not found."});
        if(file is null||file.Length==0||file.Length>5_000_000)return BadRequest(new{message="Photo must be between 1 byte and 5 MB."});
        var ext=Path.GetExtension(file.FileName).ToLowerInvariant();if(!new[]{".jpg",".jpeg",".png",".webp"}.Contains(ext))return BadRequest(new{message="Only JPG, PNG and WEBP photos are allowed."});
        var dir=Path.Combine(_env.WebRootPath??Path.Combine(_env.ContentRootPath,"wwwroot"),"uploads","children");Directory.CreateDirectory(dir);
        var name=$"child-{id}-{Guid.NewGuid():N}{ext}";await using(var fs=System.IO.File.Create(Path.Combine(dir,name)))await file.CopyToAsync(fs);
        c.ProfilePhoto=$"/uploads/children/{name}";await _db.SaveChangesAsync();return Ok(new{profilePhoto=c.ProfilePhoto});
    }

    [HttpDelete("{id:long}")]
    public async Task<IActionResult> Delete(long id)
    {
        var c=await _db.Children.FindAsync(id);if(c is null)return NotFound(new{message="Child not found."});
        if(c.Status=="ADOPTED")return Conflict(new{message="An adopted child cannot be deleted."});
        if(await _db.AdoptionRequests.AnyAsync(a=>a.ChildId==id))return Conflict(new{message="This child has an adoption request and cannot be deleted."});
        _db.Children.Remove(c);await _db.SaveChangesAsync();return NoContent();
    }
}
