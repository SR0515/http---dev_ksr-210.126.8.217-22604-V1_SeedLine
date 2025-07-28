// 결제내역 데이터 타입 정의
export type PaymentListData = {
    Ki_catId: string; 
    Name: string; 
    T_catId: string;
    amt: string; 
    appCardCd: string;
    appDtm: string;
    appNo: string;
    buyerId: string;
    cancelYN: string; // "Y" : 취소 / "N" : 승인 
    cardNo: string;
    cardco: string | null;
    card_name: string;
    catId: string;
    ccDnt: string | "";
    check_dupli_state: number;
    connCd: string | null;
    dupli_state: number;
    ediNo: string;
    fnNm: string | null;
    gid: string | null;
    goodsName: string;
    gxcard: {
        card_name: string;
    };
    hyphen_state: string | null;
    idx: number;
    kwon_state: string | null;
    mid: string;
    notiDnt: string;
    ordNm: string;
    ordNo: string;
    payMethod: string;
    pay_type: string;
    quota: string;
    realtimeSettlement: string | null;
    remainAmt: string | null;
    result_type: string;
    settlement_date: string | null;
    settlement_state: string;
    storeWalletKi: string | null;
    storeWalletT: string | null;
    success_state: string;
    tPhone: string | null;
    tid: string;
    vid: string | null;
}

// 통계 데이터 객체
export interface PaymentStats {
  [key: string]: number;
}

export interface PaymentListResponse {
  data: PaymentListData[];
  totalStats: PaymentStats;
  pagination: {
    totalCount: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  };
};

// 검색 조건 인터페이스
export interface PaymentSearchParams {
  searchSelect?: string;
  searchText?: string;
  pgSelect?: string;
  cancelSelect?: string;
  startDate?: string;
  endDate?: string;
}

// 결제취소 데이터 타입 정의
export type PayType = string; // 수기결제: "1", 인증결제: "4"
export type CancelState = string; 

export interface CancelResponse {
  success: boolean;
  message?: string;
}

// 매출내역
export interface SalesSearchParams {
  searchSelect?: string;
  searchText?: string;
  cancelYN?: string;
  startDate?: string;
  endDate?: string;
}

export type SalesListData = { 
  T_catId?: string;
  Ki_catId?: string;
  [key: string]: any;
}

export interface SalesListResponse {
  data: SalesListData[];
  totalStats: PaymentStats;
  pagination: {
    totalCount: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  };
}