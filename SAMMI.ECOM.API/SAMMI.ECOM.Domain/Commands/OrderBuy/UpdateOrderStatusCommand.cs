using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using SAMMI.ECOM.Domain.Enums;

namespace SAMMI.ECOM.Domain.Commands.OrderBuy
{
    public class UpdateOrderStatusCommand
    {
        public int OrderId { get; set; }
        public PaymentStatusEnum PaymentStatus { get; set; }
        public ShippingStatusEnum ShippingStatus { get; set; }
    }
}
