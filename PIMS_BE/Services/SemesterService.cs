using PIMS_BE.DTOs.Semester;
using PIMS_BE.Models;
using PIMS_BE.Repositories;
using PIMS_BE.Services.Interfaces;

namespace PIMS_BE.Services;

public class SemesterService : ISemesterService
{
    private readonly ISemesterRepository _semesterRepository;

    public SemesterService(ISemesterRepository semesterRepository)
    {
        _semesterRepository = semesterRepository;
    }

    public async Task<IEnumerable<SemesterDto>> GetAllSemestersAsync()
    {
        var semesters = await _semesterRepository.GetAllAsync();
        return semesters
            .OrderByDescending(s => s.IsActive)
            .ThenByDescending(s => s.StartDate)
            .Select(MapToDto);
    }

    public async Task<SemesterDto?> GetByIdAsync(int id)
    {
        var s = await _semesterRepository.GetByIdAsync(id);
        return s == null ? null : MapToDto(s);
    }

    public async Task<SemesterDto?> GetActiveSemesterAsync()
    {
        var semesters = await _semesterRepository.GetAllAsync();
        var active = semesters.FirstOrDefault(s => s.IsActive == true);
        return active == null ? null : MapToDto(active);
    }

    public async Task<SemesterDto> CreateSemesterAsync(CreateSemesterDto dto)
    {
        if (dto.EndDate <= dto.StartDate)
            throw new ArgumentException("EndDate must be after StartDate");

        if (dto.MinGroupSize > dto.MaxGroupSize)
            throw new ArgumentException("MinGroupSize must not be greater than MaxGroupSize");

        // Nếu IsActive = true → deactivate tất cả semester hiện có
        if (dto.IsActive)
        {
            var all = await _semesterRepository.GetAllAsync();
            foreach (var s in all.Where(s => s.IsActive == true))
            {
                s.IsActive = false;
                _semesterRepository.Update(s);
            }
        }

        var semester = new Semester
        {
            SemesterName = dto.SemesterName,
            StartDate    = dto.StartDate,
            EndDate      = dto.EndDate,
            MinGroupSize = dto.MinGroupSize,
            MaxGroupSize = dto.MaxGroupSize,
            IsActive     = dto.IsActive
        };

        await _semesterRepository.AddAsync(semester);
        await _semesterRepository.SaveChangesAsync();
        return MapToDto(semester);
    }

    public async Task<SemesterDto> UpdateSemesterAsync(int id, UpdateSemesterDto dto)
    {
        var semester = await _semesterRepository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Semester {id} not found");

        var newStart = dto.StartDate ?? semester.StartDate;
        var newEnd   = dto.EndDate   ?? semester.EndDate;
        if (newEnd <= newStart)
            throw new ArgumentException("EndDate must be after StartDate");

        var newMin = dto.MinGroupSize ?? semester.MinGroupSize;
        var newMax = dto.MaxGroupSize ?? semester.MaxGroupSize;
        if (newMin > newMax)
            throw new ArgumentException("MinGroupSize must not be greater than MaxGroupSize");

        // Nếu set IsActive = true → deactivate các semester khác
        if (dto.IsActive == true && semester.IsActive != true)
        {
            var all = await _semesterRepository.GetAllAsync();
            foreach (var s in all.Where(s => s.IsActive == true && s.SemesterId != id))
            {
                s.IsActive = false;
                _semesterRepository.Update(s);
            }
        }

        if (dto.SemesterName != null) semester.SemesterName = dto.SemesterName;
        if (dto.StartDate    != null) semester.StartDate    = dto.StartDate;
        if (dto.EndDate      != null) semester.EndDate      = dto.EndDate;
        if (dto.MinGroupSize != null) semester.MinGroupSize = dto.MinGroupSize;
        if (dto.MaxGroupSize != null) semester.MaxGroupSize = dto.MaxGroupSize;
        if (dto.IsActive     != null) semester.IsActive     = dto.IsActive;

        _semesterRepository.Update(semester);
        await _semesterRepository.SaveChangesAsync();
        return MapToDto(semester);
    }

    private static SemesterDto MapToDto(Semester s) => new()
    {
        SemesterId   = s.SemesterId,
        SemesterName = s.SemesterName,
        StartDate    = s.StartDate,
        EndDate      = s.EndDate,
        MinGroupSize = s.MinGroupSize,
        MaxGroupSize = s.MaxGroupSize,
        IsActive     = s.IsActive
    };
}
