import { Avatar, Box, IconButton, Rating, Tooltip, Typography, ImageList, ImageListItem, Divider } from "@mui/material";
import { Card, styled } from "@mui/material";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import IconifyIcon from "src/components/Icon";
import { useAuth } from "src/hooks/useAuth";
import { TReviewItem } from "src/types/review";
import { getTimePast } from "src/utils/date";
import UpdateReview from "./UpdateReview";
import ConfirmDialog from "src/components/confirm-dialog";
import { deleteMyReviewAsync } from "src/stores/review/action";
import { AppDispatch, RootState } from "src/stores";
import { useDispatch, useSelector } from "react-redux";
import Image from "src/components/image";
import { formatDate } from "src/utils";

interface TReviewCard {
    item: TReviewItem;
    onReviewUpdated?: () => void;
}

const StyledCard = styled(Card)(({ theme }) => ({
    position: "relative",
    boxShadow: 'none',
    padding: theme.spacing(3),
    borderRadius: 0,
    backgroundColor: theme.palette.background.paper,
    borderBottom: `1px solid ${theme.palette.divider}`,
    '&:last-child': {
        borderBottom: 'none'
    },
    ".MuiCardMedia-root.MuiCardMedia-media": {
        objectFit: "contain"
    }
}));

const ReviewCard = (props: TReviewCard) => {
    const { item, onReviewUpdated } = props;
    const [openUpdateReview, setOpenUpdateReview] = useState({
        open: false,
        id: 0
    });

    const [openDeleteReview, setOpenDeleteReview] = useState({
        open: false,
        id: 0
    });

    const { i18n, t } = useTranslation();
    const { user } = useAuth();
    const dispatch: AppDispatch = useDispatch();
    const { isSuccessUpdate, isErrorUpdate, isSuccessDelete, isErrorDelete } = useSelector((state: RootState) => state.review);

    const handleCloseUpdateReview = () => {
        setOpenUpdateReview({
            open: false,
            id: 0
        });
    };

    const handleCloseDeleteDialog = () => {
        setOpenDeleteReview({
            open: false,
            id: 0
        });
    };

    const handleDeleteReview = () => {
        dispatch(deleteMyReviewAsync(openDeleteReview.id));
    };

    useEffect(() => {
        if (isSuccessUpdate || isSuccessDelete) {
            handleCloseUpdateReview();
            handleCloseDeleteDialog();
            if (onReviewUpdated) {
                onReviewUpdated();
            }
        }
    }, [isSuccessUpdate, isSuccessDelete, onReviewUpdated]);

    return (
        <>
            <UpdateReview
                idReview={openUpdateReview.id}
                open={openUpdateReview.open}
                onClose={handleCloseUpdateReview}
            />
            <ConfirmDialog
                open={openDeleteReview.open}
                onClose={handleCloseDeleteDialog}
                handleCancel={handleCloseDeleteDialog}
                handleConfirm={handleDeleteReview}
                title={t("confirm_delete_review")}
                description={t("confirm_delete_review_description")}
            />
            <StyledCard>
                <Box sx={{ display: "flex", gap: 2, width: '100%' }}>
                    <Avatar 
                        src={item.customerImage} 
                        alt={item.customerName}
                        sx={{ width: 40, height: 40 }}
                    />
                    <Box sx={{ flex: 1 }}>
                        <Box sx={{ 
                            display: "flex",
                            flexDirection: "column",
                        }}>
                            <Box>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                                    {item.customerName}
                                </Typography>
                                <Rating 
                                    value={item.rating} 
                                    readOnly 
                                    size="small"
                                    sx={{ color: theme => theme.palette.primary.main }}
                                />
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                                {formatDate(item.createdDate, { dateStyle: "medium", timeStyle: "short" })}
                            </Typography>
                        </Box>
                        <Typography sx={{ mt: 2, color: 'text.primary' }}>
                            {item.comment}
                        </Typography>
                        {item.imageUrl && (
                            <Box sx={{ mt: 2 }}>
                                <Image
                                    src={item.imageUrl}
                                    alt="Review image"
                                    sx={{
                                        width: '100%',
                                        maxWidth: 200,
                                        maxHeight: 200,
                                        borderRadius: 1,
                                        cursor: 'pointer',
                                        objectFit: 'cover'
                                    }}
                                />
                            </Box>
                        )}
                        {user?.id === item.userId && (
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 2 }}>
                                <Tooltip title={t("edit")}>
                                    <IconButton 
                                        size="small"
                                        onClick={() => setOpenUpdateReview({ open: true, id: item.id })}
                                    >
                                        <IconifyIcon icon="tabler:edit" fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title={t("delete")}>
                                    <IconButton 
                                        size="small"
                                        onClick={() => setOpenDeleteReview({ open: true, id: item.id })}
                                    >
                                        <IconifyIcon icon="mdi:delete-outline" fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                        )}
                    </Box>
                </Box>
            </StyledCard>
        </>
    );
};

export default ReviewCard;