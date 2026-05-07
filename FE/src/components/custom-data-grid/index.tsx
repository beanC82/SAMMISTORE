import * as React from 'react';
import { DataGrid, DataGridProps, GridColDef } from '@mui/x-data-grid';
import { styled } from '@mui/material';

interface CustomDataGridProps extends DataGridProps {
  gridHeight?: string;
}

const StyledDataGrid = styled(DataGrid, {
  shouldForwardProp: (prop) => prop !== 'gridHeight',
})<CustomDataGridProps>(({ theme, gridHeight }) => ({
  border: `1px solid ${theme.palette.customColors?.borderColor || theme.palette.divider}`,
  borderRadius: '8px',
  height: gridHeight || '61vh !important',
  overflow: 'auto',
  '& .MuiDataGrid-main': {
    position: 'relative',
    overflow: 'auto',
  },
  '& .MuiDataGrid-virtualScroller': {
    overflow: 'auto',
    overflowY: 'auto !important',
    // minHeight: '100%',
    '&::-webkit-scrollbar': {
      width: '8px',
      height: '8px',
    },
    '&::-webkit-scrollbar-track': {
      background: theme.palette.grey[100],
      borderRadius: '4px',
    },
    '&::-webkit-scrollbar-thumb': {
      background: theme.palette.grey[400],
      borderRadius: '4px',
      '&:hover': {
        background: theme.palette.grey[500],
      },
    },
  },
  '& .MuiDataGrid-toolbarContainer': {
    position: 'sticky',
    top: 0,
    zIndex: 2,
    backgroundColor: theme.palette.background.paper,
    borderBottom: `1px solid ${theme.palette.customColors?.borderColor || theme.palette.divider}`,
    minHeight: '56px',
  },
  '& .MuiDataGrid-columnHeaders': {
    position: 'sticky',
    top: 0,
    zIndex: 1,
    backgroundColor: theme.palette.background.paper,
  },
  '& .MuiDataGrid-footerContainer': {
    position: 'sticky',
    bottom: 0,
    backgroundColor: theme.palette.background.paper,
    borderTop: `1px solid ${theme.palette.customColors?.borderColor || theme.palette.divider}`,
  },
  '.MuiDataGrid-withBorderColor': {
    outline: 'none !important',
  },
  '.MuiDataGrid-selectedRowCount': {
    display: 'none',
  },
  '.MuiDataGrid-columnHeaderTitle': {
    textTransform: 'uppercase',
    color: theme.palette.primary.main,
  },
}));


const CustomDataGrid = React.forwardRef(
  (props: CustomDataGridProps, ref: React.Ref<any>) => {
    const { gridHeight, ...dataGridProps } = props;
    return <StyledDataGrid gridHeight={gridHeight} {...dataGridProps} ref={ref} />;
  }
);

CustomDataGrid.displayName = 'CustomDataGrid'

export default CustomDataGrid;