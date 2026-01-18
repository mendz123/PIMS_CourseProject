using PIMS_BE.DTOs.Class;

namespace PIMS_BE.Services.Interfaces;

public interface IClassService
{
    Task<bool> AssignTeacherToClassAsync(int classId, int teacherId);
    Task<List<ClassDto>> GetClassesAsync();
}
