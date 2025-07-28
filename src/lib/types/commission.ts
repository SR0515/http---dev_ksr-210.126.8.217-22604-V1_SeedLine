// 가맹점 수수료 데이터 타입 정의
export type RawStoreData = {
    id: number | string;
    store_name: string;
    upper_path?: string;
    terminal_C?: string | number;
    store_wallet?: {
        terminal_commission?: string | number;
    };
    store_basic_info?: {
        join_date?: string;
    };
    store_commission_edit_logs?: {
        edit_date?: string;
    }[];
    [key: string]: any; // prime_* 필드를 허용
};

// 각 단계별 수수료
export interface MerchantLevel {
  name: string;
  commission: number;
}

// 가맹점 전체 수수료 카드 정보
export interface MerchantData {
  id: string | number;
  name: string;
  status: string ;
  totalCommission: number;
  hasCommission: boolean;
  hierarchy: MerchantLevel[];
  merchantCommission: number;
  createdDate: string;
  lastUpdated: string;
}

// 가맹점 수수료 검색 파라미터 타입
export interface CommissionSearchParams {
    searchSelect: string;
    searchText: string;
};