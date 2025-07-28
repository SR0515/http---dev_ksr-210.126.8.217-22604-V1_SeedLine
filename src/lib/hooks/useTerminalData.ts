import { writable, get, type Writable } from 'svelte/store';
import { debounce } from '$lib/utils/formatters';
import type { TerminalListResponse} from '$lib/utils/store/terminalUtils';
import type { ListTerminalSearchParams } from '$lib/types/store';

export interface ListDataState {
    loading: boolean;
    error: string | null;
    data: any[];
    pagination: {
        totalCount: number;
        currentPage: number;
        totalPages: number;
        pageSize: number;
    };
    searchParams: ListTerminalSearchParams; 
}

export function useListData<T>(
    rateStore: Writable<string>,
    fetchFunction: (
        page: number,
        pageSize: number,
        searchParams: ListTerminalSearchParams
    ) => Promise<TerminalListResponse<T>>,
    initialSearchSelect: string = 'T_catId'
) {
    // 초기 상태
    const initialState: ListDataState = {
        loading: false,
        error: null,
        data: [],
        pagination: {
            totalCount: 0,
            currentPage: 1,
            totalPages: 1,
            pageSize: 10
        },
        searchParams: {
            searchSelect: initialSearchSelect,
            searchText: ''
        }
    };

    // 메인 스토어
    const store = writable<ListDataState>(initialState);

    // 컴포넌트 언마운트 감지
    let mounted = true;

    // 데이터 로드 함수
    async function loadData(): Promise<void> {
        if (!mounted) return;

        const currentState = get(store);
        const partnerRate = get(rateStore);

        store.update(state => ({ ...state, loading: true, error: null }));

        try {
            const result = await fetchFunction(
                currentState.pagination.currentPage,
                currentState.pagination.pageSize,
                {
                    searchSelect: currentState.searchParams.searchSelect,
                    searchText: currentState.searchParams.searchText
                }
            );

            if (mounted) {
                store.update(state => ({
                    ...state,
                    loading: false,
                    data: result.data,
                    pagination: {
                        ...state.pagination,
                        totalCount: result.pagination.totalCount,
                        totalPages: Math.ceil(result.pagination.totalCount / state.pagination.pageSize)
                    }
                }));
            }
        } catch (err) {
            if (mounted) {
                const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
                store.update(state => ({
                    ...state,
                    loading: false,
                    error: `데이터를 불러오는데 실패했습니다: ${errorMessage}`
                }));
                console.error('로그 데이터 로드 실패:', err);
            }
        }
    }
    
    // 검색 실행
    function search(params: Partial<ListTerminalSearchParams>): void {
        store.update(state => ({
            ...state,
            searchParams: { ...state.searchParams, ...params },
            pagination: { ...state.pagination, currentPage: 1 }
        }));
        loadData();
    }

    // 페이지 변경
    function changePage(page: number): void {
        store.update(state => ({
            ...state,
            pagination: { ...state.pagination, currentPage: page }
        }));
        loadData();
    }

    // 페이지 크기 변경
    function changePageSize(pageSize: number): void {
        store.update(state => ({
            ...state,
            pagination: { ...state.pagination, pageSize, currentPage: 1 }
        }));
        loadData();
    }

    // 검색 초기화
    function reset(): void {
        store.update(state => ({
            ...state,
            searchParams: {
                searchSelect: initialSearchSelect,
                searchText: '',
                startDate: '',
                endDate: ''
            },
            pagination: { ...state.pagination, pageSize:10, currentPage: 1 }
        }));
        loadData();
    }

    // 컴포넌트 언마운트 시 호출
    function destroy(): void {
        mounted = false;
    }

    // 디바운스된 검색 함수
    const debouncedSearch = debounce((params: Partial<ListTerminalSearchParams>) => {
        store.update(state => ({
            ...state,
            searchParams: { ...state.searchParams, ...params },
            pagination: { ...state.pagination, currentPage: 1 }
        }));
        loadData();
    }, 300);

    return {
        // 스토어 구독
        subscribe: store.subscribe,
        // 액션 함수들
        loadData,
        search: debouncedSearch,
        changePage,
        changePageSize,
        reset,
        destroy,
        
        // 개별 데이터 헬퍼
        updateSearchParams: (params: Partial<ListTerminalSearchParams>) => {
            store.update(state => ({
                ...state,
                searchParams: { ...state.searchParams, ...params }
            }));
        }
    };
}
