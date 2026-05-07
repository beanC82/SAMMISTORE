using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using SAMMI.ECOM.Core.Authorizations;
using SAMMI.ECOM.Domain.DomainModels.System;

namespace SAMMI.ECOM.Infrastructure.Hubs
{
    public interface INotificationHub
    {
        Task ReceiveNotification(NotificationDTO notifi);
    }
    [Authorize]
    public class NotificationHub : Hub<INotificationHub>
    {
        private readonly UserIdentity UserIdentity;
        public NotificationHub(UserIdentity userIdentity) { UserIdentity = userIdentity; }
        public override async Task OnConnectedAsync()
        {
            if (!string.IsNullOrEmpty(UserIdentity.UserName))
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, UserIdentity.Id.ToString());
            }
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            if (!string.IsNullOrEmpty(UserIdentity.UserName))
            {
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, UserIdentity.Id.ToString());
            }
            await base.OnDisconnectedAsync(exception);
        }
    }
}
