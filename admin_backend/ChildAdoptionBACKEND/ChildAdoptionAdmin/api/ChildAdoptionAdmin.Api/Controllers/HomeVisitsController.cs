using System.Security.Claims;
using ChildAdoptionAdmin.Api.DTOs;
using ChildAdoptionAdmin.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ChildAdoptionAdmin.Api.Controllers;

[ApiController]
[Route("api/admin/home-visits")]
[Route("api/home-visits")]
public class HomeVisitsController : ControllerBase
{
    private readonly IHomeVisitService _service;

    public HomeVisitsController(IHomeVisitService service)
    {
        _service = service;
    }

    // 1. Assign Visit: POST /api/admin/home-visits
    [Authorize(Roles = "ADMIN,SUPER_ADMIN")]
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<HomeVisitResponse>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<HomeVisitResponse>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<HomeVisitResponse>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> AssignVisit([FromBody] AdminAssignHomeVisitRequest request)
    {
        var result = await _service.AssignVisitAsync(request);
        if (!result.Success)
        {
            if (result.Message.Contains("not exist", StringComparison.OrdinalIgnoreCase) ||
                result.Message.Contains("not found", StringComparison.OrdinalIgnoreCase))
                return NotFound(result);
            return BadRequest(result);
        }

        return CreatedAtAction(nameof(GetById), new { id = result.Data!.HomeVisitId }, result);
    }

    // 2. Get Home Visits: GET /api/admin/home-visits
    [Authorize(Roles = "ADMIN,SUPER_ADMIN")]
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<PagedResponse<HomeVisitResponse>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? status,
        [FromQuery] string? search,
        [FromQuery] long? socialWorkerId,
        [FromQuery] DateTime? visitDate,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        var result = await _service.GetVisitsAsync(search, status, socialWorkerId, visitDate, page, pageSize);
        return Ok(result);
    }

    // 3. View Visit Detail: GET /api/admin/home-visits/{id}
    [Authorize(Roles = "ADMIN,SUPER_ADMIN")]
    [HttpGet("{id:long}")]
    [ProducesResponseType(typeof(ApiResponse<HomeVisitDetailResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<HomeVisitDetailResponse>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(long id)
    {
        var result = await _service.GetVisitDetailAsync(id);
        if (!result.Success)
            return NotFound(result);

        return Ok(result);
    }

    // 4. Update Visit: PUT /api/admin/home-visits/{id}
    [Authorize(Roles = "ADMIN,SUPER_ADMIN")]
    [HttpPut("{id:long}")]
    [ProducesResponseType(typeof(ApiResponse<HomeVisitResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<HomeVisitResponse>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<HomeVisitResponse>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateVisit(long id, [FromBody] AdminUpdateHomeVisitRequest request)
    {
        var result = await _service.UpdateVisitAsync(id, request);
        if (!result.Success)
        {
            if (result.Message.Contains("not found", StringComparison.OrdinalIgnoreCase))
                return NotFound(result);
            return BadRequest(result);
        }

        return Ok(result);
    }

    // 5. Cancel Visit: PATCH /api/admin/home-visits/{id}/cancel (and PUT alias)
    [Authorize(Roles = "ADMIN,SUPER_ADMIN")]
    [HttpPatch("{id:long}/cancel")]
    [HttpPut("{id:long}/cancel")]
    [ProducesResponseType(typeof(ApiResponse<HomeVisitResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<HomeVisitResponse>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<HomeVisitResponse>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> CancelVisit(long id)
    {
        var result = await _service.CancelVisitAsync(id);
        if (!result.Success)
        {
            if (result.Message.Contains("not found", StringComparison.OrdinalIgnoreCase))
                return NotFound(result);
            return BadRequest(result);
        }

        return Ok(result);
    }

    // 6. View Report: GET /api/admin/home-visits/{id}/report
    [Authorize(Roles = "ADMIN,SUPER_ADMIN")]
    [HttpGet("{id:long}/report")]
    [ProducesResponseType(typeof(ApiResponse<HomeVisitReportResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<HomeVisitReportResponse>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetReport(long id)
    {
        var result = await _service.GetReportAsync(id);
        if (!result.Success)
            return NotFound(result);

        return Ok(result);
    }

    // 7. Get My Home Visits: GET /api/home-visits/my
    [AllowAnonymous]
    [HttpGet("my")]
    [ProducesResponseType(typeof(ApiResponse<List<SocialWorkerMyHomeVisitResponse>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMyVisits(
        [FromQuery] long? socialWorkerId,
        [FromQuery] string? email)
    {
        long? targetWorkerId = socialWorkerId;
        string? targetEmail = email;

        var subClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
        if (targetWorkerId is null && !string.IsNullOrEmpty(subClaim) && long.TryParse(subClaim, out var parsedId))
        {
            targetWorkerId = parsedId;
        }

        var emailClaim = User.FindFirst(ClaimTypes.Email)?.Value ?? User.FindFirst("email")?.Value;
        if (string.IsNullOrEmpty(targetEmail) && !string.IsNullOrEmpty(emailClaim))
        {
            targetEmail = emailClaim;
        }

        var result = await _service.GetMyVisitsAsync(targetWorkerId, targetEmail);
        return Ok(result);
    }

    // 8. Generate / Update Visit Report: PUT /api/home-visits/{visitId}/report
    [AllowAnonymous]
    [HttpPut("{visitId:long}/report")]
    [ProducesResponseType(typeof(ApiResponse<HomeVisitReportResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<HomeVisitReportResponse>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<HomeVisitReportResponse>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> SubmitVisitReport(long visitId, [FromBody] GenerateVisitReportRequest request)
    {
        var result = await _service.SubmitVisitReportAsync(visitId, request);
        if (!result.Success)
        {
            if (result.Message.Contains("not found", StringComparison.OrdinalIgnoreCase))
                return NotFound(result);
            return BadRequest(result);
        }

        return Ok(result);
    }
}
