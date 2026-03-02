using System.ComponentModel.DataAnnotations;

namespace PIMS_BE.DTOs.Group
{
    public class CreateGroupRequestDto
    {
        [Required(ErrorMessage = "Tên nhóm không ???c ?? tr?ng")]
        [StringLength(255, MinimumLength = 1, ErrorMessage = "Tên nhóm không h?p l?")]
        public string GroupName { get; set; } = string.Empty;
    }
}
