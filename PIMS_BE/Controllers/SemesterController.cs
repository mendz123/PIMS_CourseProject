using Microsoft.AspNetCore.Mvc;
using PIMS_BE.Services.Interfaces;
using PIMS_BE.DTOs;
using PIMS_BE.DTOs.Semester;

namespace PIMS_BE.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SemesterController : BaseApiController
    {
        private readonly ISemesterService _semesterService;

        public SemesterController(ISemesterService semesterService)
        {
            _semesterService = semesterService;
        }

        [HttpGet("semester")]
        public async Task<ActionResult<ApiResponse<IEnumerable<SemesterDto>>>> GetSemesters()
        {
            try
            {
                var semesters = await _semesterService.GetAllSemestersAsync();
                return OkResponse(semesters, "Semesters retrieved successfully");
            }
            catch (Exception ex)
            {
                return InternalErrorResponse<IEnumerable<SemesterDto>>("Error: " + ex.Message);
            }
        }
    }
}
