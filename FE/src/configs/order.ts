
export const PaymentStatus = {
    Pending: {
        value: 0,
        title: 'pending',
        label: 'Pending'
    },
    Unpaid: {
        value: 1,
        title: 'unpaid',
        label: 'Unpaid'
    },
    Paid: {
        value: 2,
        title: 'paid',
        label: 'Paid'
    },
    Failed: {
        value: 3,
        title: 'failed',
        label: 'Failed'
    }
} as const;

export const ShippingStatus = {
    NotShipped: {
        value: 0,
        title: 'not_shipped',
        label: 'NotShipped'
    },
    Processing: {
        value: 1,
        title: 'processing',
        label: 'Processing'
    },
    Delivered: {
        value: 2,
        title: 'delivered',
        label: 'Delivered'
    },
    Lost: {
        value: 3,
        title: 'lost',
        label: 'Lost'
    }
} as const;

export const OrderStatus = {
    Pending: {
        value: 0,
        title: 'pending',
        label: 'Pending'
    },
    WaitingForPayment: {
        value: 1,
        title: 'waiting_for_payment',
        label: 'WaitingForPayment'
    },
    Processing: {
        value: 2,
        title: 'processing',
        label: 'Processing'
    },
    Completed: {
        value: 3,
        title: 'completed',
        label: 'Completed'
    },
    Cancelled: {
        value: 4,
        title: 'cancelled',
        label: 'Cancelled'
    }
} as const;

export const ORDER_STATUS = {
    0: {
      label: 'Wait_payment',
      value: '0'
    },
    1: {
      label: 'Wait_delivery',
      value: '1'
    },
    2: {
      label: 'Done_order',
      value: '2'
    },
    3: {
      label: 'Cancel_order',
      value: '3'
    }
  }