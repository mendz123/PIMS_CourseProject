using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PIMS_BE.DTOs;
using PIMS_BE.DTOs.Room;
using PIMS_BE.Services.Interfaces;

namespace PIMS_BE.Controllers;

/// <summary>UC25: View rooms | UC26: Create room | UC27: Delete room</summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class RoomController : ControllerBase
{
    private readonly IRoomService _roomService;

    public RoomController(IRoomService roomService)
    {
        _roomService = roomService;
    }

    // UC25 — Xem danh sách phòng
    [HttpGet]
    public async Task<ActionResult<ApiResponse<IEnumerable<RoomDto>>>> GetAll()
    {
        try
        {
            var result = await _roomService.GetAllAsync();
            return Ok(ApiResponse<IEnumerable<RoomDto>>.Ok(result, "Rooms retrieved successfully"));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<IEnumerable<RoomDto>>.InternalError(ex.Message));
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<RoomDto>>> GetById(int id)
    {
        try
        {
            var result = await _roomService.GetByIdAsync(id);
            if (result == null)
                return NotFound(ApiResponse<RoomDto>.NotFound($"Room {id} not found"));
            return Ok(ApiResponse<RoomDto>.Ok(result, "Room retrieved successfully"));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<RoomDto>.InternalError(ex.Message));
        }
    }

    // UC26 — Tạo phòng mới
    [HttpPost]
    [Authorize(Roles = "ADMIN")]
    public async Task<ActionResult<ApiResponse<RoomDto>>> Create([FromBody] CreateRoomDto dto)
    {
        try
        {
            var result = await _roomService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = result.RoomId },
                ApiResponse<RoomDto>.Ok(result, "Room created successfully"));
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(ApiResponse<RoomDto>.Conflict(ex.Message));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<RoomDto>.InternalError(ex.Message));
        }
    }

    // UC — Cập nhật phòng
    [HttpPut("{id}")]
    [Authorize(Roles = "ADMIN")]
    public async Task<ActionResult<ApiResponse<RoomDto>>> Update(int id, [FromBody] UpdateRoomDto dto)
    {
        try
        {
            var result = await _roomService.UpdateAsync(id, dto);
            return Ok(ApiResponse<RoomDto>.Ok(result, "Room updated successfully"));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse<RoomDto>.NotFound(ex.Message));
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(ApiResponse<RoomDto>.Conflict(ex.Message));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<RoomDto>.InternalError(ex.Message));
        }
    }

    // UC27 — Xóa phòng
    [HttpDelete("{id}")]
    [Authorize(Roles = "ADMIN")]
    public async Task<ActionResult<ApiResponse<string>>> Delete(int id)
    {
        try
        {
            await _roomService.DeleteAsync(id);
            return Ok(ApiResponse<string>.Ok("Room deleted successfully"));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse<string>.NotFound(ex.Message));
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(ApiResponse<string>.Conflict(ex.Message));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<string>.InternalError(ex.Message));
        }
    }
}
