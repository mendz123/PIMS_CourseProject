using Microsoft.AspNetCore.Mvc;

namespace PIMS_BE.Controllers
{
    /// <summary>
    /// Health check controller - Kiểm tra API đang chạy
    /// </summary>
    [ApiController]
    [Route("")]
    public class HealthController : ControllerBase
    {
        /// <summary>
        /// GET / - Trang chủ API
        /// </summary>
        [HttpGet]
        public IActionResult Index()
        {
            return Ok(new
            {
                message = "🚀 PIMS API is running!",
                swagger = "/swagger",
                timestamp = DateTime.UtcNow
            });
        }

        /// <summary>
        /// GET /health - Health check endpoint
        /// </summary>
        [HttpGet("health")]
        public IActionResult Health()
        {
            return Ok(new { status = "healthy", timestamp = DateTime.UtcNow });
        }

        /// <summary>
        /// GET /hello - Simple hello endpoint
        /// </summary>
        [HttpGet("hello")]
        public IActionResult Hello()
        {
            return Ok("Hello! PIMS Backend is running 🎉");
        }
    }
}
