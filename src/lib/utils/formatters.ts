// 포맷터 함수들 - 컴포넌트 밖으로 분리하여 재사용성 향상

// 타입 라벨 매핑
export const TYPE_LABELS = {
    '0': '등록',
    '1': '수정'
} as const;

export const USER_TYPE_LABELS = {
    '0': '관리자',
    '1': '파트너', 
    '2': '가맹점'
} as const;

export const USER_RATE_LABELS = {
    'p1': '대행사',
    'p2': '에이전시'
} as const;

export const STATUS_LABELS = {
    '0': { text: '예정', className: 'upper_1' },
    '1': { text: '완료', className: 'upper_4' },
    '2': { text: '보류', className: 'upper_2' },
    '3': { text: '미상', className: 'upper_3' }
} as const;

export const LOGIN_STATUS_LABELS = {
    '0': { text: '성공', color: '#000000' },
    '1': { text: '실패', color: '#be0000' }
} as const;

// 포맷터 함수들
export function getTypeLabel(type: string): string {
    return TYPE_LABELS[type as keyof typeof TYPE_LABELS] || '';
}

export function getUserTypeLabel(type: string): string {
    return USER_TYPE_LABELS[type as keyof typeof USER_TYPE_LABELS] || '';
}

export function getUserRateLabel(rate: string): string {
    return USER_RATE_LABELS[rate as keyof typeof USER_RATE_LABELS] || '';
}

export function getStatusLabel(status: string): { text: string; className: string } {
    return STATUS_LABELS[status as keyof typeof STATUS_LABELS] || { text: '알 수 없음', className: '' };
}

export function getLoginStatusLabel(status: string): { text: string; color: string } {
    return LOGIN_STATUS_LABELS[status as keyof typeof LOGIN_STATUS_LABELS] || { text: '에러', color: '#be0000' };
}

// 숫자 포맷팅 (천단위 콤마)
export function formatNumber(value: string | number): string {
    if (!value) return '';
    
    const num = typeof value === 'string' ? parseInt(value, 10) : value;
    if (isNaN(num)) return '';
    
    return num.toLocaleString();
}

// 날짜 포맷팅
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

// 오늘 날짜 (yyyy-mm-dd 포맷)
export function getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
}

// 페이지네이션 계산 함수
export function calculatePagination(currentPage: number, totalPages: number) {
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    return { startPage, endPage };
}

// 디바운스 유틸리티 함수
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    
    return (...args: Parameters<T>) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}