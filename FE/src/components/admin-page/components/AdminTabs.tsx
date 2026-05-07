import React from 'react';
import { Box, Tabs, Tab, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

// Component for tab labels with close button
const TabLabel: React.FC<{
  label: string;
  onClose?: () => void;
  onTabChange?: (val: number) => void;
  tabValue: number;
}> = React.memo(({ label, onClose, onTabChange, tabValue }) => (
  <Box sx={{ display: 'flex', alignItems: 'center' }}>
    {label} 
      <IconButton
        size="small"
        onClick={(e) => {
          e.stopPropagation();
          onTabChange?.(0);
          onClose?.();
        }}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
  </Box>
));

interface AdminTabsProps {
  currentTab: number;
  onTabChange?: (newValue: number) => void;
  entityName: string;
  newEntityName: string;
  showCreateTab: boolean;
  showUpdateTab: boolean;
  showDetailTab: boolean;
  showCreateNewTab: boolean;
  onCloseCreateTab?: () => void;
  onCloseUpdateTab?: () => void;
  onCloseDetailTab?: () => void;
  onCloseCreateNewTab?: () => void;
  t: (key: string) => string;
}

const AdminTabs: React.FC<AdminTabsProps> = ({
  currentTab,
  onTabChange,
  entityName,
  newEntityName,
  showCreateTab,
  showUpdateTab,
  showDetailTab,
  showCreateNewTab,
  onCloseCreateTab,
  onCloseUpdateTab,
  onCloseDetailTab,
  onCloseCreateNewTab,
  t
}) => {
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    onTabChange?.(newValue);
  };

  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
      <Tabs value={currentTab} onChange={handleTabChange}>
        <Tab value={0} label={t(`list_${entityName}`)} />
        
        {showCreateTab && (
          <Tab
            value={1}
            label={
              <TabLabel
                label={t(`create_${entityName}`)}
                onClose={onCloseCreateTab}
                onTabChange={onTabChange}
                tabValue={0}
              />
            }
          />
        )}
        
        {showUpdateTab && (
          <Tab
            value={2}
            label={
              <TabLabel
                label={t(`update_${entityName}`)}
                onClose={onCloseUpdateTab}
                onTabChange={onTabChange}
                tabValue={0}
              />
            }
          />
        )}
        
        {showDetailTab && (
          <Tab
            value={3}
            label={
              <TabLabel
                label={t(`${entityName}_detail`)}
                onClose={onCloseDetailTab}
                onTabChange={onTabChange}
                tabValue={0}
              />
            }
          />
        )}
        
        {showCreateNewTab && (
          <Tab
            value={4}
            label={
              <TabLabel
                label={t(`create_new_${newEntityName}`)}
                onClose={onCloseCreateNewTab}
                onTabChange={onTabChange}
                tabValue={0}
              />
            }
          />
        )}
      </Tabs>
    </Box>
  );
};

export default React.memo(AdminTabs); 