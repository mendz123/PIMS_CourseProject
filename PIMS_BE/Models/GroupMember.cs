using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace PIMS_BE.Models;

public partial class GroupMember
{
    [Key]
    public int GroupMemberId { get; set; }

    public int? GroupId { get; set; }

    public int? StudentId { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? JoinedAt { get; set; }

    // --- Cập nhật thêm 2 cột mới dưới đây ---
    
    [StringLength(20)]
    public string Status { get; set; } = "ACTIVE"; // Mặc định là ACTIVE

    [Column(TypeName = "datetime")]
    public DateTime? LeftAt { get; set; } // Lưu thời gian khi sinh viên rời nhóm

    // ---------------------------------------

    [ForeignKey("GroupId")]
    [InverseProperty("GroupMembers")]
    public virtual Group? Group { get; set; }

    [ForeignKey("StudentId")]
    [InverseProperty("GroupMembers")]
    public virtual User? Student { get; set; }
}