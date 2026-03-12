namespace PIMS_BE.DTOs.User
{
    public class UserSuggestionDto
    {
        public string Email { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string? AvatarUrl { get; set; }
    }
}
