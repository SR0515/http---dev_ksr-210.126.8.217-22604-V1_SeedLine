export type Option = {
    value: string;
    label: string;
};

// 검색 옵션 상수들
export const LOGIN_SEARCH_OPTIONS = [
    { value: 'id', label: 'ID' },
    { value: 'name', label: '사용자명' },
    { value: 'ip', label: 'IP' }
];

export const EDIT_SEARCH_OPTIONS = [
    { value: 'id', label: '아이디' },
    { value: 'name', label: '업체명' },
    { value: 'editor_ip', label: 'IP' }
];

export const COMMISSION_SEARCH_OPTIONS = [
    { value: 'store_name', label: '가맹점명' },
    { value: 'store_catid', label: 'TID' },
    { value: 'editor_ip', label: 'IP' }
];

export const SETTLEMENT_SEARCH_OPTIONS = [
    { value: 'store_name', label: '가맹점명' },
    { value: 'store_catid', label: 'TID' },
    { value: 'editor_ip', label: 'IP' }
] as const;

export const PAGE_SIZE_OPTIONS = [
    { value: 10, label: '10건' },
    { value: 25, label: '25건' },
    { value: 50, label: '50건' },
    { value: 100, label: '100건' }
] as const;

//가맹점 리스트
export const STORE_LIST_OPTIONS = [
    { value: 'id', label: '연락처' },
    { value: 'store_name', label: '상호명' },
    { value: 'store_ceo_name', label: '대표명' }
];
//파트너 리스트
export const PARTNER_LIST_OPTIONS = [
    { value: 'id', label: '아이디' },
    { value: 'name', label: '업체명' },
    { value: 'contact', label: '연락처' }
];

// 정산 수수료 관리 
export const STORE_COMMISSION_OPTIONS = [
    { value: 'store_name', label: '상호명' },
    { value: 'upper_path', label: '파트너명' },
    { value: 'id', label: '연락처' }
];

// 1년경과 단말기 관리 
export const STORE_EXPIRYDATE_OPTIONS = [
    { value: 'T_catId', label: 'TID' },
    { value: 'store_name', label: '상호명' },
    { value: 'id', label: '연락처' },
    { value: 'store_ceo_name', label: '대표명' }
];

// 장기미사용 단말기 관리 
export const STORE_INACTIVE_OPTIONS = [
    { value: 'sw.T_catId', label: 'TID' },
    { value: 'sw.name', label: '상호명' },
    { value: 'sbi.store_ceo_name', label: '대표명' }
];

// 결제내역 - pg_select
export const PAYMENT_PG_OPTIONS = [
    { value: '', label: 'PG' },
    { value: '0', label: 'Korpay' },
    { value: '1', label: 'Galaxia' },
    { value: '2', label: 'Ksnet' },
    { value: '3', label: 'KWon' }
];

// 결제내역 - search_select
export const PAYMENT_SEARCH_OPTIONS = [
    { value: 'appNo', label: '승인번호' },
    { value: 'Name', label: '가맹점명' },
    { value: 'cardNo', label: '카드번호' },
    { value: 'TID', label: 'TID' }
];

// 결제내역 - cancel_select
export const PAYMENT_CANCEL_OPTIONS = [
    { value: '', label: '전체' },
    { value: 'N', label: '승인' },
    { value: 'Y', label: '취소' },
    { value: 'DY', label: '중복결제취소' }
];

// 매출내역 
export const PAYMENT_SALES_OPTIONS = [
    { value: 'store_catid', label: 'TID' },
    { value: 'store_name', label: '상호명' }
];

// 중복결제알림 
export const PAYMENT_DUPLICATE_OPTIONS = [
    { value: 'appNo', label: '승인번호' },
    { value: 'a.catId', label: 'TID' },
    { value: 'name', label: '상호명' },
    { value: 'cardNo', label: '카드번호' }
];