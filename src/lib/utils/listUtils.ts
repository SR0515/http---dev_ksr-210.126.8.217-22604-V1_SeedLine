import { showToast } from '$lib/stores/toast';
import { get } from 'svelte/store';
import { authStore } from '$lib/stores/auth';

let auth = get(authStore);
let classify = auth.classify;
let rate = auth.rate;
let user_code = auth.userCode;

//데이터 조회
export async function getListData(
    partnerRate: string,
    page: number = 1,
    pageSize: number = 10,
    listType: string,
    searchParams: {
        searchSelect?: string;
        searchText?: string;
        startDate?: string;
        endDate?: string;
    } = {}
    ) {
    try {
        const params = new URLSearchParams({
            classify: classify,
            user_code : user_code || '',
            rate : partnerRate,
            page: page.toString(),
            page_size: pageSize.toString(),
            search_select: searchParams.searchSelect || 'id',
            search_text: searchParams.searchText || '',
            start_date: searchParams.startDate || '',
            end_date: searchParams.endDate || ''
        });
        let endPoint;
        if (listType === 'store') {
            endPoint = '/api/store_list_view?';
        } else if (listType === 'partner') {
            endPoint = '/api/partner_list_view/partnerListAPI?';
        }
        const response = await fetch(endPoint + params.toString());
        const json = await response.json();
                    console.log("response",response)
            console.log("json",json)

        if (json.success) {
            return {
                upper_rate : json.upper_rate || '',
                data: json.data,
                pagination: json.pagination
            };

        } else {
            throw new Error(json.message);
        }
    } catch (error) {
        console.error('데이터 조회 실패:', error);
        const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
        showToast(`데이터를 불러올 수 없습니다: ${errorMessage}`, 'error');
        
        // 기본 빈 데이터 반환으로 앱이 중단되지 않게 함
        return {
            upper_rate: '',
            data: [],
            pagination: {
                totalCount: 0,
                currentPage: 1,
                totalPages: 0,
                pageSize: 10
            }
        };
    }
}

// 날짜 범위 검증
export function validateDateRange(startDate: string, endDate: string): boolean {
    if ((startDate && !endDate) || (!startDate && endDate)) {
        showToast('시작일과 종료일을 모두 선택해주세요.', 'error');
        return false;
    }
    return true;
}

// 페이지 제목 생성 함수
export function getPageTitle(role: string, partnerName:string): string {
    if (role === 'partner') return `파트너 관리 - ${partnerName}`;
    if (role === 'store') return '가맹점 관리';
    return '관리';
}

export function listPage(role: string, writePartner:{}, partnerUpperRate:string): string {
    if (role === "partner") return `/write/partner?${writePartner}&partnerUpperRate=${partnerUpperRate}`;
    if (role === "store") return "/write/store";
    return "";
}



