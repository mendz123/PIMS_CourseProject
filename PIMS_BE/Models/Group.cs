using System;
using System.Collections.Generic;

namespace PIMS_BE.Models;

public partial class Group
{
    public int GroupId { get; set; }

    public int? ClassId { get; set; }

    public string? GroupName { get; set; }

    public int? LeaderId { get; set; }

    public int? StatusId { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual ICollection<AssessmentScore> AssessmentScores { get; set; } = new List<AssessmentScore>();

    public virtual ICollection<AssessmentSubmission> AssessmentSubmissions { get; set; } = new List<AssessmentSubmission>();

    public virtual Class? Class { get; set; }

    public virtual ICollection<DefenseSchedule> DefenseSchedules { get; set; } = new List<DefenseSchedule>();

    public virtual ICollection<GroupMember> GroupMembers { get; set; } = new List<GroupMember>();

    public virtual User? Leader { get; set; }

    public virtual ICollection<Project> Projects { get; set; } = new List<Project>();

    public virtual GroupStatus? Status { get; set; }
}
