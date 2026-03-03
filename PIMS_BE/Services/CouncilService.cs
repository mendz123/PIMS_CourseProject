using PIMS_BE.DTOs.Council;
using PIMS_BE.Models;
using PIMS_BE.Repositories;
using PIMS_BE.Services.Interfaces;

namespace PIMS_BE.Services;

public class CouncilService : ICouncilService
{
    private readonly ICouncilRepository  _councilRepo;
    private readonly ISemesterRepository _semesterRepo;
    private readonly IUserRepository     _userRepo;

    public CouncilService(
        ICouncilRepository  councilRepo,
        ISemesterRepository semesterRepo,
        IUserRepository     userRepo)
    {
        _councilRepo  = councilRepo;
        _semesterRepo = semesterRepo;
        _userRepo     = userRepo;
    }

    public async Task<IEnumerable<CouncilDto>> GetAllAsync(int? semesterId)
    {
        IEnumerable<Council> councils = semesterId.HasValue
            ? await _councilRepo.GetBySemesterAsync(semesterId.Value)
            : await _councilRepo.GetAllWithMembersAsync();   // ← was GetAllAsync (no Include)

        return councils.Select(MapToDto);
    }

    public async Task<CouncilDto?> GetByIdAsync(int id)
    {
        var council = await _councilRepo.GetWithMembersAsync(id);
        return council == null ? null : MapToDto(council);
    }

    public async Task<CouncilDto> CreateAsync(CreateCouncilDto dto)
    {
        // Validate Semester tồn tại
        var semester = await _semesterRepo.GetByIdAsync(dto.SemesterId)
            ?? throw new KeyNotFoundException($"Semester {dto.SemesterId} not found");

        // Validate tất cả user tồn tại
        foreach (var userId in dto.MemberUserIds.Distinct())
        {
            _ = await _userRepo.GetByIdAsync(userId)
                ?? throw new KeyNotFoundException($"User {userId} not found");
        }

        // Tạo Council
        var council = new Council
        {
            CouncilName = dto.CouncilName,
            SemesterId  = dto.SemesterId
        };
        await _councilRepo.AddAsync(council);
        await _councilRepo.SaveChangesAsync();

        // Thêm từng member
        foreach (var userId in dto.MemberUserIds.Distinct())
        {
            council.CouncilMembers.Add(new CouncilMember
            {
                CouncilId = council.CouncilId,
                UserId    = userId
            });
        }
        await _councilRepo.SaveChangesAsync();

        var created = await _councilRepo.GetWithMembersAsync(council.CouncilId);
        return MapToDto(created!);
    }

    public async Task<CouncilDto> UpdateAsync(int id, UpdateCouncilDto dto)
    {
        var council = await _councilRepo.GetWithMembersAsync(id)
            ?? throw new KeyNotFoundException($"Council {id} not found");

        if (!string.IsNullOrWhiteSpace(dto.CouncilName))
            council.CouncilName = dto.CouncilName;

        if (dto.MemberUserIds != null)
        {
            // Validate tất cả user tồn tại
            foreach (var userId in dto.MemberUserIds.Distinct())
            {
                _ = await _userRepo.GetByIdAsync(userId)
                    ?? throw new KeyNotFoundException($"User {userId} not found");
            }

            var newIds = dto.MemberUserIds.Distinct().ToHashSet();
            var oldIds = council.CouncilMembers.Select(m => m.UserId).ToHashSet();

            // Xóa member cũ không còn trong list mới
            var toRemove = council.CouncilMembers
                .Where(m => !newIds.Contains(m.UserId))
                .ToList();

            // Phải dùng RemoveRange qua DbContext, không dùng collection.Remove
            // (vì FK không nullable → EF sẽ báo lỗi nếu chỉ detach khỏi collection)
            _councilRepo.RemoveMembers(toRemove);

            // Thêm member mới chưa có
            foreach (var userId in newIds.Where(uid => !oldIds.Contains(uid)))
            {
                council.CouncilMembers.Add(new CouncilMember
                {
                    CouncilId = council.CouncilId,
                    UserId    = userId
                });
            }
        }

        _councilRepo.Update(council);
        await _councilRepo.SaveChangesAsync();

        var updated = await _councilRepo.GetWithMembersAsync(id);
        return MapToDto(updated!);
    }

    public async Task DeleteAsync(int id)
    {
        var council = await _councilRepo.GetWithMembersAsync(id)
            ?? throw new KeyNotFoundException($"Council {id} not found");

        // Remove all members first (FK constraint)
        if (council.CouncilMembers.Any())
            _councilRepo.RemoveMembers(council.CouncilMembers.ToList());

        _councilRepo.Remove(council);
        await _councilRepo.SaveChangesAsync();
    }

    private static CouncilDto MapToDto(Council c) => new()
    {
        CouncilId   = c.CouncilId,
        CouncilName = c.CouncilName ?? string.Empty,
        SemesterId  = c.SemesterId,
        Members     = c.CouncilMembers.Select(m => new CouncilMemberDto
        {
            UserId   = m.UserId,
            FullName = m.User?.FullName ?? string.Empty,
            Email    = m.User?.Email   ?? string.Empty
        }).ToList()
    };
}
