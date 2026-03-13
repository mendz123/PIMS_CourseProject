using PIMS_BE.DTOs.Dashboard;

namespace PIMS_BE.Services.Interfaces
{
    public interface IDashboardService
    {
        Task<TeacherOverviewDto> GetTeacherOverviewAsync(int teacherId);
    }
}
