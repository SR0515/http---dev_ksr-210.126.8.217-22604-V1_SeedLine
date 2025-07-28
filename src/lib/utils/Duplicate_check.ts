import { showToast } from "$lib/stores/toast.js";

export let confirmedCatTId: string | null = null;
export let confirmedCatId: string | null = null;
export let confirmedPayKey: string | null = null;

// 중복 체크 함수
export async function checkDuplicate(type: string): Promise<void> {
  let inputElement: HTMLInputElement | null = null;
  let checkButton: HTMLElement | null = null;
  let value = "";
  let emptyMessage = "";
  let successMessage = "";
  let duplicateMessage = "";

  if (type === "user_id") {
    inputElement = document.getElementById("user_id") as HTMLInputElement;
    checkButton = document.getElementById("idCheckBtn");
    value = inputElement?.value;
    emptyMessage = " 값을 입력해주세요. ";
    successMessage = " 사용 가능합니다. ";
    duplicateMessage = " 사용중인 값입니다. ";
  } else if (type === "terminalTid") {
    inputElement = document.getElementById("terminal_Tid") as HTMLInputElement;
    checkButton = document.getElementById("tidCheckBtn");
    value = inputElement?.value;
    emptyMessage = "단말기 TID를 입력해주세요.";
    successMessage = "사용가능한 TID 입니다.";
    duplicateMessage = "사용중인 TID 입니다.";
  } else if (type === "keyinTid") {
    inputElement = document.getElementById("keyin_Tid") as HTMLInputElement;
    checkButton = document.getElementById("kitidCheckBtn");
    value = inputElement?.value;
    emptyMessage = "수기결제 TID를 입력해주세요.";
    successMessage = "사용가능한 TID 입니다.";
    duplicateMessage = "사용중인 TID 입니다.";
  } else if (type === "keyin_paykey") {
    inputElement = document.getElementById("keyin_paykey") as HTMLInputElement;
    checkButton = document.getElementById("kipaykeyCheckBtn");
    value = inputElement?.value;
    emptyMessage = " 결제키를 입력해 주세요. ";
    successMessage = " 사용가능한 키 입니다. ";
    duplicateMessage = " 사용중인 키 입니다.";
  }

  if (!value || value === "") {
    showToast(emptyMessage);
    return;
  }

  try {
    const response = await fetch(`/api/store/writeOk/duplicateCheck/${type}/${value}`);
    const result = await response.json();

    if (response.ok) {
      if (result.isDuplicated) {
        showToast(duplicateMessage);
        inputElement?.focus();
      } else {
        showToast(successMessage);
        if (checkButton) checkButton.innerText = "확인완료";

        if (type === "terminalTid") confirmedCatTId = value;
        else if (type === "keyinTid") confirmedCatId = value;
        else if (type === "keyin_paykey") confirmedPayKey = value;
      }
    } else {
      showToast("서버 오류가 발생했습니다.", "error");
      console.error("에러내용" + result.message);
    }
  } catch (error) {
    showToast("네트워크 오류가 발생했습니다.", "error");
    console.error("중복 체크 오류:", error);
  }
}

//파트너 등록 시 아이디 중복 체크
  export async function idCheck(){
        let partnerIdInput = document.getElementById("user_id")as HTMLInputElement;
        let idCheckBtn = document.getElementById("idCheckBtn")as HTMLButtonElement;
        let partnerId = partnerIdInput.value
        if (!partnerId) {
        showToast("아이디를 입력해주세요!", "warning");
        return;
        }
        try {
            const response = await fetch(`/api/partner/writeOk/partnerIdCheck/${partnerId}`);
            const result = await response.json();

        if (response.ok) {
            if (result.isDuplicated) {
                showToast("이미 사용 중인 아이디입니다.");
                partnerIdInput.focus();
            } else {
                showToast("사용 가능한 아이디입니다.");
                partnerIdInput.setAttribute("readonly", "true");
                idCheckBtn.innerText = "확인완료"
            }
        } else {
            showToast("서버 오류가 발생했습니다.", "error");
            console.log("에러내용"+result.message);
        }
        } catch (error) {
            showToast("네트워크 오류가 발생했습니다.", "error");
            console.error("중복 체크 오류:", error);
        }
    }


// 비밀번호 및 빈값 확인 함수
export function nullCheck(): void {
  const storeForm = document.getElementById("storeForm") as HTMLFormElement & {
    upperPath?: HTMLInputElement;
    upperId?: HTMLInputElement;
    store_pass?: HTMLInputElement;
    store_pass_check?: HTMLInputElement;
    store_name?: HTMLInputElement;
    store_ceo_name?: HTMLInputElement;
  };

  if (storeForm.upperPath?.value.trim() === "" || storeForm.upperId?.value.trim() === "") {
    showToast("상위 파트너와 상위 파트너 아이디를 입력해주세요.", "info");
    return;
  } else if (!storeForm.store_pass || storeForm.store_pass.value === "") {
    showToast("비밀번호를 입력해주세요!", "info");
    return;
  } else if (storeForm.store_pass.value !== storeForm.store_pass_check?.value) {
    showToast("비밀번호가 일치하지 않습니다.", "info");
    return;
  } else if (!storeForm.store_name || storeForm.store_name.value === "") {
    showToast("업체명을 입력해주세요!", "info");
    return;
  } else if (!storeForm.store_ceo_name || storeForm.store_ceo_name.value === "") {
    showToast("대표자명을 입력해주세요!", "info");
    return;
  }
}

//중복체크 확인 여부 
// export function checkDuplicateOk(){
//     let IdCheckBtn = document.getElementById("idCheckBtn").innerText;

//     let ki_TidCheckBtn = document.getElementById("kitidCheckBtn").innerText;
//     let ki_paykeyCheckBtn = document.getElementById("kipaykeyCheckBtn").innerText;
//     let keyinState = document.querySelector('input[name="keyin_state"]:checked').value;

//     let tidCheckBtn = document.getElementById("tidCheckBtn").innerText;
//     let terminalState = document.querySelector('input[name="terminal_state"]:checked').value;
//     let terminalDate = document.getElementsByName("T_catId_date")[0];

//     let terminalCommission = document.getElementById("terminalCommission").value;
//     let settlementHidden = document.getElementById("settlementCommisionHidden").value; 

//     if(IdCheckBtn !== "체크완료"){
//         showToast("아이디 중복체크를 해주세요.","info");
//         return;
//     }else if(keyinState == "0" && ki_TidCheckBtn !== "체크완료"){
//         showToast("수기결제 TID 중복체크를 해주세요.","info");
//         return;
//     }else if(keyinState == "0" && ki_paykeyCheckBtn !== "체크완료"){
//         showToast("수기결제 결제키 중복체크를 해주세요.","info");
//         return;
//     }else if(keyinState == "0" && tidCheckBtn !== "체크완료"){
//         showToast("단말기 TID 중복체크를 해주세요.","info");
//         return;
//     }else if(terminalState == "0" && terminalDate.value.trim() === ""){
//         showToast("단말기 등록일자를 입력해주세요.","info");
//         return;
//     }else if(keyinState == "0" || terminalState == "0"){
//         if(terminalCommission.trim() ===""){
//             showToast("수수료를 입력해주세요.","info");
//             return;
//         }else if(Number(terminalCommission) < Number(settlementHidden)){
//             showToast("수수료는 본사의 수수료보다 낮을 수 없습니다.","info");
//             return;
//         }
//     }
// }   
