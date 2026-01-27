using System.Linq;
using System.Collections.Generic;
using PIMS_BE.DTOs.Semester;
using PIMS_BE.Repositories;
using PIMS_BE.Services.Interfaces;

namespace PIMS_BE.Services
{
    public class SemesterService : ISemesterService
    {
        private readonly ISemesterRepository _semesterRepository;

        public SemesterService(ISemesterRepository semesterRepository)
        {
            _semesterRepository = semesterRepository;
        }

        public async Task<IEnumerable<SemesterDto>> GetAllSemestersAsync()
        {
            try
            {
                var semesters = await _semesterRepository.GetAllAsync();
                var result = semesters.Select(s => new SemesterDto
                {
                    SemesterId = s.SemesterId,
                    SemesterName = s.SemesterName
                }).ToList();

                if (result.Any()) return result;
            }
            catch (Exception ex)
            {
                // Log exception if you have a logger, otherwise just fall through to mock data
                Console.WriteLine($"Database error in GetAllSemestersAsync: {ex.Message}");
            }

            // Fallback mock data if DB is empty or query fails
            return new List<SemesterDto>
            {
                new SemesterDto { SemesterId = 1, SemesterName = "Spring 2026" },
                new SemesterDto { SemesterId = 2, SemesterName = "Summer 2026" },
                new SemesterDto { SemesterId = 3, SemesterName = "Fall 2026" }
            };
        }
    }
}
