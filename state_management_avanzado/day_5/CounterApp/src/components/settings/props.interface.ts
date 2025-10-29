import { CacheInfo } from "src/types/cache-info.type";

export interface DataManagementSectionProps {
    isClearing: boolean;
    onRefresh: () => void;
    onClearAll: () => void;
    onClearCache: () => void;
}

export interface StorageInfoCardProps {
    storageInfo: CacheInfo;
}