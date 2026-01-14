using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PIMS_BE.Models;

/// <summary>
/// Lưu refresh token để cho phép làm mới access token
/// </summary>
public class RefreshToken
{
    [Key]
    public int Id { get; set; }

    [Required]
    [StringLength(500)]
    public string Token { get; set; } = null!;

    [Required]
    public int UserId { get; set; }

    [ForeignKey("UserId")]
    public virtual User User { get; set; } = null!;

    [Column(TypeName = "datetime")]
    public DateTime ExpiresAt { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column(TypeName = "datetime")]
    public DateTime? RevokedAt { get; set; }

    public bool IsRevoked { get; set; } = false;

    /// <summary>
    /// Check xem token còn hợp lệ không
    /// </summary>
    public bool IsActive => !IsRevoked && DateTime.UtcNow < ExpiresAt;
}
