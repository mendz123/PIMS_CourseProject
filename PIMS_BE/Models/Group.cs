using System;
using System.Collections.Generic;

namespace PIMS_BE.Models;

public partial class Group
{
    public int GroupId { get; set; }

    public string? GroupName { get; set; }

    public int SemesterId { get; set; }

    public int LeaderId { get; set; }

    public int? MentorId { get; set; }

    public int StatusId { get; set; }

    public virtual ICollection<CouncilCriteriaGrade> CouncilCriteriaGrades { get; set; } = new List<CouncilCriteriaGrade>();

    public virtual ICollection<DefenseSchedule> DefenseSchedules { get; set; } = new List<DefenseSchedule>();

    public virtual ICollection<GroupMember> GroupMembers { get; set; } = new List<GroupMember>();

    public virtual User Leader { get; set; } = null!;

    public virtual User? Mentor { get; set; }

    public virtual ICollection<MentorRequest> MentorRequests { get; set; } = new List<MentorRequest>();

    public virtual ICollection<Project> Projects { get; set; } = new List<Project>();

    public virtual Semester Semester { get; set; } = null!;

    public virtual GroupStatus Status { get; set; } = null!;
}
