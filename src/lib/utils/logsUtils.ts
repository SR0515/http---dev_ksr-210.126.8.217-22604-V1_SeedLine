import { showToast } from '$lib/stores/toast';

// 로그 데이터 조회
export async function fetchLogData(
    logType: string,
    page: number = 1,
    pageSize: number = 10,
    searchParams: {
        searchSelect?: string;
        searchText?: string;
        typeSelect?: string;
        startDate?: string;
        endDate?: string;
    } = {}
) {
    try {
        const params = new URLSearchParams({
            page: page.toString(),
            page_size: pageSize.toString(),
            search_select: searchParams.searchSelect || 'id',
            search_text: searchParams.searchText || '',
            type_select: searchParams.typeSelect || '',
            start_date: searchParams.startDate || '',
            end_date: searchParams.endDate || ''
        });

        const endpoint = getLogApiEndpoint(logType);
        const response = await fetch(`${endpoint}?${params.toString()}`);
        const json = await response.json();

        if (json.success) {
            return {
                data: json.data,
                pagination: json.pagination
            };
        } else {
            throw new Error(json.message);
        }
    } catch (error) {
        console.error('로그 데이터 조회 실패:', error);
        const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
        showToast(`로그 데이터를 불러올 수 없습니다: ${errorMessage}`, 'error');
        
        // 기본 빈 데이터 반환으로 앱이 중단되지 않게 함
        return {
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

// 사용자 타입 라벨 변환
export function getUserTypeLabel(type: string): string {
    switch (type) {
        case '0': return '관리자';
        case '1': return '파트너';
        case '2': return '가맹점';
        default: return '';
    }
}

// 사용자 등급 라벨 변환
export function getUserRateLabel(rate: string): string {
    switch (rate) {
        case 'p1': return '대행사';
        case 'p2': return '에이전시';
        default: return '';
    }
}

// 로그인 상태 라벨 변환
export function getLoginStatusLabel(status: string): { text: string; color: string } {
    switch (status) {
        case '0': return { text: '성공', color: '#000000' };
        case '1': return { text: '실패', color: '#be0000' };
        default: return { text: '에러', color: '#be0000' };
    }
}

// 페이지네이션 계산
export function calculatePagination(currentPage: number, totalPages: number) {
    const startPage = Math.floor((currentPage - 1) / 10) * 10 + 1;
    const endPage = Math.min(startPage + 9, totalPages);
    
    return { startPage, endPage };
}

// 오늘 날짜 (yyyy-mm-dd 포맷)
export function getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
}

// 디바운스 함수
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    delay: number
): (...args: Parameters<T>) => void {
    let timeoutId: ReturnType<typeof setTimeout>;
    return (...args: Parameters<T>) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    };
}

// 날짜 포맷팅 (YYYY-MM-DD HH:mm:ss → YYYY-MM-DD HH:mm)
export function formatLogDate(dateString: string): string {
    if (!dateString) return '';
    
    try {
        const date = new Date(dateString);
        return date.toLocaleString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    } catch (error) {
        return dateString;
    }
}

// 숫자 포맷팅 (천단위 콤마)
export function formatNumber(value: string | number): string {
    if (!value) return '';
    
    const num = typeof value === 'string' ? parseInt(value, 10) : value;
    if (isNaN(num)) return '';
    
    return num.toLocaleString();
}

// 로그 타입별 API 엔드포인트 매핑
export function getLogApiEndpoint(logType: string): string {
    const endpoints = {
        'LoginLog': '/api/log/LoginLog',
        'EditLog': '/api/log/EditLog',
        'S_commission_log': '/api/log/StoreCommissionLog',
        'S_settlement_log': '/api/log/StoreSettlementLog'
    };
    
    return endpoints[logType as keyof typeof endpoints] || '/api/log/LoginLog';
}