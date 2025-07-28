// 로그 데이터 타입 정의
export interface BaseLogData {
    id: string;
    name: string;
    date: string;
    ip: string;
    browser: string;
    url: string;
}

export interface LoginLogData extends BaseLogData {
    type: string;
    rate: string;
    login_status: string;
    fail_detail?: string;
}

export interface EditLogData {
    id: string;
    name: string;
    type: string;
    classify: string;
    rate: string;
    edit_column: string;
    pre_value: string;
    to_value: string;
    editor_id: string;
    editor_ip: string;
    editor_browser: string;
    url: string;
    edit_date: string;
}

export interface CommissionLogData {
    store_id: string;
    store_name: string;
    store_catid: string;
    pre_prime_AC: string;
    to_prime_AC: string;
    pre_prime_BC: string;
    to_prime_BC: string;
    pre_prime_CC: string;
    to_prime_CC: string;
    pre_prime_C: string;
    to_prime_C: string;
    editor_name: string;
    editor_ip: string;
    editor_browser: string;
    url: string;
    edit_date: string;
}

export interface SettlementLogData {
    settle_date: string;
    store_catid: string;
    store_name: string;
    pre_value: string;
    to_value: string;
    editor_name: string;
    editor_ip: string;
    editor_browser: string;
    url: string;
    edit_date: string;
}

export interface LogSearchParams {
    searchSelect: string;
    searchText: string;
    typeSelect?: string;
    startDate: string;
    endDate: string;
}

export interface LogPaginationData {
    totalCount: number;
    currentPage: number;
    totalPages: number;
    pageSize: number;
}

export interface LogApiResponse<T> {
    success: boolean;
    data: T[];
    pagination: LogPaginationData;
    message?: string;
}

export type LogType = 'LoginLog' | 'EditLog' | 'S_commission_log' | 'S_settlement_log';

export interface SearchOption {
    value: string;
    label: string;
}

export interface StatusLabel {
    text: string;
    className: string;
}