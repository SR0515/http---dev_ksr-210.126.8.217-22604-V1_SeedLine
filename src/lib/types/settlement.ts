// 정산 관련 타입 정의

export interface SettlementSearchOption {
    value: string;
    label: string;
}

export interface SettlementSearchConfig {
    type: 'simple' | 'transfer'; // simple: 날짜만, transfer: 날짜+검색조건
    searchOptions?: SettlementSearchOption[];
    showPageSize?: boolean;
}

export interface SettlementSearchData {
    startDate: string;
    endDate: string;
    searchSelect?: string;
    searchText?: string;
    pageSize: number;
}

export interface SettlementTableColumn {
    key: string;
    label: string;
    width: string;
    type?: 'text' | 'number' | 'link' | 'status' | 'checkbox' | 'highlight' | 'index';
    cssClass?: string;
    clickable?: boolean;
    excelFormat?: string;
}

export interface SettlementTableHeader {
    label: string;
    rowspan?: number;
    colspan?: number;
    type?: 'text' | 'checkbox';
    cssClass?: string;
}

export interface SettlementTableConfig {
    caption: string;
    cssClass?: string;
    columns: SettlementTableColumn[];
    headers: SettlementTableHeader[][]; // 다중 헤더 지원
}

export interface SettlementTableData {
    [key: string]: any;
}

// 가맹점 정산 데이터
export interface StoreSettlementData {
    id: string;
    title: string;
    date: string;
    status: '0' | '1' | '2'; // 0: 예정, 1: 완료, 2: 보류
}

// 파트너 정산 데이터
export interface PartnerSettlementData {
    id: string;
    title: string;
    date: string;
    status: '0' | '1' | '2';
}

// 이체 내역 데이터
export interface TransferData {
    id: string;
    senderId: string;
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    amount: string;
    fee: string;
    transferDate: string;
}

// 가맹점 정산 상세 데이터
export interface StoreSettlementDetail {
    id: string;
    storeName: string;
    tid: string;
    paymentCount: number;
    approvalCount: number;
    approvalAmount: string;
    cancelCount: number;
    cancelAmount: string;
    paymentAmount: string;
    commissionRate: string;
    settlementAmount: string;
    status: '0' | '1' | '2';
    bankName: string;
    accountNumber: string;
    accountHolder: string;
}

// 파트너 정산 상세 데이터
export interface PartnerSettlementDetail {
    id: string;
    storeName: string;
    tid: string;
    paymentAmount: string;
    commission: string;
    headquarters: {
        name: string;
        rate: string;
        amount: string;
    };
    agency: {
        name: string;
        rate: string;
        amount: string;
    };
    subAgency: {
        name: string;
        rate: string;
        amount: string;
    };
}

// 페이지네이션 데이터
export interface PaginationData {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    pageSize: number;
}

// 정산 상태 타입
export type SettlementStatus = '0' | '1' | '2';

// 정산 분류 타입
export type SettlementClassify = '0' | '1' | '2';

// 토스트 메시지 타입
export interface ToastMessage {
    message: string;
    type: 'info' | 'success' | 'error';
    visible: boolean;
}

// 검색 결과 타입
export interface SettlementSearchResult<T> {
    data: T[];
    pagination: PaginationData;
    searchParams: SettlementSearchData;
}

// 정산 액션 타입
export type SettlementAction = 'hold' | 'complete' | 'download' | 'export';

// 다운로드 타입
export type DownloadType = 'woori' | 'ibk' | 'excel';

// 정산 페이지 타입
export type SettlementPageType = 'store' | 'partner' | 'transfer' | 'store-detail' | 'partner-detail';

// 정산 모달 타입
export interface SettlementModal {
    id: string;
    title: string;
    content: string;
    visible: boolean;
}

// 정산 폼 검증 타입
export interface SettlementFormValidation {
    isValid: boolean;
    errors: {
        [key: string]: string;
    };
}

// 정산 필터 타입
export interface SettlementFilter {
    dateRange: {
        startDate: string;
        endDate: string;
    };
    searchCondition?: {
        type: string;
        value: string;
    };
    pageSize: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

// 정산 통계 타입
export interface SettlementStats {
    totalAmount: string;
    totalCount: number;
    completedCount: number;
    pendingCount: number;
    holdCount: number;
}

// 정산 설정 타입
export interface SettlementSettings {
    defaultPageSize: number;
    allowedDownloadTypes: DownloadType[];
    enableAutoRefresh: boolean;
    refreshInterval: number;
}

// 정산 이벤트 타입
export interface SettlementEvent {
    type: 'search' | 'reset' | 'page-change' | 'sort' | 'filter';
    payload: any;
    timestamp: number;
}

export default {
    SettlementSearchConfig,
    SettlementSearchData,
    SettlementTableConfig,
    SettlementTableData,
    StoreSettlementData,
    PartnerSettlementData,
    TransferData,
    StoreSettlementDetail,
    PartnerSettlementDetail,
    PaginationData,
    SettlementSearchResult,
    ToastMessage,
    SettlementModal,
    SettlementFormValidation,
    SettlementFilter,
    SettlementStats,
    SettlementSettings,
    SettlementEvent
};