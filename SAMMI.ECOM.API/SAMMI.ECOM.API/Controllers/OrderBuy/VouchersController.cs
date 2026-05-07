using AutoMapper;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SAMMI.ECOM.API.Application;
using SAMMI.ECOM.Core.Authorizations;
using SAMMI.ECOM.Core.Models;
using SAMMI.ECOM.Domain.AggregateModels.EventVoucher;
using SAMMI.ECOM.Domain.Commands.OrderBuy;
using SAMMI.ECOM.Domain.DomainModels.OrderBuy;
using SAMMI.ECOM.Domain.Enums;
using SAMMI.ECOM.Infrastructure.Queries.OrderBy;
using SAMMI.ECOM.Infrastructure.Repositories.AddressCategory;
using SAMMI.ECOM.Infrastructure.Repositories.OrderBy;
using SAMMI.ECOM.Infrastructure.Repositories.Products;

namespace SAMMI.ECOM.API.Controllers.OrderBuy
{
    [Route("api/[controller]")]
    [ApiController]
    public class VouchersController : CustomBaseController
    {
        private readonly IVoucherQueries _voucherQueries;
        private readonly IVoucherRepository _voucherRepository;
        private readonly IMyVoucherRepository _myVoucherRepository;
        private readonly IProductRepository _productRepository;
        private readonly IMyVoucherQueries _myVoucherQueries;
        private readonly IMapper _mapper;
        private readonly ICustomerAddressRepository _addressRepository;
        private readonly IDiscountTypeQueries _discountTypeQueries;
        public VouchersController(
            IVoucherQueries voucherQueries,
            IVoucherRepository voucherRepository,
            IMyVoucherRepository myVoucherRepository,
            IProductRepository productRepository,
            UserIdentity currentUser,
            IMyVoucherQueries myVoucherQueries,
            IMapper mapper,
            ICustomerAddressRepository customerAddressRepository,
            IDiscountTypeQueries discountTypeQueries,
            IMediator mediator,
            ILogger<UsersController> logger) : base(mediator, logger)
        {
            _voucherQueries = voucherQueries;
            _voucherRepository = voucherRepository;
            UserIdentity = currentUser;
            _myVoucherRepository = myVoucherRepository;
            _productRepository = productRepository;
            _myVoucherQueries = myVoucherQueries;
            _mapper = mapper;
            _addressRepository = customerAddressRepository;
            _discountTypeQueries = discountTypeQueries;
        }

        // top 20 vouchers cho trang chủ

        [AuthorizePermission(PermissionEnum.VoucherView)]
        [HttpGet]
        public async Task<IActionResult> Get([FromQuery] RequestFilterModel request)
        {
            if (request.Type == RequestType.SimpleAll)
            {
                return Ok(await _voucherQueries.GetAll(request));
            }
            return Ok(await _voucherQueries.GetList(request));
        }

        //[AuthorizePermission(PermissionEnum.VoucherView)]
        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            return Ok(await _voucherQueries.GetById(id));
        }

        [AuthorizePermission(PermissionEnum.VoucherView)]
        [HttpGet("voucher-valid")]
        public IActionResult GetVoucherValid(List<ProductVoucher> request)
        {
            return Ok();
        }

        [AuthorizePermission(PermissionEnum.VoucherCreate)]
        [HttpPost]
        public async Task<IActionResult> Post([FromBody] CUVoucherCommand request)
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

        [AuthorizePermission(PermissionEnum.VoucherUpdate)]
        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, [FromBody] CUVoucherCommand request)
        {
            if (id != request.Id)
            {
                return BadRequest();
            }
            if (!_voucherRepository.IsExisted(id))
            {
                return BadRequest("Phiếu giảm giá không tồn tại.");
            }
            var response = await _mediator.Send(request);
            if (response.IsSuccess)
            {
                return Ok(response);
            }
            return BadRequest(response);
        }

        [AuthorizePermission(PermissionEnum.VoucherDelete)]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var actRes = new ActionResponse();
            var voucher = await _voucherRepository.GetByIdAsync(id);
            if (voucher == null)
            {
                return BadRequest("Phiếu giảm giá không tồn tại.");
            }
            if (await _voucherRepository.IsExistAnother(id))
            {
                actRes.AddError("Không thể xóa! Phiếu giảm giá này đã được sử dụng");
                return BadRequest(actRes);
            }
            if ((await _voucherRepository.GetByEventId(voucher.EventId)).Count() <= 1)
            {
                actRes.AddError("Không thể xóa! Đây là phiếu giảm giá cuối cùng của chương trình khuyến mãi");
                return BadRequest(actRes);
            }
            return Ok(_voucherRepository.DeleteAndSave(id));
        }

        [AuthorizePermission(PermissionEnum.VoucherDelete)]
        [HttpDelete]
        public async Task<IActionResult> DeleteRangeAsync([FromBody] List<int> ids)
        {
            var actErrorResponse = new ActionResponse();
            if (ids == null || ids.Count == 0)
            {
                return BadRequest();
            }
            if (!ids.All(id => _voucherRepository.IsExisted(id)))
            {
                actErrorResponse.AddError("Một số phiếu giảm giá không tồn tại.");
                return BadRequest(actErrorResponse);
            }
            var checkExistAnotherAll = await Task.WhenAll(ids.Select(id => _voucherRepository.IsExistAnother(id)));
            if (!checkExistAnotherAll.All(x => x))
            {
                actErrorResponse.AddError("Một số phiếu giảm giá đã được sử dụng");
                return BadRequest(actErrorResponse);
            }
            foreach (int id in ids)
            {
                var voucher = await _voucherRepository.GetByIdAsync(id);
                if ((await _voucherRepository.GetByEventId(voucher.EventId)).Count() <= 1)
                {
                    actErrorResponse.AddError("Một số phiếu giảm giá là phiếu cuối cùng của chương trình khuyến mãi");
                    return BadRequest(actErrorResponse);
                }
            }
            return Ok(_voucherRepository.DeleteRangeAndSave(ids.Cast<object>().ToArray()));
        }

        [HttpGet("get-code-by-last-id")]
        public async Task<IActionResult> GetCodeByLastId()
        {
            return Ok(await _voucherQueries.GetCodeByLastId());
        }


        [AuthorizePermission(PermissionEnum.CustomerVoucherManage)]
        [HttpPost("save-voucher")]
        public async Task<IActionResult> PostMyVoucherAsync([FromBody] int voucherId)
        {
            var voucher = await _voucherRepository.GetByIdAsync(voucherId);
            if (voucher == null)
                return NotFound("Phiếu giảm giá không tồn tại");

            if (voucher.EndDate < DateTime.Now)
            {
                return BadRequest("Phiếu giảm giá này chưa đã hết hạn");
            }

            if (await _myVoucherRepository.IsExisted(voucherId, UserIdentity.Id))
            {
                return BadRequest("Phiếu giảm giá đã được lưu trước đó");
            }
            var request = new MyVoucher
            {
                VoucherId = voucherId,
                CustomerId = UserIdentity.Id,
                IsUsed = false,
                CreatedDate = DateTime.Now,
                CreatedBy = "System"
            };
            var createRes = await _myVoucherRepository.CreateAndSave(request);
            if (createRes.IsSuccess)
            {
                return Ok(_mapper.Map<MyVoucherDTO>(createRes.Result));
            }
            return BadRequest(createRes);
        }

        [AuthorizePermission(PermissionEnum.CustomerVoucherManage)]
        [HttpGet("my-voucher")]
        public async Task<IActionResult> GetMyVoucherAsync()
        {
            return Ok(await _voucherQueries.GetVoucherOfCustomer(UserIdentity.Id));
        }

        [AuthorizePermission(PermissionEnum.CustomerVoucherManage)]
        [HttpPost("my-voucher-apply")]
        public async Task<IActionResult> GetMyVoucherApplyAsync([FromBody] RequestVoucherDTO request)
        {
            var actRes = new ActionResponse();
            foreach (var item in request.Details)
            {
                if (!_productRepository.IsExisted(item.ProductId))
                {
                    actRes.AddError("Mã sản phẩm không tồn tại");
                    return BadRequest(actRes);
                }
                item.Price = await _productRepository.GetPrice(item.ProductId);
            }

            decimal totalAmount = request.Details.Sum(x => x.Quantity * x.Price) ?? 0;

            var address = await _addressRepository.GetDefaultByUserId(UserIdentity.Id);
            if (address == null)
            {
                actRes.AddError("Bạn vui lòng thêm địa chỉ nhận hàng. Để áp dụng các phiếu giảm giá");
                return BadRequest(actRes);
            }
            return Ok(await _myVoucherQueries.GetDataInCheckout(UserIdentity.Id, totalAmount, request.Details));
        }

        [AuthorizePermission(PermissionEnum.CustomerVoucherManage)]
        [HttpPost("apply-voucher/{voucherCode}")]
        public async Task<IActionResult> ApplyVoucher(string voucherCode, [FromBody] RequestVoucherDTO request)
        {
            var actRes = new ActionResponse<MyVoucherDTO>();
            var voucher = await _voucherRepository.GetByCode(voucherCode);
            if (voucher == null)
            {
                actRes.AddError("Phiếu giảm giá không tồn tại.");
                return BadRequest(actRes);
            }
            foreach (var item in request.Details)
            {
                if (!_productRepository.IsExisted(item.ProductId))
                {
                    actRes.AddError("Mã sản phẩm không tồn tại");
                    return BadRequest(actRes);
                }
                item.Price = await _productRepository.GetPrice(item.ProductId);
            }
            decimal totalAmount = request.Details.Sum(x => x.Quantity * x.Price) ?? 0;
            if (await _myVoucherRepository.IsExisted(voucher.Id, UserIdentity.Id))
            {
                actRes.AddError("Phiếu giảm giá đã được lưu trước đó");
                return BadRequest(actRes);
            }

            var myVoucherRequest = new MyVoucher
            {
                VoucherId = voucher.Id,
                CustomerId = UserIdentity.Id,
                IsUsed = false,
                CreatedDate = DateTime.Now,
                CreatedBy = "System"
            };
            var createRes = await _myVoucherRepository.CreateAndSave(myVoucherRequest);
            actRes.Combine(createRes);
            if (!createRes.IsSuccess)
            {
                return BadRequest(actRes);
            }
            var myVoucherResult = _mapper.Map<MyVoucherDTO>(createRes.Result);
            var address = await _addressRepository.GetDefaultByUserId(UserIdentity.Id);
            if (address == null)
            {
                actRes.AddError("Bạn vui lòng thêm địa chỉ nhận hàng. Để xem được các phiếu giảm giá được áp dụng phù hợp với đơn hàng");
                return BadRequest(actRes);
            }
            myVoucherResult.IsValid = await _voucherRepository.ValidVoucher(myVoucherResult.VoucherId, UserIdentity.Id, address.WardId ?? 0, totalAmount, request.Details);
            actRes.SetResult(myVoucherResult);
            return Ok(actRes);
        }

        [AllowAnonymous]
        [HttpGet("get-top-vouchers")]
        public async Task<IActionResult> GetVoucherTopAsync(int numberTop = 15)
        {
            return Ok(await _voucherQueries.GetVoucherActive(numberTop));
        }
    }
}
