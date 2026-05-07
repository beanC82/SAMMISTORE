import React from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  styled,
  CircularProgress,
} from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import { useTheme } from '@mui/material/styles';
import { useRouter } from 'next/router';
import axios from 'axios';
import { getManageOrderDetail } from '@/services/order';
import { PaymentStatus, ShippingStatus, OrderStatus } from "src/configs/order"
import { useTranslation } from 'react-i18next';

// Types
interface InvoiceItem {
  id: number;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface InvoiceProps {
  invoiceNumber: string;
  date: string;
  staffName: string;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: string;
  voucherCode?: string;
  customerName: string;
  phoneNumber: string;
  customerAddress: string;
  paymentStatus: string;
  shippingStatus: string;
  deliveryMethod: string;
  shippingFee: number;
  orderStatus: string;
}

// Styled components
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(6),
  margin: theme.spacing(2, 0),
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  border: '1px solid #ddd',
  backgroundColor: 'white',
  '@media print': {
    boxShadow: 'none',
    padding: 0,
    border: 'none',
  },
}));

const StyledTable = styled(Table)(({ theme }) => ({
  width: '100%',
  borderCollapse: 'collapse',
  marginBottom: theme.spacing(3),
  '& th, & td': {
    border: '1px solid #ddd',
    padding: '8px',
    textAlign: 'left',
    color: '#333',
  },
  '& th': {
    backgroundColor: '#f8f8f8',
    fontWeight: 'bold',
  },
  '& tr:nth-child(even)': {
    backgroundColor: '#f9f9f9',
  },
}));

const StyledTypography = styled(Typography)(({ theme }) => ({
  color: '#333',
  margin: '5px 0',
  '& strong': {
    display: 'inline-block',
    width: '200px',
    color: '#333',
  },
}));

const PrintButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(2, 'auto'),
  display: 'flex',
  width: '200px',
  backgroundColor: theme.palette.primary.main,
  color: 'white',
  alignItems: 'center',
  '@media print': {
    display: 'none',
  },
}));

const Invoice: React.FC<InvoiceProps> = ({
  invoiceNumber,
  date,
  staffName,
  items,
  subtotal,
  discount,
  total,
  paymentMethod,
  voucherCode,
  customerName,
  phoneNumber,
  customerAddress,
  paymentStatus,
  shippingStatus,
  deliveryMethod,
  shippingFee,
  orderStatus,
}) => {
  const theme = useTheme();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Container maxWidth="md" sx={{ py: 8, backgroundColor: '#f5f5f5' }}>
      <StyledPaper>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#333', fontSize: '24px' }}>
            SAMMI STORES
          </Typography>
          <Typography variant="body1" sx={{ color: '#555', margin: '5px 0' }}>
            Địa chỉ: 96 P. Định Công, Phương Liệt, Hoàng Mai, Hà Nội
          </Typography>
          <Typography variant="body1" sx={{ color: '#555', margin: '5px 0' }}>
            Hotline: 0372 191 612, 0376 258 515 | Email: contact@sammistores.vn
          </Typography>
          <Typography variant="body1" sx={{ color: '#555', margin: '5px 0' }}>
            Mã số thuế: 0311234567
          </Typography>
        </Box>

        {/* Invoice Title */}
        <Typography variant="h4" component="h1" align="center" gutterBottom sx={{ color: '#333', fontSize: '20px', margin: '20px 0' }}>
          HÓA ĐƠN BÁN HÀNG
        </Typography>

        {/* Customer Information */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" gutterBottom >
            Thông tin khách hàng
          </Typography>
          <StyledTypography variant="body1">
            <strong>Tên khách hàng:</strong> {customerName}
          </StyledTypography>
          <StyledTypography variant="body1">
            <strong>Số điện thoại:</strong> {phoneNumber}
          </StyledTypography>
        </Box>

        {/* Invoice Info */}
        <Box sx={{ mb: 3 }}>
          <StyledTypography variant="body1">
            <strong>Mã hóa đơn:</strong> {invoiceNumber}
          </StyledTypography>
          <StyledTypography variant="body1">
            <strong>Ngày thanh toán:</strong> {date}
          </StyledTypography>
          <StyledTypography variant="body1">
            <strong>Nhân viên:</strong> {staffName}
          </StyledTypography>
        </Box>

        {/* Items Table */}
        <TableContainer>
          <StyledTable>
            <TableHead>
              <TableRow>
                <TableCell>STT</TableCell>
                <TableCell>Sản phẩm</TableCell>
                <TableCell align="right">SL</TableCell>
                <TableCell align="right">Đơn giá</TableCell>
                <TableCell align="right">Thành tiền</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.id}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell align="right">{item.quantity}</TableCell>
                  <TableCell align="right">{formatCurrency(item.unitPrice)}</TableCell>
                  <TableCell align="right">{formatCurrency(item.total)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </StyledTable>
        </TableContainer>

        {/* Summary */}
        <Box sx={{ mt: 3 }}>
          <StyledTypography variant="body1">
            <strong>Tổng cộng:</strong> {formatCurrency(subtotal)}
          </StyledTypography>

          {voucherCode && (
            <StyledTypography variant="body1">
              <strong>Khuyến mãi:</strong> {formatCurrency(-discount)}
            </StyledTypography>
          )}
          <StyledTypography variant="body1">
            <strong>Tổng thanh toán:</strong> {formatCurrency(total)}
          </StyledTypography>
          <StyledTypography variant="body1">
            <strong>Phương thức thanh toán:</strong> {paymentMethod}
          </StyledTypography>
          <StyledTypography variant="body1">
            <strong>Trạng thái thanh toán:</strong> {paymentStatus}
          </StyledTypography>

          <StyledTypography variant="body1">
            <strong>Trạng thái đơn hàng:</strong> {orderStatus}
          </StyledTypography>
        </Box>

        {/* Footer */}
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="body1" sx={{ color: '#555', margin: '5px 0' }}>
            Cảm ơn quý khách đã mua sắm tại Sammi Store!
          </Typography>
          <Typography variant="body1" sx={{ color: '#555', margin: '5px 0' }}>
            Vui lòng giữ hóa đơn để đổi trả trong 7 ngày.
          </Typography>
          <Typography variant="body1" sx={{ color: '#555', margin: '5px 0' }}>
            Website:{' '}
            <a
              href="http://www.sammistores.vn"
              style={{ color: theme.palette.primary.main, textDecoration: 'none' }}
            >
              www.sammistores.vn
            </a>
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center', textWrap: "nowrap" }}>
          <PrintButton
            variant="contained"
            startIcon={<PrintIcon />}
            onClick={handlePrint}
          >
            In hóa đơn
          </PrintButton>
        </Box>
      </StyledPaper>
    </Container>
  );
};

const BillPage: React.FC = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const orderId = router.query['order-id'];
  const paymentStatus = router.query['payment-status'];
  const errorMessage = router.query['error-message'];
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [invoiceData, setInvoiceData] = React.useState<InvoiceProps | null>(null);

  const getPaymentStatus = (status: string) => {
    const statusObj = Object.values(PaymentStatus).find(item => item.label === status);
    return statusObj ? t(statusObj.title) : '';
  }
  
  const getShippingStatus = (status: string) => {
    const statusObj = Object.values(ShippingStatus).find(item => item.label === status);
    return statusObj ? t(statusObj.title) : '';
  }
  
  const getOrderStatus = (status: string) => {
    const statusObj = Object.values(OrderStatus).find(item => item.label === status);
    return statusObj ? t(statusObj.title) : '';
  }

  React.useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId) {
        setError('Không tìm thấy mã đơn hàng');
        setLoading(false);
        return;
      }

      // Check payment status
      if (paymentStatus === '0') {
        if (errorMessage) {
          setError(decodeURIComponent(errorMessage as string));
        } else {
          setError('Giao dịch không thành công');
        }
        setLoading(false);
        return;
      }

      // Only proceed if payment status is 1
      if (paymentStatus !== '1') {
        setError('Trạng thái thanh toán không hợp lệ');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await getManageOrderDetail(+orderId);

        if (!response.result) {
          setError('Không tìm thấy thông tin đơn hàng');
          setLoading(false);
          return;
        }

        const orderData = response.result;

        // Transform API data to match updated InvoiceProps format
        const transformedData: InvoiceProps = {
          invoiceNumber: orderData.code,
          date: new Date(orderData.createdDate).toLocaleString('vi-VN'),
          staffName: orderData.createdBy,
          items: orderData.details.map((item: any, index: number) => ({
            id: index + 1,
            name: item.productName,
            quantity: item.quantity,
            unitPrice: item.price,
            total: item.price * item.quantity,
          })),
          subtotal: orderData.totalPrice,
          discount: 0, // Voucher discount if needed
          total: orderData.totalPrice + orderData.costShip,
          paymentMethod: orderData.paymentMethod,
          voucherCode: orderData.voucherId ? `Voucher #${orderData.voucherId}` : undefined,
          customerName: orderData.customerName,
          phoneNumber: orderData.phoneNumber,
          customerAddress: orderData.customerAddress,
          paymentStatus: getPaymentStatus(orderData.paymentStatus),
          shippingStatus: getShippingStatus(orderData.shippingStatus),
          deliveryMethod: orderData.shippingCompanyId === 1 ? 'GHN' : 'Unknown',
          shippingFee: orderData.costShip,
          orderStatus: getOrderStatus(orderData.orderStatus),
        };

        setInvoiceData(transformedData);
      } catch (err) {
        setError('Không thể tải thông tin hóa đơn. Vui lòng thử lại sau.');
        console.error('Error fetching order details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId, paymentStatus, errorMessage]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ 
        textAlign: 'center', 
        mt: 4,
        mb: 8,
        p: 6,
        minHeight: '50vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff3f3',
        borderRadius: 2,
        border: '2px solid #ffcdd2',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
      }}>
        <Typography color="error" variant="h4" gutterBottom sx={{ mb: 3 }}>
          Lỗi
        </Typography>
        <Typography color="error" variant="h6" sx={{ maxWidth: '600px', lineHeight: 1.6 }}>
          {error}
        </Typography>
      </Box>
    );
  }

  if (!invoiceData) {
    return null;
  }

  return <Invoice {...invoiceData} />;
};

export default BillPage;
