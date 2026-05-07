using AutoMapper;
using MediatR;
using SAMMI.ECOM.Core.Authorizations;
using SAMMI.ECOM.Core.Models;

namespace SAMMI.ECOM.API.Application.CommandHandlers
{
    public abstract class CustombaseCommandHandler<TCommand, TResult> : IRequestHandler<TCommand, ActionResponse<TResult>>
        where TCommand : IRequest<ActionResponse<TResult>>
    {
        protected readonly UserIdentity _currentUser;
        protected readonly IMapper _mapper;
        protected CustombaseCommandHandler(UserIdentity currentUser,
            IMapper mapper)
        {
            _currentUser = currentUser;
            _mapper = mapper;
        }

        public abstract Task<ActionResponse<TResult>> Handle(TCommand request, CancellationToken cancellationToken);

    }
}
