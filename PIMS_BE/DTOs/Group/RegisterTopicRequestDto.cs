using System.ComponentModel.DataAnnotations;

namespace PIMS_BE.DTOs.Group
{
    public class RegisterTopicRequestDto
    {
        [Required(ErrorMessage = "Topic name is required.")]
        public string TopicName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Description is required.")]
        public string Description { get; set; } = string.Empty;
    }
}

