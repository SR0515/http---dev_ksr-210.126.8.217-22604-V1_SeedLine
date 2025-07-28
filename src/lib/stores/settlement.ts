// 정산 관련 스토어 (성능 최적화를 위한 상태 관리)

import { writable, derived, type Readable } from 'svelte/store';
import type { 
    SettlementSearchData, 
    SettlementTableData, 
    PaginationData,
    SettlementFilter,
    SettlementStats,
    ToastMessage
} from '$lib/types/settlement';

// 검색 조건 스토어
export const searchParams = writable<SettlementSearchData>({
    startDate: '',
    endDate: '',
    searchSelect: '',
    searchText: '',
    pageSize: 10
});

// 테이블 데이터 스토어
export const tableData = writable<SettlementTableData[]>([]);

// 페이지네이션 스토어
export const paginationData = writable<PaginationData>({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    pageSize: 10
});

// 로딩 상태 스토어
export const isLoading = writable<boolean>(false);

// 필터 상태 스토어
export const filterState = writable<SettlementFilter>({
    dateRange: {
        startDate: '',
        endDate: ''
    },
    pageSize: 10
});

// 정산 통계 스토어
export const settlementStats = writable<SettlementStats>({
    totalAmount: '0',
    totalCount: 0,
    completedCount: 0,
    pendingCount: 0,
    holdCount: 0
});

// 토스트 메시지 스토어
export const toastMessage = writable<ToastMessage>({
    message: '',
    type: 'info',
    visible: false
});

// 선택된 아이템 스토어 (체크박스 선택)
export const selectedItems = writable<Set<string>>(new Set());

// 정렬 상태 스토어
export const sortState = writable<{
    field: string;
    direction: 'asc' | 'desc';
}>({
    field: '',
    direction: 'asc'
});

// 캐시 스토어 (검색 결과 캐싱)
export const searchCache = writable<Map<string, any>>(new Map());

// 파생 스토어들 (computed values)

// 필터링된 데이터
export const filteredData: Readable<SettlementTableData[]> = derived(
    [tableData, filterState, sortState],
    ([$tableData, $filterState, $sortState]) => {
        let filtered = [...$tableData];

        // 날짜 필터링
        if ($filterState.dateRange.startDate && $filterState.dateRange.endDate) {
            filtered = filtered.filter(item => {
                const itemDate = new Date(item.date);
                const startDate = new Date($filterState.dateRange.startDate);
                const endDate = new Date($filterState.dateRange.endDate);
                return itemDate >= startDate && itemDate <= endDate;
            });
        }

        // 정렬
        if ($sortState.field) {
            filtered.sort((a, b) => {
                const aValue = a[$sortState.field];
                const bValue = b[$sortState.field];
                
                if (aValue < bValue) return $sortState.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return $sortState.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return filtered;
    }
);

// 페이지네이션 정보
export const paginationInfo: Readable<{
    hasNextPage: boolean;
    hasPrevPage: boolean;
    totalPages: number;
    currentPage: number;
}> = derived(
    [paginationData],
    ([$paginationData]) => ({
        hasNextPage: $paginationData.currentPage < $paginationData.totalPages,
        hasPrevPage: $paginationData.currentPage > 1,
        totalPages: $paginationData.totalPages,
        currentPage: $paginationData.currentPage
    })
);

// 선택된 아이템 정보
export const selectedItemsInfo: Readable<{
    count: number;
    items: string[];
    isAllSelected: boolean;
}> = derived(
    [selectedItems, tableData],
    ([$selectedItems, $tableData]) => ({
        count: $selectedItems.size,
        items: Array.from($selectedItems),
        isAllSelected: $tableData.length > 0 && $selectedItems.size === $tableData.length
    })
);

// 액션 함수들

// 검색 파라미터 업데이트
export const updateSearchParams = (params: Partial<SettlementSearchData>) => {
    searchParams.update(current => ({ ...current, ...params }));
};

// 테이블 데이터 설정
export const setTableData = (data: SettlementTableData[]) => {
    tableData.set(data);
};

// 페이지네이션 업데이트
export const updatePagination = (pagination: Partial<PaginationData>) => {
    paginationData.update(current => ({ ...current, ...pagination }));
};

// 로딩 상태 설정
export const setLoading = (loading: boolean) => {
    isLoading.set(loading);
};

// 토스트 메시지 표시
export const showToast = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    toastMessage.set({ message, type, visible: true });
    
    // 1.5초 후 자동 숨김
    setTimeout(() => {
        toastMessage.update(current => ({ ...current, visible: false }));
    }, 1500);
};

// 아이템 선택/해제
export const toggleItemSelection = (itemId: string) => {
    selectedItems.update(current => {
        const newSet = new Set(current);
        if (newSet.has(itemId)) {
            newSet.delete(itemId);
        } else {
            newSet.add(itemId);
        }
        return newSet;
    });
};

// 전체 선택/해제
export const toggleAllSelection = (itemIds: string[]) => {
    selectedItems.update(current => {
        const allSelected = itemIds.every(id => current.has(id));
        if (allSelected) {
            return new Set(); // 전체 해제
        } else {
            return new Set(itemIds); // 전체 선택
        }
    });
};

// 정렬 상태 업데이트
export const updateSortState = (field: string) => {
    sortState.update(current => {
        if (current.field === field) {
            return {
                field,
                direction: current.direction === 'asc' ? 'desc' : 'asc'
            };
        } else {
            return { field, direction: 'asc' };
        }
    });
};

// 캐시 키 생성
export const generateCacheKey = (params: any): string => {
    return JSON.stringify(params);
};

// 캐시에서 데이터 가져오기
export const getCachedData = (key: string): any => {
    let cached = null;
    searchCache.subscribe(cache => {
        cached = cache.get(key);
    })();
    return cached;
};

// 캐시에 데이터 저장
export const setCachedData = (key: string, data: any) => {
    searchCache.update(cache => {
        const newCache = new Map(cache);
        newCache.set(key, data);
        
        // 캐시 크기 제한 (최대 50개)
        if (newCache.size > 50) {
            const firstKey = newCache.keys().next().value;
            newCache.delete(firstKey);
        }
        
        return newCache;
    });
};

// 캐시 초기화
export const clearCache = () => {
    searchCache.set(new Map());
};

// 상태 초기화
export const resetSettlementState = () => {
    searchParams.set({
        startDate: '',
        endDate: '',
        searchSelect: '',
        searchText: '',
        pageSize: 10
    });
    
    tableData.set([]);
    
    paginationData.set({
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
        pageSize: 10
    });
    
    isLoading.set(false);
    selectedItems.set(new Set());
    sortState.set({ field: '', direction: 'asc' });
    
    toastMessage.set({
        message: '',
        type: 'info',
        visible: false
    });
};

// 통계 업데이트
export const updateStats = (stats: Partial<SettlementStats>) => {
    settlementStats.update(current => ({ ...current, ...stats }));
};

// 디바운스된 검색 함수
let searchTimeout: NodeJS.Timeout;

export const debouncedSearch = (
    searchFn: (params: SettlementSearchData) => Promise<void>,
    delay: number = 300
) => {
    return (params: SettlementSearchData) => {
        clearTimeout(searchTimeout);
        
        searchTimeout = setTimeout(async () => {
            setLoading(true);
            try {
                await searchFn(params);
            } finally {
                setLoading(false);
            }
        }, delay);
    };
};

// 무한 스크롤을 위한 헬퍼
export const createInfiniteScroll = (
    loadMoreFn: (page: number) => Promise<SettlementTableData[]>
) => {
    let isLoadingMore = false;
    
    return {
        async loadMore() {
            if (isLoadingMore) return;
            
            isLoadingMore = true;
            
            try {
                const currentPagination = getCachedData('pagination') || { currentPage: 1 };
                const nextPage = currentPagination.currentPage + 1;
                
                const moreData = await loadMoreFn(nextPage);
                
                if (moreData.length > 0) {
                    tableData.update(current => [...current, ...moreData]);
                    updatePagination({ currentPage: nextPage });
                }
            } finally {
                isLoadingMore = false;
            }
        },
        
        get isLoadingMore() {
            return isLoadingMore;
        }
    };
};

// 성능 모니터링을 위한 메트릭스
export const performanceMetrics = writable<{
    searchTime: number;
    renderTime: number;
    totalItems: number;
    lastUpdate: Date;
}>({
    searchTime: 0,
    renderTime: 0,
    totalItems: 0,
    lastUpdate: new Date()
});

// 성능 메트릭스 업데이트
export const updatePerformanceMetrics = (metrics: Partial<{
    searchTime: number;
    renderTime: number;
    totalItems: number;
}>) => {
    performanceMetrics.update(current => ({
        ...current,
        ...metrics,
        lastUpdate: new Date()
    }));
};