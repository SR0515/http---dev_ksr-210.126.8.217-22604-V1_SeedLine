// 은행정보 타입
export type BankItem = {
  idx: number;
  bank_code: string;
  bank_name: string;
  image_path: string;
};

// 선택 옵션 타입
export type SelectOption = {
    label: string;
    value: string;
};