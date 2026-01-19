using PIMS_BE.Models;
using System.ComponentModel.DataAnnotations.Schema;

public partial class RefreshToken
{
    public int Id { get; set; }
    public string Token { get; set; } = null!;
    public int UserId { get; set; }

    public DateTime ExpiresAt { get; set; }
    public DateTime CreatedAt { get; set; }

    public DateTime? RevokedAt { get; set; }
    public bool IsRevoked { get; set; }

    public virtual User User { get; set; } = null!;

    [NotMapped] // ⭐ QUAN TRỌNG
    public bool IsActive => !IsRevoked && ExpiresAt > DateTime.UtcNow;
}
