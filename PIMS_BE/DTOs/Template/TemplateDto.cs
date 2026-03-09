namespace PIMS_BE.DTOs.Template
{
    public class TemplateDto
    {
        public int TemplateId { get; set; }
        public string TemplateName { get; set; } = null!;
        public string TemplateUrl { get; set; } = null!;
        public string? FileResourceId { get; set; }
        public DateTime? CreatedAt { get; set; }
    }
}
