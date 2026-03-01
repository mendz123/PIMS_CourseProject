using System.ComponentModel.DataAnnotations;

namespace PIMS_BE.DTOs.Group
{
    public class InviteMentorRequestDto
    {
        [Required]
        public int MentorUserId { get; set; }
        public string? Message { get; set; }
    }
}
