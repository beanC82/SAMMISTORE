"use client";

import React, { useEffect, useMemo } from "react";
import { NextPage } from "next";
import { Box, Grid, useTheme } from "@mui/material";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";

import { RootState } from "src/stores";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/router";
import { hexToRGBA } from "src/utils/hex-to-rgba";
import { usePermission } from "src/hooks/usePermission";
import dynamic from 'next/dynamic';

// Dynamic imports for Suspense
const CustomPagination = dynamic(() => import("src/components/custom-pagination"), { ssr: false });
const GridDetail = dynamic(() => import("../grid-detail"), { ssr: false });
const GridUpdate = dynamic(() => import("src/components/grid-update"), { ssr: false });
const GridDelete = dynamic(() => import("src/components/grid-delete"), { ssr: false });

// Custom hooks
import useAdminData from './hooks/useAdminData';
import useAdminActions from './hooks/useAdminActions';

// Modular components
const AdminTabs = dynamic(() => import('./components/AdminTabs'), { ssr: false });
const AdminHeader = dynamic(() => import('./components/AdminHeader'), { ssr: false });
const AdminDataGrid = dynamic(() => import('./components/AdminDataGrid'), { ssr: false });
const AdminDialogs = dynamic(() => import('./components/AdminDialogs'), { ssr: false });
const TabContents = dynamic(() => import('./components/TabContents'), { ssr: false });

type AdminPageProps = {
  entityName: string;
  columns: GridColDef[];
  fields: any[];
  reduxSelector: (state: RootState) => any;
  fetchAction: (query: any) => any;
  deleteAction: (id: number) => any;
  deleteMultipleAction: (ids: { [key: number]: number[] }) => any;
  resetAction: () => any;
  CreateUpdateComponent?: React.FC<any>;
  CreateUpdateTabComponent?: React.FC<any>;
  permissionKey: string;
  fieldMapping?: { [key: string]: string };
  noDataText?: string;
  DetailComponent?: React.FC<any>;
  CreateNewTabComponent?: React.FC<any>;

  showTab?: boolean;
  showCreateTab?: boolean;
  showUpdateTab?: boolean;
  showDetailTab?: boolean;
  showCreateNewTab?: boolean;

  currentTab?: number;
  onTabChange?: (newTab: number) => void;
  onAddClick?: () => void;
  onUpdateClick?: () => void;
  onDetailClick?: (id: number) => void;
  onCreateNewClick?: () => void;

  hideAddButton?: boolean;
  hideUpdateButton?: boolean;
  hideDeleteButton?: boolean;

  showDetailButton?: boolean;
  onCloseCreateTab?: () => void;
  onCloseUpdateTab?: () => void;
  onCloseDetailTab?: () => void;
  onCloseCreateNewTab?: () => void;

  hideTableHeader?: boolean;
  showUpdateReceiptStatusHeader?: boolean;
  showUpdateOrderStatusHeader?: boolean;

  showOrderFilter?: boolean;
};

const AdminPage: NextPage<AdminPageProps> = ({
  entityName,
  columns,
  fields,
  reduxSelector,
  fetchAction,
  deleteAction,
  deleteMultipleAction,
  resetAction,
  CreateUpdateComponent,
  CreateUpdateTabComponent,
  DetailComponent,
  CreateNewTabComponent,
  permissionKey,
  fieldMapping = {},
  noDataText,

  showTab = false,
  showCreateTab = false,
  showUpdateTab = false,
  showDetailTab = false,
  showCreateNewTab = false,

  currentTab = 0,
  onTabChange,
  onAddClick,
  onUpdateClick,
  onDetailClick,
  onCreateNewClick,

  hideAddButton = false,
  hideUpdateButton = false,
  hideDeleteButton = false,
  showDetailButton = false,

  onCloseCreateTab,
  onCloseUpdateTab,
  onCloseDetailTab,
  onCloseCreateNewTab,

  hideTableHeader = false,
  showUpdateReceiptStatusHeader = false,
  showUpdateOrderStatusHeader = false,

  showOrderFilter = false,
}) => {
  // Hooks
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const [newEntityName, setNewEntityName] = React.useState<string>("");

  useEffect(() => {
    if (router.pathname.includes("receipt")) {
      setNewEntityName("product");
    } else if(router.pathname.includes("manage-order")){
      setNewEntityName("customer");
    }
  }, [router.pathname]);

  // Permissions
  const { VIEW, CREATE, UPDATE, DELETE } = usePermission(permissionKey, ["CREATE", "UPDATE", "DELETE", "VIEW"]);

  // Setup hooks for data and actions
  const {
    page,
    pageSize,
    sortBy,
    filters,
    data,
    total,
    isLoading,
    handleFetchData,
    handleOnChangePagination,
    handleSort,
    handleFilterChange,
  } = useAdminData(fetchAction, reduxSelector, fieldMapping);

  const {
    openCreateUpdate,
    openDelete,
    openDeleteMultiple,
    selectedRow,
    isDeleting,
    selectedDetailId,
    setOpenCreateUpdate,
    setOpenDelete,
    setOpenDeleteMultiple,
    setSelectedRow,
    setSelectedDetailId,
    handleCloseCreateUpdate,
    handleCloseDeleteDialog,
    handleCloseDeleteMultipleDialog,
    handleDelete,
    handleDeleteMultiple,
    handleAction,
  } = useAdminActions(entityName, reduxSelector, deleteAction, deleteMultipleAction, resetAction, handleFetchData);

  // Memoize columns with actions
  const actionColumn = useMemo(() => ({
    field: "action",
    headerName: t("action"),
    width: 150,
    sortable: false,
    align: "left",
    renderCell: (params: GridRenderCellParams) => (

      <>
        {showDetailButton && (
          <GridDetail
            onClick={() => {
              setSelectedDetailId(params.row.id);
              onDetailClick?.(params.row.id);
            }}
          />
        )}

        {!hideUpdateButton && (
          <GridUpdate
            onClick={() =>{
              if (onUpdateClick) {
                onUpdateClick();
                setOpenCreateUpdate({ open: true, id: params.row.id });
              } else {
                setOpenCreateUpdate({ open: true, id: params.row.id });
              }
            }}
          />
        )
        }
        {!hideDeleteButton && (
          <GridDelete
            onClick={() => setOpenDelete({ open: true, id: params.row.id })}
          />
        )
        }
      </>
    ),
  }), [showDetailButton, hideUpdateButton, hideDeleteButton, t, onDetailClick, setOpenCreateUpdate, setOpenDelete, setSelectedDetailId]);

  const allColumns = useMemo(() => [actionColumn, ...columns], [actionColumn, columns]);

  // Memoize PaginationComponent
  const PaginationComponent = useMemo(() => (
    <CustomPagination
      pageSize={pageSize}
      pageSizeOptions={[10, 25, 50, 100]}
      onChangePagination={handleOnChangePagination}
      page={page}
      rowLength={total}
    />
  ), [pageSize, page, total, handleOnChangePagination]);

  // Memoize DataGrid styles
  const dataGridStyles = useMemo(() => ({
    ".selected-row": {
      backgroundColor: `${hexToRGBA(theme.palette.primary.main, 0.08)} !important`,
      color: `${theme.palette.primary.main} !important`,
    },
    "& .MuiDataGrid-root": { border: `1px solid ${theme.palette.divider}` },
    "& .MuiDataGrid-columnHeaders": {
      backgroundColor: theme.palette.grey[100],
      borderBottom: `1px solid ${theme.palette.divider}`,
      position: 'sticky',
      top: 0,
      zIndex: 1,
    },
    "& .MuiDataGrid-row:hover": { backgroundColor: theme.palette.action.hover },
    "& .MuiDataGrid-row.Mui-selected": {
      backgroundColor: `${hexToRGBA(theme.palette.primary.main, 0.08)} !important`,
      color: `${theme.palette.primary.main} !important`,
    },
    "& .MuiDataGrid-cell": { borderBottom: `1px solid ${theme.palette.divider}` },
  }), [theme]);

  return (
    <>
      {/* Dialogs */}
      <AdminDialogs
        entityName={entityName}
        openDelete={openDelete}
        openDeleteMultiple={openDeleteMultiple}
        handleCloseDeleteDialog={handleCloseDeleteDialog}
        handleCloseDeleteMultipleDialog={handleCloseDeleteMultipleDialog}
        handleDelete={handleDelete}
        handleDeleteMultiple={handleDeleteMultiple}
        isLoading={isLoading}
        isDeleting={isDeleting}
        CreateUpdateComponent={CreateUpdateComponent}
        openCreateUpdate={openCreateUpdate}
        handleCloseCreateUpdate={handleCloseCreateUpdate}
        t={t}
      />

      <Box sx={{ backgroundColor: theme.palette.background.paper, padding: "20px", height: '82vh', overflow: "auto", borderRadius: "15px" }}>
        {/* Tabs */}
        {showTab && (
          <AdminTabs
            currentTab={currentTab}
            onTabChange={onTabChange}
            entityName={entityName}
            newEntityName={newEntityName}
            showCreateTab={showCreateTab}
            showUpdateTab={showUpdateTab}
            showDetailTab={showDetailTab}
            showCreateNewTab={showCreateNewTab}
            onCloseCreateTab={onCloseCreateTab}
            onCloseUpdateTab={onCloseUpdateTab}
            onCloseDetailTab={onCloseDetailTab}
            onCloseCreateNewTab={onCloseCreateNewTab}
            t={t}
          />
        )}

        <Grid container>
          {currentTab === 0 ? (
            <>
              {/* Header & Action Buttons */}
              <AdminHeader
                entityName={entityName}
                selectedRow={selectedRow}
                setSelectedRow={setSelectedRow}
                handleAction={handleAction}
                onAddClick={onAddClick}
                setOpenCreateUpdate={setOpenCreateUpdate}
                hideAddButton={hideAddButton}
                hideTableHeader={hideTableHeader}
                showOrderFilter={showOrderFilter}
                showUpdateReceiptStatusHeader={showUpdateReceiptStatusHeader}
                showUpdateOrderStatusHeader={showUpdateOrderStatusHeader}
                handleFilterChange={handleFilterChange}
                handleFetchData={handleFetchData}
                t={t}
              />

              {/* Data Grid */}
              <Box width="100%">
                <AdminDataGrid
                  data={data}
                  columns={allColumns as GridColDef[]}
                  PaginationComponent={PaginationComponent}
                  handleSort={handleSort}
                  selectedRow={selectedRow}
                  setSelectedRow={setSelectedRow}
                  fields={fields}
                  handleFilterChange={handleFilterChange}
                  noDataText={noDataText || `no_data_${entityName}`}
                  dataGridStyles={dataGridStyles}
                  t={t}
                />
              </Box>
            </>
          ) : (
            <TabContents
              currentTab={currentTab}
              CreateUpdateTabComponent={CreateUpdateTabComponent}
              DetailComponent={DetailComponent}
              CreateNewTabComponent={CreateNewTabComponent}
              onTabChange={onTabChange}
              onCloseCreateTab={onCloseCreateTab}
              onCloseUpdateTab={onCloseUpdateTab}
              onCloseDetailTab={onCloseDetailTab}
              onCloseCreateNewTab={onCloseCreateNewTab}
              onCreateNewClick={onCreateNewClick}
              openCreateUpdate={openCreateUpdate}
              selectedDetailId={selectedDetailId}
              handleFetchData={handleFetchData}
            />
          )}
        </Grid>
      </Box>
    </>
  );
};

export default React.memo(AdminPage);