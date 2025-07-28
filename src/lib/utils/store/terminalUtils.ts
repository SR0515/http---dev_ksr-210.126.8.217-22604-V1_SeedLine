import { showToast } from '$lib/stores/toast';
import { get } from 'svelte/store';
import { authStore } from '$lib/stores/auth';

import type { ListTerminalSearchParams, TerminalExpirydateData, ListPaginationData , TerminalInactiveData} from '$lib/types/store';

let auth = get(authStore);
let classify = auth.classify;
let rate = auth.rate;
let userId = auth.userId;


// 페이지 제목 생성 함수
export function getPageTitle(role: string, rate?: string): string {
    if (role === 'expirydate') return '1년경과 단말기 관리';
    if (role === 'inactive') return '장기 미사용 단말기 관리';
    return '관리';
}

// 단말기 관리 데이터 제네릭 타입 정의
export type TerminalListResponse<T> = {
    data: T[];
    pagination: ListPaginationData;
};

// 1년경과 단말기 데이터 조회
export async function getExpirydateData <T = TerminalExpirydateData> (
    page: number = 1,
    pageSize: number = 10,
    searchParams: ListTerminalSearchParams = {}
): Promise<TerminalListResponse <T>> {
    try {
        const auth = get(authStore);
        const classify = auth.classify ?? '';
        const rate = auth.rate ?? '';
        const userId = auth.userId ?? '';

        const params = new URLSearchParams({
            classify,
            rate,
            userId,
            page: page.toString(),
            page_size: pageSize.toString(),
            search_select: searchParams.searchSelect ?? '',
            search_text: searchParams.searchText ?? ''
        });

        const response = await fetch('/api/TerminalExpirydateList?' + params.toString());
        const json = await response.json();

        if (json.success) {
            const totalCount = json.pagination?.totalCount ?? 0;
            const totalPages = Math.ceil(totalCount / pageSize);

            return {
                data: json.data as T[],
                pagination: {
                    totalCount,
                    currentPage: page,
                    totalPages,
                    pageSize
                }
            };
            
        } else {
        throw new Error(json.message || '서버 응답 실패');
        }
    } catch (error) {
    console.error('1년경과 단말기 데이터 조회 실패:', error);
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
    showToast(`데이터를 불러올 수 없습니다: ${errorMessage}`, 'error');

    return {
      data: [],
      pagination: {
        totalCount: 0,
        currentPage: 1,
        totalPages: 0,
        pageSize
      }
    };
  }
}

// 장기미사용 단말기 데이터 조회
export async function getInactiveData <T = TerminalInactiveData> (
    page: number = 1,
    pageSize: number = 10,
    searchParams: ListTerminalSearchParams = {}
): Promise<TerminalListResponse<T>> {
    try {
        const auth = get(authStore);
        const classify = auth.classify ?? '';
        const rate = auth.rate ?? '';
        const userId = auth.userId ?? '';

        const params = new URLSearchParams({
            classify,
            rate,
            userId,
            page: page.toString(),
            page_size: pageSize.toString(),
            search_select: searchParams.searchSelect ?? '',
            search_text: searchParams.searchText ?? ''
        });

        const response = await fetch('/api/TerminalInactiveList?' + params.toString());
        const json = await response.json();

        if (json.success) {
            const totalCount = json.pagination?.totalCount ?? 0;
            const totalPages = Math.ceil(totalCount / pageSize);

            return {
                data: json.data as T[],
                pagination: {
                    totalCount,
                    currentPage: page,
                    totalPages,
                    pageSize
                }
            };
        } else {
        throw new Error(json.message || '서버 응답 실패');
        }
    } catch (error) {
        console.error('데이터 조회 실패:', error);
        const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
        showToast(`데이터를 불러올 수 없습니다: ${errorMessage}`, 'error');

        return {
            data: [],
            pagination: {
                totalCount: 0,
                currentPage: 1,
                totalPages: 0,
                pageSize
            }
        };
    }
}