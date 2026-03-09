namespace PIMS_BE.DTOs.Semester
{
    public class SemesterDto
    {
        public int       SemesterId   { get; set; }
        public string    SemesterName { get; set; } = string.Empty;
        public DateOnly? StartDate    { get; set; }
        public DateOnly? EndDate      { get; set; }
        public int?      MinGroupSize { get; set; }
        public int?      MaxGroupSize { get; set; }
        public bool?     IsActive     { get; set; }
    }
}
