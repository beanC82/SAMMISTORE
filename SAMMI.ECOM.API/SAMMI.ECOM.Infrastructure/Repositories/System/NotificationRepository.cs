using AutoMapper;
using Microsoft.EntityFrameworkCore;
using SAMMI.ECOM.Core.Models;
using SAMMI.ECOM.Domain.AggregateModels.OrderBuy;
using SAMMI.ECOM.Domain.AggregateModels.System;
using SAMMI.ECOM.Domain.Commands.System;
using SAMMI.ECOM.Domain.DomainModels.System;
using SAMMI.ECOM.Infrastructure.Repositories.Permission;
using SAMMI.ECOM.Infrastructure.Services.SignalR;
using SAMMI.ECOM.Repository.GenericRepositories;

namespace SAMMI.ECOM.Infrastructure.Repositories.System
{
    public interface INotificationRepository : ICrudRepository<Notification>
    {
        Task<bool> IsReadAll(int userId);
        Task<ActionResponse<NotificationDTO>> CreateNotifi(Notification notifi);
        Task<ActionResponse> CreateNotifiForRole(object role, Notification notifi);
    }
    public class NotificationRepository : CrudRepository<Notification>, INotificationRepository, IDisposable
    {
        private readonly SammiEcommerceContext _context;
        private bool _disposed;
        private readonly IMapper _mapper;
        private readonly Lazy<IUsersRepository> _userRepository;
        private readonly Lazy<IRoleRepository> _roleRepository;
        private readonly SignalRNotificationService _notifiSignalR;
        public NotificationRepository(SammiEcommerceContext context,
            Lazy<IUsersRepository> userRepository,
            Lazy<IRoleRepository> roleRepository,
            SignalRNotificationService notifiSignalR,
            IMapper mapper) : base(context)
        {
            _context = context;
            _mapper = mapper;
            _userRepository = userRepository;
            _roleRepository = roleRepository;
            _notifiSignalR = notifiSignalR;
        }

        public async Task<ActionResponse<NotificationDTO>> CreateNotifi(Notification notifi)
        {
            var actRes = new ActionResponse<NotificationDTO>();
            notifi.CreatedDate = DateTime.Now;
            var createRes = await CreateAndSave(notifi);
            actRes.Combine(createRes);
            if(!actRes.IsSuccess)
            {
                return actRes;
            }
            await _notifiSignalR.SendNotificationAsync(notifi.ReceiverId, _mapper.Map<NotificationDTO>(notifi));
            actRes.SetResult(_mapper.Map<NotificationDTO>(createRes.Result));
            return actRes;
        }

        public void Dispose()
        {
            _disposed = true;
        }

        public async Task<bool> IsReadAll(int userId)
        {
            var notifications = await DbSet.Where(x => x.ReceiverId == userId && x.IsReaded != true).ToListAsync();
            if (notifications != null && notifications.Count > 0)
            {
                foreach (var notification in notifications)
                {
                    notification.IsReaded = true;
                    var updateRes = Update(notification);
                    if (!updateRes.IsSuccess)
                        return false;
                }
                await SaveChangeAsync();
            }
            return false;
        }

        public async Task<ActionResponse> CreateNotifiForRole(object role, Notification notifi)
        {
            var actRes = new ActionResponse();
            notifi.CreatedDate = DateTime.Now;
            notifi.IsReaded = false;
            bool isRoleId = false;
            if(role is int)
                isRoleId = true;
            role = await _roleRepository.Value.GetIdByCode(role.ToString());
            var userIds = await _userRepository.Value.GetUserByRole(int.Parse(role.ToString()));
            foreach (var id in userIds)
            {
                notifi.ReceiverId = id;
                var createRes = Create(notifi);
                actRes.Combine(createRes);
                if (!actRes.IsSuccess)
                    return actRes;
            }
            await SaveChangeAsync();
            foreach(var id in userIds)
            {
                notifi.ReceiverId = id;
                await _notifiSignalR.SendNotificationAsync(id, _mapper.Map<NotificationDTO>(notifi));
            }
            return actRes;
        }
    }
}
