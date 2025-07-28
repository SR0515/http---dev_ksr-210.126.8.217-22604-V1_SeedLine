//파트너 리스트 데이터 타입
export type PartnerListData = {
    partnerList:{
    id : string;
    rate : string;
    level_idx : number | "";
    name : string;
    ceo_name : string;
    contact : string;
    address : string;
    address_detail : string;
    join_date : string;
    edit_date : string;
    login_try_cnt : number;
    login_state : string;
    memo : string;
    code : string;
    upper_code : string;
    upper_name : string;
    upper_id: string;
    business_number : string;
    business_type : string;
    corporate_number : string;
    business_condition : string;
    business_subject : string;
    level_notify_state : string;
    }
    walletList: {
        bank_code: string;
        bank_name: string;
        account_num: string;
        account_name: string;
    }
}

export interface ListPaginationData {
    totalCount: number;
    currentPage: number;
    totalPages: number;
    pageSize: number;
}


// 파트너 시스템 
export type Level = { 
    idx: number;
    partner_name: string;
    order: number;
}

// 파트너 권한 데이터 타입
export interface Permissions {
  [key: string]: {
    view: boolean;
    edit: boolean;
    commission: boolean;
  };
}

// 개별 정보 타입
export type SpecialPathInfo = {
  targetLevel?: number;  
};

// 숫자 키를 갖는 객체 타입
export type SpecialPaths = {
  [key: number]: SpecialPathInfo;
};


// 제네릭 데이터 타입
export interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data: T;
    totalCount?: number;
}

// 파트너 세팅 데이터
export type PartnerSettingData = {  
    idx: number;
    partner_name: string;
    partner_path: string;
    rate: string;
    upper_path: string;
    upper_rate: string;
    view_permission: string;      
    edit_permission: string;       
    commission_permission: string; 
    use_special_path: string;      
    create_date: string;           
    edit_date: string | null;      
}

// 렌더링 대상 파트너 UI 타입
export type LevelPartner = {
  id: number;
  order: number;
  name: string;
  levelId: number;
  path: string;
  status: 'active' | 'inactive'; // 또는 string 가능
};