import { writable, get, type Writable } from 'svelte/store';
import { debounce } from '$lib/utils/formatters';
import { validateDateRange } from '$lib/utils/listUtils';
import { getPaymentListData, getSalesListData } from '$lib/utils/payment/paymentUtils';
import type { PaymentSearchParams, PaymentStats, SalesSearchParams, PaymentListData } from '$lib/types/payment';
import { getTodayDate } from '$lib/utils/formatters';
import { showToast } from '$lib/stores/toast';

const today = getTodayDate();

export interface ListDataState<T = any, P = PaymentSearchParams> {
    loading: boolean;
    error: string | null;
    data: T[];
    pagination: {
        totalCount: number;
        currentPage: number;
        totalPages: number;
        pageSize: number;
    };
    searchParams: P;
    totalStats: PaymentStats;
    upper_rate?: string;
}

// 결제내역 hook
export function usePaymentListData( initialParams: Partial<PaymentSearchParams>) {
    // 초기 상태
    const initialState: ListDataState = {
        upper_rate: '',
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
            searchSelect: initialParams.searchSelect ?? 'appNo',
            searchText: '',
            pgSelect: initialParams.pgSelect ?? '',
            cancelSelect: initialParams.cancelSelect ?? '',
            startDate: '',
            endDate: '',
        },
        totalStats: {} as PaymentStats,
    };

    // 메인 스토어
    const store = writable<ListDataState<PaymentListData, PaymentSearchParams>>(initialState);

    // 컴포넌트 언마운트 감지
    let mounted = true;

    // 데이터 로드 함수
    async function loadData(): Promise<void> {
        if (!mounted) return;

        const currentState = get(store);
        const startDate = currentState.searchParams.startDate ?? '';
        const endDate = currentState.searchParams.endDate ?? '';
        
        if (!validateDateRange(startDate, endDate)) {
            return;
        }

        store.update(state => ({ ...state, loading: true, error: null }));

        try {
            const result = await getPaymentListData(currentState.pagination.currentPage, currentState.pagination.pageSize,{
                searchSelect: currentState.searchParams.searchSelect,
                pgSelect: currentState.searchParams.pgSelect,
                cancelSelect: currentState.searchParams.cancelSelect,
                searchText: currentState.searchParams.searchText,
                startDate: currentState.searchParams.startDate,
                endDate: currentState.searchParams.endDate
            });

            if (mounted) {
                store.update(state => ({
                    ...state,
                    loading: false,
                    data: result.data,
                    totalStats: result.totalStats,
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
                    error: `가맹점 데이터를 불러오는데 실패했습니다: ${errorMessage}`
                }));
                console.error('로그 데이터 로드 실패:', err);
            }
        }
    }

    // 검색 실행
    function search(params: Partial<PaymentSearchParams>): void {
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
                searchSelect: initialParams.searchSelect ?? 'appNo',
                searchText: '',
                pgSelect: initialParams.pgSelect ?? '',
                cancelSelect: initialParams.cancelSelect ?? '',
                startDate: today,
                endDate: today,
            },
            pagination: { ...state.pagination, currentPage: 1 },
        }));
        loadData();
    }

    // 컴포넌트 언마운트 시 호출
    function destroy(): void {
        mounted = false;
    }

    // 디바운스된 검색 함수
    const debouncedSearch = debounce((params: Partial<PaymentSearchParams>) => {
        console.log('debouncedSearch params:', params);
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
        updateSearchParams: (params: Partial<PaymentSearchParams>) => {
            store.update(state => ({
                ...state,
                searchParams: { ...state.searchParams, ...params }
            }));
        }
    };
}

//  매출내역, 중복결제알림 hook
export function useSalesListData(initialParams: Partial<SalesSearchParams>) {
  const initialState: ListDataState<any, SalesSearchParams> = {
    loading: false,
    error: null,
    data: [],
    pagination: {
      totalCount: 0,
      totalPages: 1,
      currentPage: 1,
      pageSize: 10
    },
    searchParams: {
      searchSelect: initialParams.searchSelect ?? 'appNo',
      searchText: '',
      cancelYN: initialParams.cancelYN ?? '',
      startDate: today,
      endDate: today
    },
    totalStats: {}
  };

  const store: Writable<ListDataState> = writable(initialState);
  let mounted = true;

  async function loadData(): Promise<void> {
    if (!mounted) return;

    const currentState = get(store);
    const { startDate, endDate } = currentState.searchParams;

    if (!startDate || !endDate) return;
    if (!validateDateRange(startDate, endDate)) return;

    store.update(state => ({ ...state, loading: true, error: null }));

    try {
      const result = await getSalesListData(
        currentState.pagination.currentPage,
        currentState.pagination.pageSize,
        currentState.searchParams
      );

      if (!mounted) return;

      store.update(state => ({
        ...state,
        loading: false,
        data: result.data,
        totalStats: result.totalStats,
        pagination: {
          ...state.pagination,
          totalCount: result.pagination.totalCount,
          totalPages: result.pagination.totalPages
        }
      }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류';
      showToast(`매출 데이터를 불러오지 못했습니다: ${errorMessage}`, 'error');

      if (mounted) {
        store.update(state => ({
          ...state,
          loading: false,
          error: errorMessage
        }));
      }
    }
  }

  function search(params: Partial<SalesSearchParams>): void {
    store.update(state => ({
      ...state,
      searchParams: { ...state.searchParams, ...params },
      pagination: { ...state.pagination, currentPage: 1 }
    }));
    loadData();
  }

  function changePage(page: number): void {
    store.update(state => ({
      ...state,
      pagination: { ...state.pagination, currentPage: page }
    }));
    loadData();
  }

  function changePageSize(pageSize: number): void {
    store.update(state => ({
      ...state,
      pagination: { ...state.pagination, pageSize, currentPage: 1 }
    }));
    loadData();
  }

  function reset(): void {
    store.update(state => ({
      ...state,
      searchParams: {
        searchSelect: initialParams.searchSelect ?? 'appNo',
        searchText: '',
        cancelYN: initialParams.cancelYN ?? '',
        startDate: today,
        endDate: today
      },
      pagination: { ...state.pagination, currentPage: 1 }
    }));
    loadData();
  }

  function destroy(): void {
    mounted = false;
  }

  const debouncedSearch = debounce((params: Partial<SalesSearchParams>) => {
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
    updateSearchParams: (params: Partial<SalesSearchParams>) => {
      store.update(state => ({
        ...state,
        searchParams: { ...state.searchParams, ...params }
      }));
    }
  };
}