import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { AppDispatch, RootState } from 'src/stores';

export const useAdminActions = (
  entityName: string,
  reduxSelector: (state: RootState) => any,
  deleteAction: (id: number) => any,
  deleteMultipleAction: (ids: { [key: number]: number[] }) => any,
  resetAction: () => any,
  onRefresh: () => void
) => {
  // State
  const [openCreateUpdate, setOpenCreateUpdate] = useState<{ open: boolean; id: number }>({ open: false, id: 0 });
  const [openDelete, setOpenDelete] = useState<{ open: boolean; id: number }>({ open: false, id: 0 });
  const [openDeleteMultiple, setOpenDeleteMultiple] = useState<{ open: boolean; ids: number[] }>({ open: false, ids: [] });
  const [selectedRow, setSelectedRow] = useState<number[]>([]);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [selectedDetailId, setSelectedDetailId] = useState<number>(0);

  // Hooks
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  
  // Selector data
  const {
    isSuccessCreateUpdate,
    isErrorCreateUpdate,
    errorMessageCreateUpdate,
    isSuccessDelete,
    isErrorDelete,
    errorMessageDelete,
    isSuccessDeleteMultiple,
    isErrorDeleteMultiple,
    errorMessageDeleteMultiple,
  } = useSelector(reduxSelector);

  // Dialog handlers
  const handleCloseCreateUpdate = useCallback(() => setOpenCreateUpdate({ open: false, id: 0 }), []);
  const handleCloseDeleteDialog = useCallback(() => setOpenDelete({ open: false, id: 0 }), []);
  const handleCloseDeleteMultipleDialog = useCallback(() => setOpenDeleteMultiple({ open: false, ids: [] }), []);

  // Action handlers
  const handleDelete = useCallback(() => {
    setIsDeleting(true);
    dispatch(deleteAction(openDelete.id));
  }, [dispatch, deleteAction, openDelete.id]);

  const handleDeleteMultiple = useCallback(() => {
    setIsDeleting(true);
    dispatch(deleteMultipleAction({ [openDelete.id]: selectedRow }));
  }, [dispatch, deleteMultipleAction, selectedRow, openDelete.id]);

  const handleAction = useCallback((action: string) => {
    if (action === "delete") {
      setOpenDeleteMultiple({ open: true, ids: selectedRow });
    }
  }, [selectedRow]);

  // Handle create/update success/error
  useEffect(() => {
    if (isSuccessCreateUpdate) {
      if (openCreateUpdate.id) {
        toast.success(t(`update_${entityName}_success`));
      } else {
        toast.success(t(`create_${entityName}_success`));
      }
      
      // Use a slight delay to avoid potential infinite loops
      const timeoutId = setTimeout(() => {
        onRefresh();
        handleCloseCreateUpdate();
        dispatch(resetAction());
      }, 0);
      
      return () => clearTimeout(timeoutId);
    } else if (isErrorCreateUpdate && errorMessageCreateUpdate) {
      toast.error(errorMessageCreateUpdate);
      dispatch(resetAction());
    }
  }, [isSuccessCreateUpdate, isErrorCreateUpdate, errorMessageCreateUpdate, entityName, t, openCreateUpdate.id, handleCloseCreateUpdate, dispatch, resetAction, onRefresh]);

  // Handle delete multiple success/error
  useEffect(() => {
    if (isSuccessDeleteMultiple) {
      toast.success(t(`delete_multiple_${entityName}s_success`));
      
      const timeoutId = setTimeout(() => {
        onRefresh();
        dispatch(resetAction());
        handleCloseDeleteMultipleDialog();
        setSelectedRow([]);
        setIsDeleting(false);
      }, 0);
      
      return () => clearTimeout(timeoutId);
    } else if (isErrorDeleteMultiple && errorMessageDeleteMultiple) {
      toast.error(t(`delete_multiple_${entityName}s_error`));
      dispatch(resetAction());
      setIsDeleting(false);
    }
  }, [isSuccessDeleteMultiple, isErrorDeleteMultiple, errorMessageDeleteMultiple, entityName, t, onRefresh, dispatch, resetAction, handleCloseDeleteMultipleDialog]);

  // Handle delete success/error
  useEffect(() => {
    if (isSuccessDelete) {
      toast.success(t(`delete_${entityName}_success`));
      
      const timeoutId = setTimeout(() => {
        onRefresh();
        dispatch(resetAction());
        handleCloseDeleteDialog();
        setIsDeleting(false);
      }, 0);
      
      return () => clearTimeout(timeoutId);
    } else if (isErrorDelete && errorMessageDelete) {
      toast.error(errorMessageDelete);
      dispatch(resetAction());
      setIsDeleting(false);
    }
  }, [isSuccessDelete, isErrorDelete, errorMessageDelete, entityName, t, onRefresh, dispatch, resetAction, handleCloseDeleteDialog]);

  return {
    // State
    openCreateUpdate,
    openDelete,
    openDeleteMultiple,
    selectedRow,
    isDeleting,
    selectedDetailId,
    
    // Setters
    setOpenCreateUpdate,
    setOpenDelete,
    setOpenDeleteMultiple,
    setSelectedRow,
    setSelectedDetailId,
    
    // Handlers
    handleCloseCreateUpdate,
    handleCloseDeleteDialog,
    handleCloseDeleteMultipleDialog,
    handleDelete,
    handleDeleteMultiple,
    handleAction,
  };
};

export default useAdminActions; 