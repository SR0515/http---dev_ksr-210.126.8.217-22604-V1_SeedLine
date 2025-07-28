// 파트너리스트 데이터 타입
export type PartnerItem = {
    id: string;
    code: string;
    name: string;
    ceo_name: string;
    contact: string;
    join_date: string;
    rate: string;
    upper_code: string;
    upper_name: string;
};

// 상위업체 데이터 타입
export type upperInfosItem = {
    upper_name: string;
    upper_code: string;
    id: string;
};