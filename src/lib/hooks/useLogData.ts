import { writable, get } from 'svelte/store';
import { fetchLogData, validateDateRange } from '$lib/utils/logsUtils';
import { debounce } from '$lib/utils/formatters';
import type { LogSearchParams } from '$lib/types/logs';

export interface LogDataState {
    loading: boolean;
    error: string | null;
    data: any[];
    pagination: {
        totalCount: number;
        currentPage: number;
        totalPages: number;
        pageSize: number;
    };
    searchParams: LogSearchParams;
}

export function useLogData(logType: string, initialSearchSelect: string = 'id') {
    // 초기 상태
    const initialState: LogDataState = {
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
            searchText: '',
            typeSelect: '',
            startDate: '',
            endDate: ''
        }
    };

    // 메인 스토어
    const store = writable<LogDataState>(initialState);

    // 컴포넌트 언마운트 감지
    let mounted = true;

    // 데이터 로드 함수
    async function loadData(): Promise<void> {
        if (!mounted) return;

        const currentState = get(store);
        
        if (!validateDateRange(currentState.searchParams.startDate, currentState.searchParams.endDate)) {
            return;
        }

        store.update(state => ({ ...state, loading: true, error: null }));

        try {
            const result = await fetchLogData(logType, currentState.pagination.currentPage, currentState.pagination.pageSize, {
                searchSelect: currentState.searchParams.searchSelect,
                searchText: currentState.searchParams.searchText,
                typeSelect: currentState.searchParams.typeSelect,
                startDate: currentState.searchParams.startDate,
                endDate: currentState.searchParams.endDate
            });

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
                    error: `로그 데이터를 불러오는데 실패했습니다: ${errorMessage}`
                }));
                console.error('로그 데이터 로드 실패:', err);
            }
        }
    }

    // 검색 실행
    function search(params: Partial<LogSearchParams>): void {
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
                typeSelect: '',
                startDate: '',
                endDate: ''
            },
            pagination: { ...state.pagination, pageSize: 10, currentPage: 1 }
        }));
        loadData();
    }

    // 컴포넌트 언마운트 시 호출
    function destroy(): void {
        mounted = false;
    }

    // 디바운스된 검색 함수
    const debouncedSearch = debounce((params: Partial<LogSearchParams>) => {
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
        updateSearchParams: (params: Partial<LogSearchParams>) => {
            store.update(state => ({
                ...state,
                searchParams: { ...state.searchParams, ...params }
            }));
        }
    };
}