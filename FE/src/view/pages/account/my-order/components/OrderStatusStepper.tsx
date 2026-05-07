import * as React from 'react';
import { styled } from '@mui/material/styles';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import StepConnector, { stepConnectorClasses } from '@mui/material/StepConnector';
import { Typography } from '@mui/material';
import IconifyIcon from 'src/components/Icon';

const steps = [
  { key: 'Pending', icon: 'tabler:receipt', label: 'Chờ xử lý' },
  { key: 'WaitingForPayment', icon: 'tabler:credit-card', label: 'Chờ thanh toán' },
  { key: 'Processing', icon: 'tabler:truck-delivery', label: 'Đang xử lý' },
  { key: 'Completed', icon: 'tabler:star', label: 'Hoàn thành' },
];

const CustomConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 28,
  },
  [`& .${stepConnectorClasses.line}`]: {
    height: 3,
    border: 0,
    backgroundColor: theme.palette.grey[300],
    borderRadius: 1,
  },
  [`&.${stepConnectorClasses.active}, &.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundColor: theme.palette.primary.main,
    },
  },
}));

const OrderStepIconRoot = styled('div')<{ ownerState: { active?: boolean; completed?: boolean } }>(
  ({ theme, ownerState }) => ({
    backgroundColor: '#fff',
    zIndex: 1,
    color: ownerState.active || ownerState.completed ? theme.palette.primary.main : theme.palette.grey[300],
    width: 56,
    height: 56,
    display: 'flex',
    borderRadius: '50%',
    justifyContent: 'center',
    alignItems: 'center',
    border: `3px solid ${ownerState.active || ownerState.completed ? theme.palette.primary.main : theme.palette.grey[300]}`,
    fontSize: 32,
    boxSizing: 'border-box',
  })
);

function OrderStepIcon(props: any) {
  const { active, completed, className, icon } = props;
  const step = steps[Number(icon) - 1];
  return (
    <OrderStepIconRoot ownerState={{ active, completed }} className={className}>
      <IconifyIcon icon={step.icon} fontSize={32} />
    </OrderStepIconRoot>
  );
}

export default function OrderStatusStepper({ orderStatus }: { orderStatus: string }) {
  if (orderStatus === 'Cancelled') {
    return null;
  }
  const currentStep = steps.findIndex(s => s.key === orderStatus);

  if (currentStep === -1) {
    return <Typography color="error">Trạng thái đơn hàng không hợp lệ</Typography>;
  }

  return (
    <Stepper
      alternativeLabel
      activeStep={currentStep}
      connector={<CustomConnector />}
      sx={{ width: '100%', mb: 4, px: 2 }}
    >
      {steps.map((step, idx) => (
        <Step key={step.key} completed={idx < currentStep}>
          <StepLabel StepIconComponent={OrderStepIcon}>
            <Typography
              variant="body2"
              sx={{
                color: idx <= currentStep ? 'primary.main' : 'grey.500',
                fontWeight: idx <= currentStep ? 700 : 400,
                fontSize: 15,
                letterSpacing: 0.1,
                textAlign: 'center',
                whiteSpace: 'nowrap',
              }}
            >
              {step.label}
            </Typography>
          </StepLabel>
        </Step>
      ))}
    </Stepper>
  );
}