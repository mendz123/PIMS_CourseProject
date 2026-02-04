using Microsoft.EntityFrameworkCore;
using PIMS_BE.DTOs.Template;
using PIMS_BE.Models;
using PIMS_BE.Repositories;
using PIMS_BE.Services.Interfaces;

namespace PIMS_BE.Services
{
    public class TemplateService : ITemplateService
    {
        private readonly IGenericRepository<ProjectTemplate> _templateRepo;
        private readonly ISemesterRepository _semesterRepo;
        private readonly IDriveFileService _driveFileService;
        private readonly string _templateFolderId;

        public TemplateService(
            IGenericRepository<ProjectTemplate> templateRepo,
            ISemesterRepository semesterRepo,
            IDriveFileService driveFileService,
            IConfiguration configuration)
        {
            _templateRepo = templateRepo;
            _semesterRepo = semesterRepo;
            _driveFileService = driveFileService;
            // Using the key with typo as found in appsettings.Development.json
            _templateFolderId = configuration["GoogleDrive:TemplateFolderId"] ?? throw new Exception("Template Folder ID is not configured.");
        }

        public async Task<ProjectTemplate> UploadTemplateAsync(UploadTemplateDto dto, int userId)
        {
            var allowedExtensions = new[] { ".zip", ".rar", ".7z" };
            var extension = Path.GetExtension(dto.File.FileName).ToLowerInvariant();

            if (!allowedExtensions.Contains(extension))
            {
                throw new Exception("Chỉ chấp nhận các loại file nén: .zip, .rar, .7z");
            }

            string fileId = await _driveFileService.UploadFileAsync(dto.File, _templateFolderId);

            var template = new ProjectTemplate
            {
                TemplateName = dto.TemplateName,
                SemesterId = dto.SemesterId,
                CreatedBy = userId,
                FileResourceId = fileId,
                TemplateUrl = $"https://drive.google.com/file/d/{fileId}/view",
                CreatedAt = DateTime.Now
            };

            await _templateRepo.AddAsync(template);
            await _templateRepo.SaveChangesAsync();

            return template;
        }

        public async Task<List<TemplateDto>> GetTemplatesBySemesterAsync(int semesterId)
        {
            var templates = await _templateRepo.FindAsync(t => t.SemesterId == semesterId);
            
            return templates.Select(t => new TemplateDto
            {
                TemplateId = t.TemplateId,
                TemplateName = t.TemplateName,
                TemplateUrl = t.TemplateUrl,
                FileResourceId = t.FileResourceId,
                CreatedAt = t.CreatedAt
            }).ToList();
        }

        public async Task<List<TemplateDto>> GetActiveTemplatesAsync()
        {
            var activeSemester = await _semesterRepo.FindAsync(s => s.IsActive == true);
            var semester = activeSemester.FirstOrDefault();
            
            if (semester == null) return new List<TemplateDto>();

            return await GetTemplatesBySemesterAsync(semester.SemesterId);
        }

        public async Task<bool> DeleteTemplateAsync(int templateId, int userId)
        {
            var template = await _templateRepo.GetByIdAsync(templateId);
            if (template == null) return false;

            if (!string.IsNullOrEmpty(template.FileResourceId))
            {
                try
                {
                    await _driveFileService.DeleteFileAsync(template.FileResourceId);
                }
                catch (Exception)
                {
                    // Log error but continue deleting from DB
                }
            }

            _templateRepo.Remove(template);
            return await _templateRepo.SaveChangesAsync();
        }
    }
}
