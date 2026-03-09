using System.ComponentModel.DataAnnotations;

namespace PIMS_BE.DTOs.Group
{
    public class InviteMentorRequestDto
    {
        [Required]
        public string MentorEmail { get; set; } = string.Empty;
        public string? Message { get; set; }
    }
}
