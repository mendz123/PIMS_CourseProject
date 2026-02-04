using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PIMS_BE.DTOs.Template;
using PIMS_BE.Services.Interfaces;
using System.Security.Claims;

namespace PIMS_BE.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ProjectTemplateController : ControllerBase
    {
        private readonly ITemplateService _templateService;

        public ProjectTemplateController(ITemplateService templateService)
        {
            _templateService = templateService;
        }

        [HttpPost("upload")]
        [Authorize(Roles = "SUBJECT_HEAD")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UploadTemplate([FromForm] UploadTemplateDto dto)
        {
            try
            {
                int userId = GetUserIdFromToken();
                var result = await _templateService.UploadTemplateAsync(dto, userId);
                return Ok(new { Success = true, Message = "Tải lên tài liệu mẫu thành công!", Data = result });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Success = false, Message = ex.Message });
            }
        }

        [HttpGet("semester/{semesterId}")]
        public async Task<IActionResult> GetTemplates(int semesterId)
        {
            try
            {
                var result = await _templateService.GetTemplatesBySemesterAsync(semesterId);
                return Ok(new { Success = true, Data = result });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Success = false, Message = ex.Message });
            }
        }

        [HttpGet("active")]
        [Authorize(Roles = "STUDENT,SUBJECT_HEAD")]
        public async Task<IActionResult> GetActiveTemplates()
        {
            try
            {
                var result = await _templateService.GetActiveTemplatesAsync();
                return Ok(new { Success = true, Data = result });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Success = false, Message = ex.Message });
            }
        }

        [HttpDelete("{templateId}")]
        [Authorize(Roles = "SUBJECT_HEAD")]
        public async Task<IActionResult> DeleteTemplate(int templateId)
        {
            try
            {
                int userId = GetUserIdFromToken();
                var result = await _templateService.DeleteTemplateAsync(templateId, userId);
                if (!result) return NotFound(new { Success = false, Message = "Không tìm thấy tài liệu mẫu." });
                return Ok(new { Success = true, Message = "Xóa tài liệu mẫu thành công!" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Success = false, Message = ex.Message });
            }
        }

        private int GetUserIdFromToken()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
                throw new Exception("Không tìm thấy UserId trong Token.");
            return int.Parse(userIdClaim);
        }
    }
}
