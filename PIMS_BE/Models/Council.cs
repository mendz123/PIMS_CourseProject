using System;
using System.Collections.Generic;

namespace PIMS_BE.Models;

public partial class Council
{
    public int CouncilId { get; set; }

    public string? CouncilName { get; set; }

    public int SemesterId { get; set; }

    public virtual ICollection<CouncilCriteriaGrade> CouncilCriteriaGrades { get; set; } = new List<CouncilCriteriaGrade>();

    public virtual ICollection<CouncilMember> CouncilMembers { get; set; } = new List<CouncilMember>();

    public virtual ICollection<DefenseSchedule> DefenseSchedules { get; set; } = new List<DefenseSchedule>();

    public virtual Semester Semester { get; set; } = null!;
}
