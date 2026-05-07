using MediatR;
using Microsoft.AspNetCore.Mvc;
using SAMMI.ECOM.API.Application;
using SAMMI.ECOM.Core.Authorizations;
using SAMMI.ECOM.Domain.Commands;
using SAMMI.ECOM.Domain.Enums;
using SAMMI.ECOM.Infrastructure.Queries.CategoryAddress;
using SAMMI.ECOM.Infrastructure.Repositories.AddressCategory;

namespace SAMMI.ECOM.API.Controllers.System
{
    [Route("api/customer-address")]
    [ApiController]
    public class CustomerAddresssController : CustomBaseController
    {
        private readonly ICustomerAddressQueries _addressQueries;
        private readonly ICustomerAddressRepository _addressRepository;
        public CustomerAddresssController(
            ICustomerAddressQueries addressQueries,
            ICustomerAddressRepository addressRepository,
            UserIdentity currentUser,
            IMediator mediator,
            ILogger<CustomerAddresssController> logger) : base(mediator, logger)
        {
            _addressQueries = addressQueries;
            _addressRepository = addressRepository;
            UserIdentity = currentUser;
        }

        [AuthorizePermission(PermissionEnum.CustomerDeliveryAddressManagement)]
        [HttpGet("get-current-address")]
        public async Task<IActionResult> GetCurrentAddressAsync()
        {
            return Ok(await _addressQueries.GetCurrentAddress(UserIdentity.Id));
        }

        [AuthorizePermission(PermissionEnum.CustomerDeliveryAddressManagement)]
        [HttpGet("get-all-current-address")]
        public async Task<IActionResult> GetAllCurrentAddressAsync()
        {
            return Ok(await _addressQueries.GetAllByUserId(UserIdentity.Id));
        }

        [AuthorizePermission(PermissionEnum.CustomerDeliveryAddressManagement)]
        [HttpPost]
        public async Task<IActionResult> Post([FromBody] CUCustomerAddressCommand request)
        {
            if (request.Id != 0)
            {
                return BadRequest();
            }
            var response = await _mediator.Send(request);
            if (response.IsSuccess)
            {
                return Ok(response);
            }
            return BadRequest(response);
        }

        [AuthorizePermission(PermissionEnum.CustomerDeliveryAddressManagement)]
        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, [FromBody] CUCustomerAddressCommand request)
        {
            if (id != request.Id)
            {
                return BadRequest();
            }
            if (!await _addressRepository.IsExisted(id, UserIdentity.Id))
            {
                return BadRequest("Địa chỉ không tồn tại");
            }

            var response = await _mediator.Send(request);
            if (response.IsSuccess)
            {
                return Ok(response);
            }
            return BadRequest(response);
        }

        [AuthorizePermission(PermissionEnum.CustomerDeliveryAddressManagement)]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var address = await _addressRepository.GetByIdAsync(id);
            if (address == null)
            {
                return BadRequest("Địa chỉ nhận hàng không tồn tại");
            }
            if (address.IsDefault == true)
            {
                var addressDefault = (await _addressRepository.GetAll()).SingleOrDefault(x => x.Id != address.Id);
                if (addressDefault != null)
                {
                    addressDefault.IsDefault = true;
                    await _addressRepository.UpdateAndSave(addressDefault);
                }
            }
            return Ok(_addressRepository.DeleteAndSave(id));
        }

        //[HttpDelete]
        //public IActionResult DeleteRange([FromBody] List<int> ids)
        //{
        //    var actErrorResponse = new ActionResponse<List<string>>();
        //    var listError = new Dictionary<int, string>();
        //    if (ids == null || ids.Count == 0)
        //    {
        //        return BadRequest();
        //    }
        //    foreach (var id in ids)
        //    {
        //        if (!_addressRepository.IsExisted(id) && !listError.TryGetValue(id, out var error))
        //        {
        //            listError[id] = $"Không tồn tại banner có mã {id}";
        //        }
        //    }
        //    if (listError.Count > 0)
        //    {
        //        actErrorResponse.SetResult(listError.Select(x => x.Value).ToList());
        //        return BadRequest(actErrorResponse);
        //    }
        //    return Ok(_addressRepository.DeleteRangeAndSave(ids.Cast<object>().ToArray()));
        //}
    }
}
