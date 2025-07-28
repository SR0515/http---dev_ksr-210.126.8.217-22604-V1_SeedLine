import { writable, get } from 'svelte/store';
import { getStoreCommissionData } from '$lib/utils/store/commissionUtils';
import { debounce } from '$lib/utils/formatters';
import type { CommissionSearchParams  } from '$lib/types/commission';

export interface CommissionDataState {
    loading: boolean;
    error: string | null;
    data: any[];
    pagination: {
        totalCount: number;
        currentPage: number;
        totalPages: number;
        pageSize: number;
    };
    searchParams: CommissionSearchParams;
}

export function useCommissionData(initialSearchSelect: string = 'store_name') {
    const initialState: CommissionDataState = {
        loading: false,
        error: null,
        data: [],
        pagination: {
            totalCount: 0,
            currentPage: 1,
            totalPages: 1,
            pageSize: 12
        },
        searchParams: {
            searchSelect: initialSearchSelect,
            searchText: ''
        }
    };

    const store = writable<CommissionDataState>(initialState);
    
    let mounted = true;

    async function loadData(): Promise<void> {
        if (!mounted) return;
        const currentState = get(store);

        store.update(s => ({ ...s, loading: true, error: null }));

        try {
            const result = await getStoreCommissionData(currentState.pagination.currentPage, currentState.pagination.pageSize, {
                searchSelect: currentState.searchParams.searchSelect,
                searchText: currentState.searchParams.searchText,
            });

            if (mounted) {
                store.update(state => ({
                    ...state,
                    loading: false,
                    data: result.data,
                    pagination: {
                        ...state.pagination,
                        totalCount: result.pagination.totalCount,
                        totalPages: result.pagination.totalPages
                    }
                }));
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : '알 수 없는 오류 발생';
            store.update(state => ({
                ...state,
                loading: false,
                error: `데이터 로드 실패: ${message}`
            }));
        }
    }

    function search(params: Partial<CommissionSearchParams >) {
        store.update(state => ({
            ...state,
            searchParams: { ...state.searchParams, ...params },
            pagination: { ...state.pagination, currentPage: 1 }
        }));
        loadData();
    }

    function changePage(page: number) {
        store.update(state => ({
            ...state,
            pagination: { ...state.pagination, currentPage: page }
        }));
        loadData();
    }

    function changePageSize(pageSize: number) {
        store.update(state => ({
            ...state,
            pagination: { ...state.pagination, pageSize, currentPage: 1 }
        }));
        loadData();
    }

    function reset() {
        store.update(state => ({
            ...state,
            searchParams: {
                searchSelect: initialSearchSelect,
                searchText: ''
            },
            pagination: { ...state.pagination, pageSize:12, currentPage: 1 }
        }));
        loadData();
    }

    function destroy(): void{
        mounted = false;
    }

    const debouncedSearch = debounce((params: Partial<CommissionSearchParams >) => {
        store.update(state => ({
            ...state,
            searchParams: { ...state.searchParams, ...params },
            pagination: { ...state.pagination, currentPage: 1 }
        }));
        loadData();
    }, 300);

    return {
        subscribe: store.subscribe,
        loadData,
        search: debouncedSearch,
        changePage,
        changePageSize,
        reset,
        destroy,
        updateSearchParams: (params: Partial<CommissionSearchParams >) => {
            store.update(state => ({
                ...state,
                searchParams: { ...state.searchParams, ...params }
            }));
        }
    };
}



