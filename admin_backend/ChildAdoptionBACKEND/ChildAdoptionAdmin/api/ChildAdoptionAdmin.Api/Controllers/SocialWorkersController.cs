using System.Security.Claims;
using ChildAdoptionAdmin.Api.DTOs;
using ChildAdoptionAdmin.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ChildAdoptionAdmin.Api.Controllers;

[ApiController]
[Route("api/admin/social-workers")]
[Route("api/social-workers")]
[Authorize(Roles = "ADMIN,SUPER_ADMIN")]
public class SocialWorkersController : ControllerBase
{
    private readonly ISocialWorkerService _service;

    public SocialWorkersController(ISocialWorkerService service)
    {
        _service = service;
    }

    // 1. Add Social Worker: POST /api/admin/social-workers
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<SocialWorkerResponse>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<SocialWorkerResponse>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<SocialWorkerResponse>), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Create([FromBody] CreateSocialWorkerRequest request)
    {
        var adminIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        long? adminId = adminIdClaim != null ? long.Parse(adminIdClaim) : null;

        var result = await _service.CreateAsync(request, adminId);
        if (!result.Success)
        {
            if (result.Message.Contains("Duplicate", StringComparison.OrdinalIgnoreCase))
                return Conflict(result);
            return BadRequest(result);
        }

        return CreatedAtAction(nameof(GetById), new { id = result.Data!.SocialWorkerId }, result);
    }

    // 2. Get All Social Workers: GET /api/admin/social-workers
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<PagedResponse<SocialWorkerResponse>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? search,
        [FromQuery] string? status,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        var result = await _service.GetAllAsync(search, status, page, pageSize);
        return Ok(result);
    }

    // 3. Get Social Worker By Id: GET /api/admin/social-workers/{id}
    [HttpGet("{id:long}")]
    [ProducesResponseType(typeof(ApiResponse<SocialWorkerDetailResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<SocialWorkerDetailResponse>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(long id)
    {
        var result = await _service.GetByIdAsync(id);
        if (!result.Success)
            return NotFound(result);

        return Ok(result);
    }

    // 4. Update Social Worker: PUT /api/admin/social-workers/{id}
    [HttpPut("{id:long}")]
    [ProducesResponseType(typeof(ApiResponse<SocialWorkerResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<SocialWorkerResponse>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<SocialWorkerResponse>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(long id, [FromBody] UpdateSocialWorkerRequest request)
    {
        var result = await _service.UpdateAsync(id, request);
        if (!result.Success)
        {
            if (result.Message.Contains("not found", StringComparison.OrdinalIgnoreCase))
                return NotFound(result);
            return BadRequest(result);
        }

        return Ok(result);
    }

    // 5. Activate Social Worker: PATCH /api/admin/social-workers/{id}/activate
    [HttpPatch("{id:long}/activate")]
    [ProducesResponseType(typeof(ApiResponse<SocialWorkerResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<SocialWorkerResponse>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Activate(long id)
    {
        var result = await _service.ActivateAsync(id);
        if (!result.Success)
            return NotFound(result);

        return Ok(result);
    }

    // 6. Deactivate Social Worker: PATCH /api/admin/social-workers/{id}/deactivate
    [HttpPatch("{id:long}/deactivate")]
    [ProducesResponseType(typeof(ApiResponse<SocialWorkerResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<SocialWorkerResponse>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Deactivate(long id)
    {
        var result = await _service.DeactivateAsync(id);
        if (!result.Success)
            return NotFound(result);

        return Ok(result);
    }

    // 7. Delete Social Worker: DELETE /api/admin/social-workers/{id}
    [HttpDelete("{id:long}")]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(long id)
    {
        var result = await _service.DeleteAsync(id);
        if (!result.Success)
        {
            if (result.Message.Contains("not found", StringComparison.OrdinalIgnoreCase))
                return NotFound(result);
            return BadRequest(result);
        }

        return Ok(result);
    }
}
