using System.ComponentModel.DataAnnotations;

namespace PIMS_BE.DTOs.Project
{
    public class ProjectDto
    {
        public int ProjectId { get; set; }
        public int GroupId { get; set; }
        public string? Title { get; set; }
        public string? Description { get; set; }
        public int StatusId { get; set; }
        public string? StatusName { get; set; }
        public DateTime? CreatedAt { get; set; } 
    }

    
    public class SubmitProjectDto
    {
        public int GroupId { get; set; } 

        [Required] 
        public string Title { get; set; } = string.Empty;

        public string? Description { get; set; }

     
    }
}