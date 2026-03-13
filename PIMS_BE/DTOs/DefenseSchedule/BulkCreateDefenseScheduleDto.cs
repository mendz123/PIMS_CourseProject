using System.ComponentModel.DataAnnotations;

namespace PIMS_BE.DTOs.DefenseSchedule;

/// <summary>
/// Tạo lịch bảo vệ hàng loạt cho nhiều nhóm trong một khung giờ.
/// Hệ thống tự chia đều slot (hoặc theo SlotMinutes nếu được chỉ định).
/// Ví dụ: 3 nhóm, 07:00–10:00 → mỗi nhóm 60 phút: 07:00–08:00, 08:00–09:00, 09:00–10:00
/// </summary>
public class BulkCreateDefenseScheduleDto
{
    [Required]
    public int CouncilId { get; set; }

    [Required(ErrorMessage = "Defense date is required")]
    public DateOnly DefenseDate { get; set; }

    [Required(ErrorMessage = "Window start time is required")]
    public TimeOnly WindowStart { get; set; }

    [Required(ErrorMessage = "Window end time is required")]
    public TimeOnly WindowEnd { get; set; }

    /// <summary>Danh sách GroupId cần xếp lịch (thứ tự = thứ tự slot)</summary>
    [Required]
    [MinLength(1, ErrorMessage = "At least one group is required")]
    public List<int> GroupIds { get; set; } = [];

    /// <summary>
    /// Thời lượng mỗi slot (phút). Nếu null → tự tính đều từ tổng khung giờ / số nhóm.
    /// </summary>
    public int? SlotMinutes { get; set; }

    /// <summary>Phòng học (tùy chọn, có thể gán sau qua UC24)</summary>
    public int? RoomId { get; set; }
}
