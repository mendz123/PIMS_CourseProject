using Microsoft.AspNetCore.Http;

namespace PIMS_BE.DTOs.Template
{
    public class UploadTemplateDto
    {
        public string TemplateName { get; set; } = null!;
        public int SemesterId { get; set; }
        public IFormFile File { get; set; } = null!;
    }
}
