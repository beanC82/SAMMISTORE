using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using SAMMI.ECOM.Domain.DomainModels.System;
using SAMMI.ECOM.Infrastructure.Hubs;

namespace SAMMI.ECOM.Infrastructure.Services.SignalR
{
    public class SignalRNotificationService
    {
        private readonly IHubContext<NotificationHub, INotificationHub> _hubContext;

        public SignalRNotificationService(IHubContext<NotificationHub, INotificationHub> hubContext)
        {
            _hubContext = hubContext;
        }

        public async Task SendNotificationAsync(int userId, NotificationDTO notifi)
        {
            await _hubContext.Clients.Group(userId.ToString()).ReceiveNotification(notifi);
        }
    }
}
