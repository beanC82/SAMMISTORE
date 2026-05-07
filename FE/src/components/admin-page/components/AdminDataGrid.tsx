import React from 'react';
import { Box } from '@mui/material';
import { GridColDef, GridRowSelectionModel, GridSortModel } from '@mui/x-data-grid';
import dynamic from 'next/dynamic';
import { TFilter } from 'src/configs/filter';

// Dynamic imports
const CustomDataGrid = dynamic(() => import("src/components/custom-data-grid"), { ssr: false });
const AdminFilter = dynamic(() => import("src/components/admin-filter"), { ssr: false });

interface AdminDataGridProps {
  data: any[];
  columns: GridColDef[];
  PaginationComponent: React.ReactNode;
  handleSort: (model: GridSortModel) => void;
  selectedRow: number[];
  setSelectedRow: (rows: number[]) => void;
  fields: any[];
  handleFilterChange: (filters: TFilter[]) => void;
  noDataText: string;
  dataGridStyles: any;
  t: (key: string) => string;
}

const AdminDataGrid: React.FC<AdminDataGridProps> = ({
  data,
  columns,
  PaginationComponent,
  handleSort,
  selectedRow,
  setSelectedRow,
  fields,
  handleFilterChange,
  noDataText,
  dataGridStyles,
  t
}) => {
  return (
    <CustomDataGrid
      rows={data || []}
      columns={columns as GridColDef[]}
      checkboxSelection
      getRowId={(row) => row.id}
      disableRowSelectionOnClick
      autoHeight
      sortingOrder={["desc", "asc"]}
      sortingMode="server"
      onSortModelChange={handleSort}
      slots={{
        pagination: () => PaginationComponent,
        toolbar: AdminFilter,
        noRowsOverlay: () => <Box sx={{ p: 2, textAlign: "center" }}>{t(noDataText || 'no_data')}</Box>,
      }}
      slotProps={{ toolbar: { fields, onFilterChange: handleFilterChange } }}
      disableColumnFilter
      disableColumnMenu
      sx={dataGridStyles}
      onRowSelectionModelChange={(row: GridRowSelectionModel) => setSelectedRow(row as number[])}
      rowSelectionModel={selectedRow}
    />
  );
};

export default React.memo(AdminDataGrid); 