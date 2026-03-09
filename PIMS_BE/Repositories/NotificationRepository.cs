using PIMS_BE.Models;

namespace PIMS_BE.Repositories;

public interface INotificationRepository : IGenericRepository<Notification>
{
}

public class NotificationRepository : GenericRepository<Notification>, INotificationRepository
{
    public NotificationRepository(PimsDbContext context) : base(context)
    {
    }
}
