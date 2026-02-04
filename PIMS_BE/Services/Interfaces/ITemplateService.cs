using PIMS_BE.DTOs.Template;
using PIMS_BE.Models;

namespace PIMS_BE.Services.Interfaces
{
    public interface ITemplateService
    {
        Task<ProjectTemplate> UploadTemplateAsync(UploadTemplateDto dto, int userId);
        Task<List<TemplateDto>> GetTemplatesBySemesterAsync(int semesterId);
        Task<List<TemplateDto>> GetActiveTemplatesAsync();
        Task<bool> DeleteTemplateAsync(int templateId, int userId);
    }
}
