import { writable } from 'svelte/store';
import { debounce } from '$lib/utils/formatters';
import type { LogSearchParams, LogPaginationData, LogApiResponse } from '$lib/types/logs';

// 공통 로그 상태 관리
export interface LogsState {
    loading: boolean;
    error: string | null;
    data: any[];
    pagination: LogPaginationData;
    searchParams: LogSearchParams;
}

const initialState: LogsState = {
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
        searchSelect: 'id',
        searchText: '',
        typeSelect: '',
        startDate: '',
        endDate: ''
    }
};

// 로그 스토어 팩토리 함수
export function createLogsStore() {
    const { subscribe, set, update } = writable<LogsState>(initialState);

    // 디바운스된 검색 함수
    const debouncedSearch = debounce(async (apiEndpoint: string, params: LogSearchParams & { page?: number; pageSize?: number }) => {
        update(state => ({ ...state, loading: true, error: null }));
        
        try {
            const queryParams = new URLSearchParams({
                searchSelect: params.searchSelect,
                searchText: params.searchText,
                startDate: params.startDate,
                endDate: params.endDate,
                page: String(params.page || 1),
                pageSize: String(params.pageSize || 10)
            });

            if (params.typeSelect) {
                queryParams.append('typeSelect', params.typeSelect);
            }

            const response = await fetch(`${apiEndpoint}?${queryParams}`);
            const result: LogApiResponse<any> = await response.json();

            if (result.success) {
                update(state => ({
                    ...state,
                    loading: false,
                    data: result.data,
                    pagination: result.pagination
                }));
            } else {
                update(state => ({
                    ...state,
                    loading: false,
                    error: result.message || '데이터를 불러오는데 실패했습니다.'
                }));
            }
        } catch (error) {
            update(state => ({
                ...state,
                loading: false,
                error: '네트워크 오류가 발생했습니다.'
            }));
        }
    }, 300);

    return {
        subscribe,
        set,
        update,
        
        // 검색 파라미터 업데이트
        updateSearchParams: (params: Partial<LogSearchParams>) => {
            update(state => ({
                ...state,
                searchParams: { ...state.searchParams, ...params }
            }));
        },

        // 페이지 변경
        changePage: (apiEndpoint: string, page: number) => {
            update(state => ({ ...state, pagination: { ...state.pagination, currentPage: page } }));
            debouncedSearch(apiEndpoint, { ...initialState.searchParams, page });
        },

        // 페이지 사이즈 변경
        changePageSize: (apiEndpoint: string, pageSize: number) => {
            update(state => ({
                ...state,
                pagination: { ...state.pagination, pageSize, currentPage: 1 }
            }));
            debouncedSearch(apiEndpoint, { ...initialState.searchParams, pageSize, page: 1 });
        },

        // 검색 실행
        search: (apiEndpoint: string, params: LogSearchParams) => {
            update(state => ({
                ...state,
                searchParams: params,
                pagination: { ...state.pagination, currentPage: 1 }
            }));
            debouncedSearch(apiEndpoint, { ...params, page: 1 });
        },

        // 초기화
        reset: (apiEndpoint: string) => {
            const resetParams = {
                searchSelect: 'id',
                searchText: '',
                typeSelect: '',
                startDate: '',
                endDate: ''
            };
            
            update(state => ({
                ...state,
                searchParams: resetParams,
                pagination: { ...state.pagination, currentPage: 1 }
            }));
            
            debouncedSearch(apiEndpoint, { ...resetParams, page: 1 });
        },

        // 로딩 상태 설정
        setLoading: (loading: boolean) => {
            update(state => ({ ...state, loading }));
        },

        // 에러 상태 설정
        setError: (error: string | null) => {
            update(state => ({ ...state, error }));
        },

        // 데이터 직접 로드
        loadData: debouncedSearch
    };
}

// 각 로그 타입별 스토어 인스턴스
export const loginLogsStore = createLogsStore();
export const editLogsStore = createLogsStore();
export const commissionLogsStore = createLogsStore();
export const settlementLogsStore = createLogsStore();