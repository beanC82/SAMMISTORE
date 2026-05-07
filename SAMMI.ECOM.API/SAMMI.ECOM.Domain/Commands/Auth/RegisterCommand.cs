using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MediatR;
using SAMMI.ECOM.Core.Models;
using SAMMI.ECOM.Domain.DomainModels.Auth;

namespace SAMMI.ECOM.Domain.Commands.Auth
{
    public class RegisterCommand : IRequest<ActionResponse<RegisterResult>>
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Phone { get; set; }
        public string Email { get; set; }
        public string Username { get; set; }
        public string? Password { get; set; }
        public string? RePassword { get; set; }
    }
}
