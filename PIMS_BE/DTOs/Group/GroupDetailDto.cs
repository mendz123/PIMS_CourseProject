namespace PIMS_BE.DTOs.Group
{
    public class GroupDetailDto : GroupDto
    {
        public List<GroupMemberDto> Members { get; set; } = new();
    }
}
