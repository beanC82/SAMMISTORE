import React from 'react';

interface TabContentsProps {
  currentTab: number;
  CreateUpdateTabComponent?: React.ComponentType<any>;
  DetailComponent?: React.ComponentType<any>;
  CreateNewTabComponent?: React.ComponentType<any>;
  onTabChange?: (newValue: number) => void;
  onCloseCreateTab?: () => void;
  onCloseUpdateTab?: () => void;
  onCloseDetailTab?: () => void;
  onCloseCreateNewTab?: () => void;
  onCreateNewClick?: () => void;
  openCreateUpdate: { open: boolean; id: number };
  selectedDetailId: number;
  handleFetchData: () => void;
}

const TabContents: React.FC<TabContentsProps> = ({
  currentTab,
  CreateUpdateTabComponent,
  DetailComponent,
  CreateNewTabComponent,
  onTabChange,
  onCloseCreateTab,
  onCloseUpdateTab,
  onCloseDetailTab,
  onCloseCreateNewTab,
  onCreateNewClick,
  openCreateUpdate,
  selectedDetailId,
  handleFetchData
}) => {
  // Create tab
  if (currentTab === 1 && CreateUpdateTabComponent) {
    return (
      <CreateUpdateTabComponent
        id={0}
        open={true}
        onClose={() => {
          onTabChange?.(0);
          onCloseCreateTab?.();
        }}
        onCreateNew={() => {
          onTabChange?.(4);
          onCreateNewClick?.();
        }}
      />
    );
  }
  
  // Update tab
  if (currentTab === 2 && CreateUpdateTabComponent) {
    return (
      <CreateUpdateTabComponent
        id={openCreateUpdate.id}
        open={true}
        onClose={() => {
          onTabChange?.(0);
          onCloseUpdateTab?.();
        }}
      />
    );
  }
  
  // Detail tab
  if (currentTab === 3 && DetailComponent) {
    return (
      <DetailComponent
        id={selectedDetailId}
        onClose={() => {
          onTabChange?.(0);
          onCloseDetailTab?.();
        }}
        onRefresh={handleFetchData}
      />
    );
  }
  
  // Create new tab
  if (currentTab === 4 && CreateNewTabComponent) {
    return (
      <CreateNewTabComponent
        id={0}
        onClose={() => {
          onTabChange?.(1);
          onCloseCreateNewTab?.();
        }}
      />
    );
  }
  
  return null;
};

export default React.memo(TabContents); 