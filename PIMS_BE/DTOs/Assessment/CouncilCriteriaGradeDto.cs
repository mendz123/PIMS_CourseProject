namespace PIMS_BE.DTOs.Assessment
{
    public class CouncilCriteriaGradeDto
    {
        public int UserId { get; set; }
        public int CriteriaId { get; set; }
        public decimal Score { get; set; }
    }
}
