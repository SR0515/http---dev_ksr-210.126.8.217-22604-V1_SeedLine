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

  export let bankListData: BankItem[] = [];
  export let bankOptions: SelectOption[] = [];


 // 은행리스트 가져오기
  export async function loadBankList(): Promise<void> {
        try {
        const response = await fetch('/api/banks');
        const json = await response.json();
        if (json.success) {
          bankListData = json.data as BankItem[];

          bankOptions = bankListData.map((bank): SelectOption => ({
            label: bank.bank_name,
            value: bank.bank_code
          }));
        } else {
          console.error('서버 오류:', json.message);
    }

        console.log('받은 데이터:', json);
        } catch (err) {
        console.error('API 호출 중 오류 발생:', err);
        }
    }