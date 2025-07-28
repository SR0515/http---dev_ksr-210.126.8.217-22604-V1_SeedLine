// 가맹점 리스트 데이터 타입
export type StoreListData = {
    store_basic:{
        id: string;
        store_name: string;
        store_ceo_name: string;
        store_business_number: string;
        adress: string;
        adress_detail : string;
        join_date: string;
        edit_date: string;
        login_try_cnt: number;
        login_state: string;
        memo: string;
        mid: string;
        upper_code: string;
        upper_path: string;
        terminal_state: string;
        keyin_state: string;
        "3Dpay_state": string;
        path_notify_state: string;
        upper_id: string;
    },
    store_wallet: {
        bank_name: string;
        account_num: string;
        account_name: string;
        T_catId : string;
        T_catId_date: string;
        ki_catId: string;
        ki_paykey: string;
        T_realtime_state: string;
        ki_realtime_state: string;
        ki_pay_limit: string;
        terminal_commission: string;
        terminal_price: string;
        settlement_cycle: string;
        transfer_tax: string;
        terminal_charge: string;
        terminal_wireless:string;
        cash_receipts:string;
        duplicate_state:string;
    },
    store_commission: {
        upper_rate: string;
    },
    settlement_commission: number;
}


export interface ListPaginationData {
    totalCount: number;
    currentPage: number;
    totalPages: number;
    pageSize: number;
}

export interface ListSearchParams {
    searchSelect: string;
    searchText: string;
    startDate: string;
    endDate: string;
}

// 단말기 공통 검색 파라미터 타입
export interface ListTerminalSearchParams {
    searchSelect?: string;
    searchText?: string;
}

// 1년경과 단말기 데이터 타입
export type TerminalExpirydateData = {
    id: string;
    mid: string;
    store_name: string;
    store_ceo_name: string;
    store_contact: string | null;
    join_date: string;
    login_state: string;
    edit_date: string | null;
    upper_path: string;

    store_commission_table: {
        id: string;
        store_catid: string;
        upper_path: string;
        upper_code: string;
        upper_rate: string;
    },

    StoreWallets: {
        T_catId_date: string;
        bank_name: string;
        account_num: string;
        account_name: string;
        mid: string;
    };
};

// 장기미사용 단말기 데이터 타입
export type TerminalInactiveData = { 
    T_catId: string;
    T_catId_date: string;       
    id: string;                 
    login_state: string;       
    lst_pt_date: string;        
    mid: string;                
    name: string;               
    store_ceo_name: string;    
    store_contact: string | null; 
};