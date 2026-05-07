import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';

// Dynamic imports
const ConfirmDialog = dynamic(() => import("src/components/confirm-dialog"), { ssr: false });
const Spinner = dynamic(() => import("src/components/spinner"), { ssr: false });

interface AdminDialogsProps {
  entityName: string;
  openDelete: { open: boolean; id: number };
  openDeleteMultiple: { open: boolean; ids: number[] };
  handleCloseDeleteDialog: () => void;
  handleCloseDeleteMultipleDialog: () => void;
  handleDelete: () => void;
  handleDeleteMultiple: () => void;
  isLoading: boolean;
  isDeleting: boolean;
  CreateUpdateComponent?: React.ComponentType<any>;
  openCreateUpdate: { open: boolean; id: number };
  handleCloseCreateUpdate: () => void;
  t: (key: string) => string;
}

const AdminDialogs: React.FC<AdminDialogsProps> = ({
  entityName,
  openDelete,
  openDeleteMultiple,
  handleCloseDeleteDialog,
  handleCloseDeleteMultipleDialog,
  handleDelete,
  handleDeleteMultiple,
  isLoading,
  isDeleting,
  CreateUpdateComponent,
  openCreateUpdate,
  handleCloseCreateUpdate,
  t
}) => {
  return (
    <>
      {/* Loading Spinner */}
      {(isLoading || isDeleting) && (
        <Suspense fallback={null}>
          <Spinner />
        </Suspense>
      )}
      
      {/* Delete Single Confirmation Dialog */}
      <Suspense fallback={null}>
        <ConfirmDialog
          open={openDelete.open}
          onClose={handleCloseDeleteDialog}
          handleCancel={handleCloseDeleteDialog}
          handleConfirm={handleDelete}
          title={t(`confirm_delete_${entityName}`)}
          description={t(`are_you_sure_delete_${entityName}`)}
        />
      </Suspense>
      
      {/* Delete Multiple Confirmation Dialog */}
      <Suspense fallback={null}>
        <ConfirmDialog
          open={openDeleteMultiple.open}
          onClose={handleCloseDeleteMultipleDialog}
          handleCancel={handleCloseDeleteMultipleDialog}
          handleConfirm={handleDeleteMultiple}
          title={t(`confirm_delete_multiple_${entityName}s`)}
          description={t(`are_you_sure_delete_multiple_${entityName}s`)}
        />
      </Suspense>

      {/* Create/Update Dialog */}
      {CreateUpdateComponent && (
        <Suspense fallback={null}>
          <CreateUpdateComponent
            id={openCreateUpdate.id}
            open={openCreateUpdate.open}
            onClose={handleCloseCreateUpdate}
          />
        </Suspense>
      )}
    </>
  );
};

export default React.memo(AdminDialogs); 