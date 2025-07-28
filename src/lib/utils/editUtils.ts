import { showToast } from '$lib/stores/toast';
import { get } from 'svelte/store';
import type { StoreListData } from '$lib/types/store'
import type { PartnerListData } from '$lib/types/partner';
import { trusted } from 'svelte/legacy';

// 비밀번호 검증 함수
export function validatePassword(password: string, confirmPassword: string): boolean {
    if (password !== "" && confirmPassword === "") {
        showToast("비밀번호 확인을 입력해주세요.", "info");
        return false;
    }
    if (confirmPassword !== "" && password === "") {
        showToast("새 비밀번호를 입력해주세요.", "info");
        return false;
    }
    if (password !== confirmPassword) {
        showToast("비밀번호와 비밀번호 확인이 다릅니다.", "info");
        return false;
    }
    return true;
}

// 숫자만 입력 허용 함수
export function restrictToNumbers(event: Event) {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/[^0-9]/g, '');
}

// 페이지 제목 생성 함수
export function getPageTitle(role: string, rate?: string): string {
    if (role === 'partner') return '파트너';
    if (role === 'store') return '가맹점';
    return '관리';
}

// 공통 API 호출 함수
export async function fetchUserInfo(userId:string, searchCode:string, type:string): Promise<any> {
    let seacrhCode = searchCode // 가맹점은 mid, 파트너는 code
    if (!seacrhCode || !seacrhCode) {
        throw new Error('사용자 정보가 없습니다.');
    }
    let endPoint= '';
    if(type == "store"){
        endPoint = `/api/store_edit_view?mid=${searchCode}&userId=${userId}`
    }else if(type == "partner"){
        endPoint = `/api/partner_edit_view/sr_23345?code=${searchCode}`
    }
    const response = await fetch(endPoint);
    const json = await response.json();

    if (!json.success) {
        throw new Error(json.message || '데이터를 불러오는데 실패했습니다.');
    }
    return json.data;
}

//가맹점 디폴트 값 지정
export function getDefaultStoreListData(): StoreListData {
  return {
    store_basic: {
      id: '',
      store_name: '',
      store_ceo_name: '',
      store_business_number: '',
      adress: '',
      adress_detail: '',
      join_date: '',
      edit_date: '',
      login_try_cnt: 0,
      login_state: '0',
      memo: '',
      mid: '',
      upper_code: '',
      upper_path: '',
      terminal_state: '1',
      keyin_state: '1',
      "3Dpay_state": '1',
      path_notify_state: '0',
      upper_id: '',
    },
    store_wallet: {
      bank_name: '',
      account_num: '',
      account_name: '',
      T_catId: '',
      T_catId_date: '',
      ki_catId: '',
      ki_paykey: '',
      T_realtime_state: '',
      ki_realtime_state: '',
      ki_pay_limit: '',
      terminal_commission: '',
      terminal_price: '',
      settlement_cycle: '',
      transfer_tax: '',
      terminal_charge: '0',
      terminal_wireless: '1',
      cash_receipts: '0',
      duplicate_state: '1'
    },
    store_commission: {
      upper_rate: ''
    },
    settlement_commission: 0
  };
}

//파트너 디폴트 값 지정
export function getDefaultPartnerListData(): PartnerListData {
  return {
    partnerList: {
    id : '',
    rate : '',
    level_idx : '',
    name : '',
    ceo_name : '',
    contact : '',
    address : '',
    address_detail : '',
    join_date : '',
    edit_date : '',
    login_try_cnt : 0,
    login_state : '0',
    memo : '',
    code : '',
    upper_code : '',
    upper_name : '',
    upper_id: '',
    business_number : '',
    business_type : '',
    corporate_number : '',
    business_condition : '',
    business_subject : '',
    level_notify_state : '0'
    },
        walletList: {
            bank_code: '',
            bank_name: '',
            account_num: '',
            account_name: ''
        }
    }
}

//정보수정 함수
export async function editUser(role: 'partner' | 'store', data: any): Promise<boolean> {
    try {
        let endPoint = '';
        if(role === "partner"){
            endPoint = `/api/${role}/editOk/sr_23346`; //수정 필요
        }else if(role === "store"){
            endPoint = `/api/${role}/editOk/sr_23346`;
        }
        const response = await fetch(endPoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        
        if (result.success) {
            showToast("수정 완료", "info");
            return true;
        } else {
            console.error('서버 응답 오류:', result);
            showToast(`오류: ${result.message}`, "error");
            return false;
        }
    } catch (error) {
        console.error('수정 중 오류 발생:', error);
        showToast('서버 오류 발생', "error");
        return false;
    }
}

// 은행정보 수정 시 패스워드 체크
export  async function passEditCheck(userId:string,classify:string,password: string){
    try{
        const payload = {
            userId,
            password,
            classify
        };

        const response = await fetch('/api/store/editOk/passCheck', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
        });
        const result = await response.json();
        if(result.data == true){
            showToast('확인되었습니다.',"info")

            const accountNum = document.getElementById("account_num") as HTMLInputElement;
            const accountName = document.getElementById("account_name") as HTMLInputElement;
            const bankEditBtn = document.getElementById("bank_edit_btn") as HTMLButtonElement;
            closeBankPassCheck();
            if (accountNum) accountNum.readOnly = false;
            if (accountName) accountName.readOnly = false;
            if (bankEditBtn) {
                bankEditBtn.innerText = "확인완료";
                bankEditBtn.disabled = true;
            }
            return false;
        }else{
            showToast('비밀번호가 틀렸습니다.',"info")
        }

        }catch (err) {
        console.error('API 호출 중 오류 발생:', err);
        }
        return true;
    }

//은행 패스워드 확인 모달
export function showBankPassCheck(): void{
    const div =  document.getElementById("pass_check_modal")as HTMLDivElement
    div.style.display="block";
}
export function closeBankPassCheck(): void{
    const div =  document.getElementById("pass_check_modal")as HTMLDivElement
    div.style.display="none";
}