import { showToast } from '$lib/stores/toast';
import { authStore } from '$lib/stores/auth';
import { get } from 'svelte/store';

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

//파트너 리스트 함수
export async function partnerList(
    partnerUpperRate:string,
    user_id: string,
    page: number = 1,
    pageSize: number = 10,
    rate: string,
    classify:string
) {
    try {
        const params = new URLSearchParams({
            partnerUpperRate:partnerUpperRate?? '',
            userId : user_id,
            classify: classify,
            rate : rate, //접속한 계정의 등급
            page: page.toString(),  // 현재 페이지를 API에 전달
            page_size: pageSize.toString(), // 페이지 크기
        });
        let endPoint
        if(partnerUpperRate !== ''){
            endPoint = '/api/partner/writeOk/partnerListCheck/sr_23346?'
        }else{
            endPoint = '/api/store/writeOk/partnerListCheck/sr_23346?'
        }
        const response = await fetch(endPoint + params.toString());
        const json = await response.json();
        if (json.success) {
            return {
                data: json.data,
                pagination: json.pagination
            };
        } else {
            throw new Error(json.message);
        }
        } catch (error) {
            console.error('로그 데이터 조회 실패:', error);
            const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
            showToast(`로그 데이터를 불러올 수 없습니다: ${errorMessage}`, 'error');
            
            // 기본 빈 데이터 반환으로 앱이 중단되지 않게 함
            return {
                data: [],
                pagination: {
                    totalCount: 0,
                    currentPage: 1,
                    totalPages: 0,
                    pageSize: 10
                }
            };
        }
}

// 페이지네이션 계산
export function calculatePagination(currentPage: number, totalPages: number) {
    const startPage = Math.floor((currentPage - 1) / 10) * 10 + 1;
    const endPage = Math.min(startPage + 9, totalPages);
    
    return { startPage, endPage };
}

// 가맹점 등록 라디오 버튼 클릭 시 상태 변경 함수
export function toggleInputVisibility(): void {
  const store_edit_row = document.getElementById("store_edit_row");
  const keyinStateInput = document.querySelector<HTMLInputElement>('input[name="keyin_state"]:checked');
  const tidInput = document.getElementById("keyin_Tid") as HTMLInputElement | null;
  const payKeyInput = document.getElementById("keyin_paykey") as HTMLInputElement | null;

  const terminalStateInput = document.querySelector<HTMLInputElement>('input[name="terminal_state"]:checked');
  const tertidtitle = document.getElementById("tertidtitle");
  const terminal_Tid = document.getElementById("terminal_Tid") as HTMLInputElement | null;
  const terminalDateInput = document.getElementsByName("T_catId_date")[0] as HTMLInputElement | undefined;
  const terminalpriceInput = document.getElementsByName("terminal_price")[0] as HTMLInputElement | undefined;

  const DDDpayStateInput = document.querySelector<HTMLInputElement>('input[name="DDDpay_state"]:checked');
  const commissionWrapper = document.getElementById("commissionWrapper");
  const terminal_setWrapper = document.getElementById("terminal_setWrapper");

  // 필수 엘리먼트 null 체크 (필요 시 적절히 조절)
  if (!store_edit_row || !keyinStateInput || !tidInput || !payKeyInput
      || !terminalStateInput || !tertidtitle || !terminal_Tid
      || !terminalDateInput || !terminalpriceInput
      || !DDDpayStateInput || !commissionWrapper || !terminal_setWrapper) {
    console.warn("필요한 DOM 요소가 존재하지 않습니다.");
    return;
  }

  const keyinState = keyinStateInput.value;
  const terminalState = terminalStateInput.value;
  const DDDpayState = DDDpayStateInput.value;

  // 수기결제 상태 처리
  if (keyinState === "1") {  // "미사용" 선택 시
    tidInput.value = '';
    payKeyInput.value = '';
    store_edit_row.style.visibility = "hidden";
  } else {  // "사용" 선택 시
    store_edit_row.style.visibility = "visible";
  }

  // 단말기 상태 처리
  if (terminalState === "1") {  // "미사용" 선택 시
    tertidtitle.hidden = true;
    terminal_setWrapper.hidden = true;
    terminalDateInput.required = false;
    terminalpriceInput.required = false;

    terminal_Tid.value = '';
    terminalDateInput.value = '';
  } else {  // "사용" 선택 시
    tertidtitle.hidden = false;
    terminal_setWrapper.hidden = false;
    terminalDateInput.required = true;
    terminalpriceInput.required = true;
  }

  // 수수료 입력란 표시 여부
  commissionWrapper.hidden = (keyinState === "1" && terminalState === "1" && DDDpayState === "1");
}

//정보 등록
export async function writeUser(role: 'partner' | 'store', data: any): Promise<boolean> {
    try {
        let endPoint = '';
        if(role === "partner"){
            endPoint = `/api/${role}/writeOk/sr_23346`;
        }else if(role === "store"){
            endPoint = `/api/${role}/writeOk`;
        }
        const response = await fetch(endPoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        
        if (result.success) {
            showToast("등록 완료", "info");
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

//가맹점 등록 시 중복체크 확인 함수
export function validateForm(pageType:string): string | null {
        const terminalCommission = (document.getElementById("terminal_commission") as HTMLInputElement)?.value; 
        const settlementCommisionHidden = (document.getElementById("settlementCommisionHidden") as HTMLInputElement)?.value;
        const keyinState = (document.querySelector('input[name="keyin_state"]:checked') as HTMLInputElement)?.value;
        const terminalState = (document.querySelector('input[name="terminal_state"]:checked') as HTMLInputElement)?.value;
        const store_pass = document.getElementById("store_pass") as HTMLInputElement;
        const store_pass_check = document.getElementById("store_pass_check") as HTMLInputElement;
        const kitidCheckBtn = (document.getElementById("kitidCheckBtn") as HTMLElement)?.innerText;
        const kipaykeyCheckBtn = (document.getElementById("kipaykeyCheckBtn") as HTMLElement)?.innerText;
        const tidCheckBtn = (document.getElementById("tidCheckBtn") as HTMLElement)?.innerText;
        const T_catId_date = document.getElementById("T_catId_date") as HTMLInputElement;

        // 안전성 검사
        if(pageType == "Write"){
            if (!store_pass || !store_pass_check) return "비밀번호 입력란 오류";
            if (store_pass.value !== store_pass_check.value) return "비밀번호 확인이 일치하지 않습니다.";
        }
        if (keyinState === '0' && kitidCheckBtn !== "확인완료") return "수기결제 TID 중복체크를 해주세요";
        if (keyinState === '0' && kipaykeyCheckBtn !== "확인완료") return "수기결제 결제키 중복체크를 해주세요";
        if (terminalState === '0' && tidCheckBtn !== "확인완료") return "단말기 TID 중복체크를 해주세요";
        if (terminalState === '0' && T_catId_date?.value === '') return "단말기 등록일자를 입력해 주세요";
        
        if (keyinState === '0' || terminalState === '0') {
            if (!terminalCommission || terminalCommission.trim() === "") {
                return "수수료를 입력해 주세요";
            } else if (Number(terminalCommission) < Number(settlementCommisionHidden)) {
                return "수수료는 본사의 수수료보다 낮을 수 없습니다.";
            }
        }
        return null;
    }

