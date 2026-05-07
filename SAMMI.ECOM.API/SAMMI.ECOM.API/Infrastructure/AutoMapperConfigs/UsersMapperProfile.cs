using AutoMapper;
using SAMMI.ECOM.Domain.AggregateModels.Others;
using SAMMI.ECOM.Domain.Commands.Auth;
using SAMMI.ECOM.Domain.Commands.User;
using SAMMI.ECOM.Domain.DomainModels.Users;

namespace SAMMI.ECOM.API.Infrastructure.AutoMapperConfigs
{
    public class UsersMapperProfile : Profile
    {
        public UsersMapperProfile()
        {
            CreateMap<CreateEmployeeCommand, User>();
            CreateMap<UpdateEmployeeCommand, User>();
            CreateMap<User, EmployeeDTO>();
            CreateMap<User, UserDTO>();

            CreateMap<CUCustomerCommand, User>();
            CreateMap<CreateCustomerFasterCommand, User>();
            CreateMap<User, CustomerDTO>();

            CreateMap<CUSupplierCommand, User>();
            CreateMap<User, SupplierDTO>();

            CreateMap<RegisterCommand, User>().ReverseMap();
            CreateMap<RegisterCommand, CUCustomerCommand>();

            CreateMap<UpdateCustomerInfoRequest, CustomerDTO>();
            CreateMap<UpdateEmployeeInfoRequest, EmployeeDTO>();


        }
    }
}
