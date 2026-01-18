using Microsoft.EntityFrameworkCore;
using PIMS_BE.DTOs.Class;
using PIMS_BE.Models;
using PIMS_BE.Repositories;
using PIMS_BE.Services.Interfaces;

namespace PIMS_BE.Services
{
    public class ClassService : IClassService
    {
        private readonly IClassRepository _classRepository;
        private readonly IUserRepository _userRepository;
        private readonly PimsProjectContext _context;

        public ClassService(IClassRepository classRepository, IUserRepository userRepository, PimsProjectContext context)
        {
            _classRepository = classRepository;
            _userRepository = userRepository;
            _context = context;
        }

        public async Task<bool> AssignTeacherToClassAsync(int classId, int teacherId)
        {
            
            var classEntity = await _classRepository.GetByIdAsync(classId);
            if (classEntity == null)
            {
                throw new KeyNotFoundException("Class not found");
            }

            
            var teacher = await _userRepository.GetByIdAsync(teacherId);
            if (teacher == null)
            {
                 throw new KeyNotFoundException("Teacher not found");
            }

       
            if (teacher.RoleId != 2) // 2 = TEACHER
            {
                 throw new InvalidOperationException("User is not a Teacher");
            }

            
            classEntity.TeacherId = teacherId;
            _classRepository.Update(classEntity);

            
            return await _classRepository.SaveChangesAsync();
        }

        public async Task<List<ClassDto>> GetClassesAsync()
        {
            return await _context.Classes
                .Include(c => c.Semester)
                .Include(c => c.Teacher)
                .Select(c => new ClassDto
                {
                    ClassId = c.ClassId,
                    ClassCode = c.ClassCode,
                    Semester = c.Semester != null ? c.Semester.SemesterName : null, 
                    Subject = "SWP391", 
                    TeacherName = c.Teacher != null ? c.Teacher.FullName : "Not Assigned",
                    TeacherId = c.TeacherId
                })
                .ToListAsync();
        }
    }
}
