
namespace PIMS_BE.DTOs.User
{
    public class UpdateProfileRequestDto
    {
        public string? FullName { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Bio { get; set; }
        public IFormFile? Avatar { get; set; }
    }
}