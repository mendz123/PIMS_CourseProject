using Microsoft.AspNetCore.Mvc;
using PIMS_BE.DTOs;

namespace PIMS_BE.Controllers
{
    /// <summary>
    /// EXAMPLE CONTROLLER - Xem cách sử dụng BaseApiController
    /// Copy template này khi tạo controller mới
    /// </summary>
    public class ExampleController : BaseApiController  // <-- Kế thừa từ BaseApiController
    {
        // GET api/example
        [HttpGet]
        public ActionResult<ApiResponse<List<string>>> GetAll()
        {
            var data = new List<string> { "item1", "item2" };
            
            // ✅ ĐÚNG - Dùng helper method
            return OkResponse(data);
        }

        // GET api/example/{id}
        [HttpGet("{id}")]
        public ActionResult<ApiResponse<string>> GetById(int id)
        {
            // Simulate not found
            if (id == 0)
            {
                // ✅ ĐÚNG - Dùng helper method
                return NotFoundResponse<string>("Item not found");
            }

            return OkResponse($"Item {id}");
        }

        // POST api/example
        [HttpPost]
        public ActionResult<ApiResponse<string>> Create([FromBody] string item)
        {
            if (string.IsNullOrEmpty(item))
            {
                // ✅ ĐÚNG - Dùng helper method với validation errors
                return BadRequestResponse<string>("Invalid input", new List<string> { "Item cannot be empty" });
            }

            // ✅ ĐÚNG - Dùng CreatedResponse cho POST
            return CreatedResponse(item, "Item created successfully");
        }

        // GET api/example/paged
        [HttpGet("paged")]
        public ActionResult<ApiResponse<PaginatedResponse<string>>> GetPaged(int page = 1, int pageSize = 10)
        {
            var allItems = new List<string> { "a", "b", "c", "d", "e" };
            var pagedItems = allItems.Skip((page - 1) * pageSize).Take(pageSize).ToList();

            // ✅ ĐÚNG - Dùng OkPaginated cho list có phân trang
            return OkPaginated(pagedItems, allItems.Count, page, pageSize);
        }
    }
}
