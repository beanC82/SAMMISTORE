using MediatR;
using Microsoft.AspNetCore.Mvc;
using SAMMI.ECOM.Core.Authorizations;
using SAMMI.ECOM.Infrastructure.Queries.System;
using SAMMI.ECOM.Infrastructure.Repositories.System;
using SAMMI.ECOM.Infrastructure.Services.SignalR;

namespace SAMMI.ECOM.API.Controllers.System
{
    public class NotificationsController : CustomBaseController
    {
        private readonly INotificationRepository _notifiRepostory;
        private readonly INotificationQueries _notificationQueries;
        private readonly SignalRNotificationService _notifiSignalR;
        public NotificationsController(
            INotificationRepository notificationRepostory,
            INotificationQueries notificationQueries,
            UserIdentity userIdentity,
            SignalRNotificationService signalRNotificationService,
            IMediator mediator,
            ILogger<NotificationsController> logger) : base(mediator, logger)
        {
            _notifiRepostory = notificationRepostory;
            _notificationQueries = notificationQueries;
            UserIdentity = userIdentity;
            _notifiSignalR = signalRNotificationService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAsync()
        {
            await _notifiSignalR.SendNotificationAsync(1, new Domain.DomainModels.System.NotificationDTO()
            {
                ReceiverId = 1,
                Title = "Hello Hoàn",
                Content = "Hôm nay là sinh nhật của bạn"
            });
            return Ok(await _notificationQueries.GetAll(UserIdentity.Id));
        }

        [HttpGet("send")]
        public async Task<IActionResult> SendAsync()
        {
            await _notifiSignalR.SendNotificationAsync(1, new Domain.DomainModels.System.NotificationDTO()
            {
                ReceiverId = 1,
                Title = "Hello Hoàn",
                Content = "Hôm nay là sinh nhật của bạn"
            });
            return Ok();
        }

        [HttpPut]
        public async Task<IActionResult> Put()
        {
            _notifiRepostory.IsReadAll(UserIdentity.Id);
            return Ok();
        }
    }
}
