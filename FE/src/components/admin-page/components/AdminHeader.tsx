import React, { Suspense } from 'react';
import { Box, Stack } from '@mui/material';
import dynamic from 'next/dynamic';

// Dynamic imports
const TableHeader = dynamic(() => import("src/components/table-header"), { ssr: false });
const GridCreate = dynamic(() => import("src/components/grid-create"), { ssr: false });
const UpdateReceiptStatusHeader = dynamic(() => import("src/components/update-receipt-status-header"), { ssr: false });
const UpdateOrderStatusHeader = dynamic(() => import("src/components/update-order-status-header"), { ssr: false });
const OrderFilter = dynamic(() => import("src/view/pages/manage-order/order/components/OrderFilter"), { ssr: false });

interface AdminHeaderProps {
  entityName: string;
  selectedRow: number[];
  setSelectedRow: (rows: number[]) => void;
  handleAction: (action: string) => void;
  onAddClick?: () => void;
  setOpenCreateUpdate: (value: { open: boolean; id: number }) => void;
  hideAddButton: boolean;
  hideTableHeader: boolean;
  showOrderFilter: boolean;
  showUpdateReceiptStatusHeader: boolean;
  showUpdateOrderStatusHeader: boolean;
  handleFilterChange: (filters: any[]) => void;
  handleFetchData: () => void;
  t: (key: string) => string;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({
  entityName,
  selectedRow,
  setSelectedRow,
  handleAction,
  onAddClick,
  setOpenCreateUpdate,
  hideAddButton,
  hideTableHeader,
  showOrderFilter,
  showUpdateReceiptStatusHeader,
  showUpdateOrderStatusHeader,
  handleFilterChange,
  handleFetchData,
  t
}) => {
  const handleAddClick = () => {
    if (onAddClick) {
      onAddClick();
    } else {
      setOpenCreateUpdate({ open: true, id: 0 });
    }
  };

  const handleClearSelection = () => {
    setSelectedRow([]);
  };

  return (
    <>
      {/* Top bar with filters and add button */}
      <Stack justifyContent="space-between" alignItems="center" direction="row" mb={2} width="100%">
        {showOrderFilter && (
          <OrderFilter onFilterChange={handleFilterChange} />
        )}
        
        {!selectedRow.length && !hideAddButton && (
          <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 4, width: "100%" }}>
            <Suspense fallback={null}>
              <GridCreate
                addText={t(`create_${entityName}`)}
                onClick={handleAddClick}
              />
            </Suspense>
          </Box>
        )}
      </Stack>

      {/* Headers when rows are selected */}
      {selectedRow.length > 0 && (
        <Suspense fallback={null}>
          {!hideTableHeader && (
            <TableHeader
              selectedRowNumber={selectedRow.length}
              onClear={handleClearSelection}
              actions={[{ label: t("delete"), value: "delete" }]}
              handleAction={handleAction}
              selectedRows={selectedRow}
            />
          )}

          {showUpdateReceiptStatusHeader && (
            <UpdateReceiptStatusHeader
              selectedRowNumber={selectedRow.length}
              onClear={handleClearSelection}
              actions={[{ label: t("delete"), value: "delete" }]}
              handleAction={handleAction}
              selectedRows={selectedRow}
            />
          )}

          {showUpdateOrderStatusHeader && (
            <UpdateOrderStatusHeader
              selectedRowNumber={selectedRow.length}
              onClear={handleClearSelection}
              actions={[{ label: t("delete"), value: "delete" }]}
              handleAction={handleAction}
              selectedRows={selectedRow}
              onRefresh={handleFetchData}
            />
          )}
        </Suspense>
      )}
    </>
  );
};

export default React.memo(AdminHeader); 