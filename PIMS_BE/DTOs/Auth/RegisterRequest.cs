using System.ComponentModel.DataAnnotations;

namespace PIMS_BE.DTOs.Auth;

/// <summary>
/// Request body cho đăng ký
/// </summary>
public class RegisterRequest
{
    [Required(ErrorMessage = "Email là bắt buộc")]
    [EmailAddress(ErrorMessage = "Email không hợp lệ")]
    public string Email { get; set; } = null!;

    [Required(ErrorMessage = "Mật khẩu là bắt buộc")]
    [MinLength(6, ErrorMessage = "Mật khẩu phải có ít nhất 6 ký tự")]
    public string Password { get; set; } = null!;

    [Required(ErrorMessage = "Họ tên là bắt buộc")]
    [StringLength(255, ErrorMessage = "Họ tên không được vượt quá 255 ký tự")]
    public string FullName { get; set; } = null!;
}
