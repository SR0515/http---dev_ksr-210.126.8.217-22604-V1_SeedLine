// 정산 관련 유틸리티 함수들

import type { 
    SettlementSearchConfig, 
    SettlementTableConfig, 
    SettlementTableColumn,
    SettlementTableHeader,
    StoreSettlementData,
    PartnerSettlementData,
    TransferData,
    PaginationData
} from '$lib/types/settlement';

/**
 * 가맹점 정산 검색 설정
 */
export const storeSettlementSearchConfig: SettlementSearchConfig = {
    type: 'simple'
};

/**
 * 파트너 정산 검색 설정
 */
export const partnerSettlementSearchConfig: SettlementSearchConfig = {
    type: 'simple'
};

/**
 * 이체 내역 검색 설정
 */
export const transferSearchConfig: SettlementSearchConfig = {
    type: 'transfer',
    searchOptions: [
        { value: 'sender_id', label: '송금관리자 아이디' },
        { value: 'settlement_account_number', label: '계좌번호' },
        { value: 'settlement_holder', label: '예금주명' }
    ]
};

/**
 * 가맹점 정산 테이블 설정
 */
export const storeSettlementTableConfig: SettlementTableConfig = {
    caption: '가맹점 정산관리 테이블',
    cssClass: 'settlement_table',
    columns: [
        { key: 'index', label: 'No', width: '10%', type: 'index' },
        { key: 'title', label: '정산 내역', width: '60%', type: 'link', clickable: true },
        { key: 'date', label: '날짜', width: '20%', type: 'text' }
    ],
    headers: [
        [
            { label: 'No' },
            { label: '정산 내역' },
            { label: '날짜' }
        ]
    ]
};

/**
 * 파트너 정산 테이블 설정
 */
export const partnerSettlementTableConfig: SettlementTableConfig = {
    caption: '파트너 정산관리 테이블',
    cssClass: 'settlement_table',
    columns: [
        { key: 'index', label: 'No', width: '10%', type: 'index' },
        { key: 'title', label: '정산 내역', width: '60%', type: 'link', clickable: true },
        { key: 'date', label: '날짜', width: '20%', type: 'text' }
    ],
    headers: [
        [
            { label: 'No' },
            { label: '정산 내역' },
            { label: '날짜' }
        ]
    ]
};

/**
 * 이체 내역 테이블 설정
 */
export const transferTableConfig: SettlementTableConfig = {
    caption: '관리자 송금 테이블',
    cssClass: '',
    columns: [
        { key: 'index', label: 'No', width: '5%', type: 'index' },
        { key: 'senderId', label: '송금자ID', width: '8.67%', type: 'text', cssClass: 'wd_name' },
        { key: 'bankName', label: '은행', width: '6.67%', type: 'text' },
        { key: 'accountNumber', label: '계좌번호', width: '6.67%', type: 'text', excelFormat: '\\@' },
        { key: 'accountHolder', label: '예금주명', width: '6.67%', type: 'text' },
        { key: 'amount', label: '송금금액', width: '6.67%', type: 'text' },
        { key: 'fee', label: '송금수수료', width: '6.67%', type: 'text' },
        { key: 'transferDate', label: '송금일자', width: '10%', type: 'text' }
    ],
    headers: [
        [
            { label: 'No' },
            { label: '송금자ID' },
            { label: '은행' },
            { label: '계좌번호' },
            { label: '예금주명' },
            { label: '송금금액' },
            { label: '송금수수료' },
            { label: '송금일자' }
        ]
    ]
};

/**
 * 가맹점 정산 상세 테이블 설정
 */
export const storeSettlementDetailTableConfig: SettlementTableConfig = {
    caption: '가맹점 정산관리 상세페이지',
    cssClass: '',
    columns: [
        { key: 'checkbox', label: '', width: '3%', type: 'checkbox' },
        { key: 'storeName', label: '상호명', width: '12%', type: 'link', clickable: true, cssClass: 'pay_t name_click wd_date' },
        { key: 'tid', label: 'TID', width: '5%', type: 'text', cssClass: 'pay_t' },
        { key: 'paymentCount', label: '결제건수', width: '3%', type: 'number', cssClass: 'pay_t' },
        { key: 'approvalCount', label: '승인건수', width: '3%', type: 'number', cssClass: 'pay_t' },
        { key: 'approvalAmount', label: '결제금액', width: '5%', type: 'text', cssClass: 'pay_t' },
        { key: 'cancelCount', label: '취소건수', width: '3%', type: 'number', cssClass: 'pay_t' },
        { key: 'cancelAmount', label: '취소금액', width: '5%', type: 'text', cssClass: 'pay_t' },
        { key: 'paymentAmount', label: '승인금액', width: '5%', type: 'text', cssClass: 'pay_t' },
        { key: 'commissionRate', label: '수수료율', width: '3%', type: 'highlight', cssClass: 'pay_t' },
        { key: 'settlementAmount', label: '정산금액', width: '5%', type: 'text', cssClass: 'pay_t' },
        { key: 'status', label: '정산 상태', width: '6%', type: 'status', cssClass: 'pay_t' },
        { key: 'bankName', label: '은행명', width: '7%', type: 'text', cssClass: 'pay_t wd_bank', excelFormat: '\\@' },
        { key: 'accountNumber', label: '계좌번호', width: '3%', type: 'text', cssClass: 'pay_t wd_account', excelFormat: '\\@' },
        { key: 'accountHolder', label: '예금주', width: '8%', type: 'text', cssClass: 'pay_t', excelFormat: '\\@' }
    ],
    headers: [
        [
            { type: 'checkbox', label: '', rowspan: 2 },
            { label: '상호명', rowspan: 2 },
            { label: 'TID', rowspan: 2 },
            { label: '결제건수', rowspan: 2 },
            { label: '전체매출', colspan: 6 },
            { label: '정산금액', rowspan: 2 },
            { label: '정산 상태', rowspan: 2 },
            { label: '계좌정보', colspan: 3 }
        ],
        [
            { label: '승인건수', colspan: 1 },
            { label: '결제금액', colspan: 1 },
            { label: '취소건수', colspan: 1 },
            { label: '취소금액', colspan: 1 },
            { label: '승인금액', colspan: 1 },
            { label: '수수료율', colspan: 1 },
            { label: '은행명', colspan: 1 },
            { label: '계좌번호', colspan: 1 },
            { label: '예금주', colspan: 1 }
        ]
    ]
};

/**
 * 파트너 정산 상세 테이블 설정
 */
export const partnerSettlementDetailTableConfig: SettlementTableConfig = {
    caption: '파트너 정산관리 상세페이지',
    cssClass: '',
    columns: [
        { key: 'storeName', label: '상점명', width: '16%', type: 'link', clickable: true, cssClass: 'pay_t name_click wd_date' },
        { key: 'tid', label: 'TID', width: '8%', type: 'text', cssClass: 'pay_t' },
        { key: 'paymentAmount', label: '결제금액', width: '6%', type: 'text', cssClass: 'pay_t' },
        { key: 'commission', label: '수수료', width: '5%', type: 'text', cssClass: 'pay_t' },
        { key: 'headquartersName', label: '본사(업체명)', width: '8%', type: 'text', cssClass: 'pay_t wd_name' },
        { key: 'headquartersRate', label: '수수료율', width: '1%', type: 'highlight', cssClass: 'pay_t' },
        { key: 'headquartersAmount', label: '정산금액', width: '6%', type: 'text', cssClass: 'pay_t' },
        { key: 'agencyName', label: '대행사(업체명)', width: '10%', type: 'text', cssClass: 'pay_t wd_name', excelFormat: '\\@' },
        { key: 'agencyRate', label: '수수료율', width: '1%', type: 'highlight', cssClass: 'pay_t' },
        { key: 'agencyAmount', label: '정산금액', width: '5%', type: 'text', cssClass: 'pay_t' },
        { key: 'subAgencyName', label: '에이전시(업체명)', width: '10%', type: 'text', cssClass: 'pay_t wd_agency', excelFormat: '\\@' },
        { key: 'subAgencyRate', label: '수수료율', width: '1%', type: 'highlight', cssClass: 'pay_t', excelFormat: '\\@' },
        { key: 'subAgencyAmount', label: '정산금액', width: '5%', type: 'text', cssClass: 'pay_t', excelFormat: '\\@' }
    ],
    headers: [
        [
            { label: '상점명', rowspan: 2 },
            { label: 'TID', rowspan: 2 },
            { label: '결제금액', rowspan: 2 },
            { label: '수수료', rowspan: 2 },
            { label: '소속 파트너', colspan: 9 }
        ],
        [
            { label: '본사(업체명)', colspan: 1 },
            { label: '수수료율', colspan: 1 },
            { label: '정산금액', colspan: 1 },
            { label: '대행사(업체명)', colspan: 1 },
            { label: '수수료율', colspan: 1 },
            { label: '정산금액', colspan: 1 },
            { label: '에이전시(업체명)', colspan: 1 },
            { label: '수수료율', colspan: 1 },
            { label: '정산금액', colspan: 1 }
        ]
    ]
};

/**
 * 더미 데이터 생성 함수들
 */
export const generateStoreSettlementData = (): StoreSettlementData[] => [
    {
        id: '1',
        title: '2023년 03월 20일 매출 정산내역',
        date: '2025-03-21',
        status: '1'
    }
];

export const generatePartnerSettlementData = (): PartnerSettlementData[] => [
    {
        id: '1',
        title: '2023년 03월 정산내역',
        date: '2025-03',
        status: '1'
    }
];

export const generateTransferData = (): TransferData[] => [
    {
        id: '1',
        senderId: 'rs("sender_id")',
        bankName: 'rs("bank_name")',
        accountNumber: 'rs("settlement_account_number")',
        accountHolder: 'rs("settlement_holder")',
        amount: 'rs("settlement_amount")',
        fee: 'rs("transfer_tax")',
        transferDate: 'rs("settlement_date")'
    }
];

/**
 * 페이지네이션 데이터 생성
 */
export const generatePaginationData = (
    currentPage: number = 1,
    totalPages: number = 3,
    totalCount: number = 25,
    pageSize: number = 10
): PaginationData => ({
    currentPage,
    totalPages,
    totalCount,
    pageSize
});

/**
 * 정산 상태 텍스트 반환
 */
export const getSettlementStatusText = (status: string): string => {
    switch (status) {
        case '0': return '정산 예정';
        case '1': return '정산 완료';
        case '2': return '정산 보류';
        default: return '알 수 없음';
    }
};

/**
 * 정산 상태 CSS 클래스 반환
 */
export const getSettlementStatusClass = (status: string): string => {
    switch (status) {
        case '0': return 'before_btn';
        case '1': return 'before_btn green_t';
        case '2': return 'before_btn red_t';
        default: return 'before_btn';
    }
};

/**
 * 숫자 포맷팅 (천 단위 콤마)
 */
export const formatNumber = (value: string | number): string => {
    if (!value) return '0';
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

/**
 * 날짜 포맷팅 (YYYY-MM-DD)
 */
export const formatDate = (date: Date | string): string => {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
};

/**
 * 검색 파라미터 검증
 */
export const validateSearchParams = (params: any): boolean => {
    if (!params.startDate || !params.endDate) return false;
    if (new Date(params.startDate) > new Date(params.endDate)) return false;
    return true;
};

/**
 * 로딩 상태 관리
 */
export const createLoadingState = () => {
    let loading = $state(false);
    
    return {
        get loading() { return loading; },
        setLoading: (value: boolean) => { loading = value; },
        withLoading: async <T>(fn: () => Promise<T>): Promise<T> => {
            loading = true;
            try {
                return await fn();
            } finally {
                loading = false;
            }
        }
    };
};

/**
 * 디바운스 함수
 */
export const debounce = <T extends (...args: any[]) => void>(
    func: T,
    wait: number
): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
};

/**
 * 토스트 메시지 표시 유틸리티
 */
export const showToast = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    // 기존 토스트 제거
    const existingToast = document.querySelector('.settlement-toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    // 새 토스트 생성
    const toast = document.createElement('div');
    toast.className = `settlement-toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    // 1.5초 후 제거
    setTimeout(() => {
        toast.remove();
    }, 1500);
};