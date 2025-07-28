<script lang="ts">
    import {adminDistributorAccess} from "$lib/utils/accessControl";
    import {onMount} from "svelte";
    import LeftMenu from "$lib/components/LeftMenu.svelte";
    import Toast from "$lib/components/Toast.svelte";
    import {showToast} from "$lib/stores/toast.js";
    import {navigateTo} from "$lib/stores/navigation.js";
    import {checkDuplicate} from "$lib/utils/Duplicate_check";
    import { goto } from '$app/navigation';
    import type { BankItem, SelectOption } from '$lib/types/bank';
    import type { PartnerItem, upperInfosItem } from '$lib/types/store';
    import Select from 'svelte-select';

    let classify = localStorage.getItem("classify");
    let rate = localStorage.getItem("user_rate")
    let user_id = localStorage.getItem("user_id");

    let clientIP = ""; // 공인 IP

    let bankListData: BankItem[] = [];
    let selectedBank: SelectOption | null = null;
    let partnerData: PartnerItem[] = [];
    let upperInfos: upperInfosItem = {
        upper_name: '',
        upper_code: '',
        id: ''
    };

    let settlement_commission = 0;

    //페이지네이션
	let currentPage = 1;
	let totalPages = 1;
	let totalCount = 0;

    var page_size = 5;     

    // 페이지 변경 - 페이지네이션
	function changePage(page: number) {
		if (page < 1 || page > totalPages) return;
		currentPage = page;
		partnerList();
	}

    // 페이지네이션 범위 계산
	$: startPage = Math.floor((currentPage - 1) / 10) * 10 + 1;
	$: endPage = Math.min(startPage + 9, totalPages);
	$: pageNumbers = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);

    function closePopup() {
        const modal = document.getElementById("check_upper_modal");
        if (modal) {
            modal.style.display = "none";
        }
    }

    function showModal() {
        const modal = document.getElementById("check_upper_modal");
        if (modal) {
            modal.style.display = "block";
            partnerList();
        }
    }

    //모달 파트너 데이터 넣기
    function inserttext(
        upper_path: string,
        upper_code: string,
        upper_id: string,
        upper_rate: string
        ): void {
        const pathInput = document.getElementById("upper_path") as HTMLInputElement | null;
        const codeInput = document.getElementById("upper_code") as HTMLInputElement | null;
        const idInput = document.getElementById("upper_id") as HTMLInputElement | null;
        const rateInput = document.getElementById("upper_rate") as HTMLInputElement | null;
        const modal = document.getElementById("check_upper_modal");

        if (pathInput) pathInput.value = upper_path;
        if (codeInput) codeInput.value = upper_code;
        if (idInput) idInput.value = upper_id;
        if (rateInput) rateInput.value = upper_rate;
        if (modal) modal.style.display = "none";
    }

    function address(): void {
        const addressBtn = document.getElementById("address_kakao");
        const coperInput = document.getElementById("coper_address") as HTMLInputElement | null;

        // 버튼 클릭 시 주소 API 열기
        if (addressBtn) {
            addressBtn.addEventListener("click", () => {
                if (typeof window !== 'undefined' && window.daum?.Postcode) {
                    new window.daum.Postcode({
                        oncomplete: (data: { address: string }) => {
                            if (coperInput) coperInput.value = data.address;

                            const detailInput = document.querySelector("input[name=coper_address_details]") as HTMLInputElement | null;
                            if (detailInput) detailInput.focus();
                        }
                    }).open();
                } else {
                    showToast("주소 API가 아직 로드되지 않았습니다.", "error");
                }
            });
        }

        // 주소 입력창 클릭 시에도 주소 API 열기
        if (coperInput) {
            coperInput.addEventListener("click", () => {
                if (typeof window !== 'undefined' && window.daum?.Postcode) {
                    new window.daum.Postcode({
                        oncomplete: (data: { address: string }) => {
                            coperInput.value = data.address;

                            const detailInput = document.querySelector("input[name=coper_address_details]") as HTMLInputElement | null;
                            if (detailInput) detailInput.focus();
                        }
                    }).open();
                } else {
                    showToast("주소 API가 아직 로드되지 않았습니다.", "error");
                }
            });
        }
    }

    // 은행리스트 가져오기
    async function loadBankList() {
        try {
        const response = await fetch('/api/banks');
        const json = await response.json();
        if (json.success) {
          bankListData = json.data.map((bank: BankItem): SelectOption => ({
          label: bank.bank_name,  // 또는 bank.bank_name 등 실제 필드명
          value: bank.bank_code   // 또는 bank.bank_code
        }));
        } else {
            console.error('서버 오류:', json.message);
        }

        console.log('받은 데이터:', json);
        } catch (err) {
        console.error('API 호출 중 오류 발생:', err);
        }
    }

    // 파트너가 등록할 경우 상위업체 정보, 수수료 가져오기
    async function upperInfo() {
    try {
        const params = new URLSearchParams({
            classify: classify ?? '',
            rate : rate ?? '',
            userId : localStorage.getItem("user_id") ?? ''
        });

        const response = await fetch('/api/store/writeOk/upperInfo?' + params.toString());
        const json = await response.json();
        if (json.success) {
            upperInfos = json.data.upperInfo;
            settlement_commission = json.data.settlement_commission || 0;
        } else {
            console.error('서버 오류:', json.message);
        }

        console.log('받은 데이터22:', json);
        } catch (err) {
        console.error('API 호출 중 오류 발생:', err);
        }
    }

    //수수료입력
    function terminalCheck() {
        const terminal_commission = document.getElementById('terminal_commission') as HTMLInputElement | null;
        if (!terminal_commission) return; 

        const value = Number(terminal_commission.value);

        if (value < 0) {
            terminal_commission.value = '0';
        } else if (value > 100) {
            terminal_commission.value = '100';
        }
    }

    //파트너 리스트 가져오기
    //만약에 파트너 등급이 등록하면.. 나~하위까지 보여야함
    async function partnerList() {
        try {
            const params = new URLSearchParams({
                userId : user_id ?? '',
                classify: classify ?? '',
                rate : rate ?? '', //접속한 계정의 등급
                currentpage: currentPage.toString(),
                page: currentPage.toString(),  // 현재 페이지를 API에 전달
                page_size: page_size.toString(), // 페이지 크기
            });

            const response = await fetch('/api/store/writeOk/partnerListCheck/sr_23346?' + params.toString());
            const json = await response.json();
            if (json.success) {
                partnerData = json.data;

                totalCount = json.pagination.totalCount;
                totalPages = Math.ceil(totalCount / page_size);  // 총 페이지 수 계산
            } else {
                console.error('서버 오류:', json.message);
            }

            console.log('받은 데이터:', json);
        } catch (err) {
            console.error('API 호출 중 오류 발생:', err);
        }
    }

    function validateForm() {
        let terminalCommissionElem = document.getElementById("terminal_commission") as HTMLInputElement | null;
        let settlementCommisionHiddenElem = document.getElementById("settlementCommisionHidden") as HTMLInputElement | null;
        let keyinStateElem = document.querySelector('input[name="keyin_state"]:checked') as HTMLInputElement | null;
        let terminalStateElem = document.querySelector('input[name="terminal_state"]:checked') as HTMLInputElement | null;
        let storePassElem = document.getElementById("store_pass") as HTMLInputElement | null;
        let storePassCheckElem = document.getElementById("store_pass_check") as HTMLInputElement | null;
        let kitidCheckBtn = document.getElementById("kitidCheckBtn")?.innerText ?? "";
        let kipaykeyCheckBtn = document.getElementById("kipaykeyCheckBtn")?.innerText ?? "";
        let tidCheckBtn = document.getElementById("tidCheckBtn")?.innerText ?? "";
        let T_catId_dateElem = document.getElementById("T_catId_date") as HTMLInputElement | null;

        // 널 체크
        if (!storePassElem || !storePassCheckElem) return "비밀번호 입력란이 없습니다.";
        if (!terminalCommissionElem || !settlementCommisionHiddenElem) return "수수료 입력란이 없습니다.";
        if (!keyinStateElem || !terminalStateElem) return "상태 선택란이 없습니다.";
        if (!T_catId_dateElem) return "단말기 등록일자 입력란이 없습니다.";

        if (storePassElem.value !== storePassCheckElem.value) return "비밀번호 확인이 일치하지 않습니다.";
        if (keyinStateElem.value === '0' && kitidCheckBtn !== "확인완료") return "수기결제 TID 중복체크를 해주세요";
        if (keyinStateElem.value === '0' && kipaykeyCheckBtn !== "확인완료") return "수기결제 결제키 중복체크를 해주세요";
        if (terminalStateElem.value === '0' && tidCheckBtn !== "확인완료") return "단말기 TID 중복체크를 해주세요";
        if (terminalStateElem.value === '0' && T_catId_dateElem.value === '') return "단말기 등록일자를 입력해 주세요";

        if (keyinStateElem.value === '0' || terminalStateElem.value === '0') {
            if (terminalCommissionElem.value.trim() === "") {
                return "수수료를 입력해 주세요";
            } else if (Number(terminalCommissionElem.value) < Number(settlementCommisionHiddenElem.value)) {
                return "수수료는 본사의 수수료보다 낮을 수 없습니다.";
            }
        }

        return null;
    }

    // 라디오 버튼 클릭 시 상태 변경 함수
    function toggleInputVisibility() {
        const store_edit_row = document.getElementById("store_edit_row");
        const keyinState = document.querySelector('input[name="keyin_state"]:checked') as HTMLInputElement | null;
        const tidInput = document.getElementById("keyin_Tid") as HTMLInputElement | null;
        const payKeyInput = document.getElementById("keyin_paykey") as HTMLInputElement | null;

        const terminalState = document.querySelector('input[name="terminal_state"]:checked') as HTMLInputElement | null;
        const tertidtitle = document.getElementById("tertidtitle");
        const terminal_Tid = document.getElementById("terminal_Tid") as HTMLInputElement | null;
        const terminalDateInput = document.getElementsByName("T_catId_date")[0] as HTMLInputElement | undefined;
        const terminalpriceInput = document.getElementsByName("terminal_price")[0] as HTMLInputElement | undefined;

        const DDDpayState = document.querySelector('input[name="DDDpay_state"]:checked') as HTMLInputElement | null;
        const commissionWrapper = document.getElementById("commissionWrapper");
        const terminal_setWrapper = document.getElementById("terminal_setWrapper");

        const keyinStateValue = keyinState?.value || "";
        const terminalStateValue = terminalState?.value || "";
        const DDDpayStateValue = DDDpayState?.value || "";

        // 수기결제 상태 처리
        if (keyinStateValue === "1") {  // "미사용" 선택 시
            if (tidInput) tidInput.value = '';
            if (payKeyInput) payKeyInput.value = '';
            if (store_edit_row) store_edit_row.style.visibility = "hidden";
        } else {  // "사용" 선택 시
            if (store_edit_row) store_edit_row.style.visibility = "visible";
        }

        // 단말기 상태 처리
        if (terminalStateValue === "1") {  // "미사용" 선택 시
            if (tertidtitle) tertidtitle.hidden = true;
            if (terminal_setWrapper) terminal_setWrapper.hidden = true;
            if (terminalDateInput) terminalDateInput.required = false;
            if (terminalpriceInput) terminalpriceInput.required = false;
            if (terminal_Tid) terminal_Tid.value = '';
            if (terminalDateInput) terminalDateInput.value = '';
        } else {  // "사용" 선택 시
            if (tertidtitle) tertidtitle.hidden = false;
            if (terminal_setWrapper) terminal_setWrapper.hidden = false;
            if (terminalDateInput) terminalDateInput.required = true;
            if (terminalpriceInput) terminalpriceInput.required = true;
        }

        // 수수료 입력란 표시 여부
        if (commissionWrapper) {
            commissionWrapper.hidden = (keyinStateValue === "1" && terminalStateValue === "1" && DDDpayStateValue === "1");
        }
    }

    //가맹점 등록 정보 전송
    async function storeWrite(e: Event){
        e.preventDefault();
        const validationMessage = validateForm();

        if (validationMessage) {
            showToast(validationMessage, "warning");
            return;
        }
        const idCheck = document.getElementById("idCheckBtn")?.innerText ?? "";
        const store_Id_Input = document.getElementById("user_id") as HTMLInputElement | null; // DOM 요소

        if (!store_Id_Input) {
            showToast("ID 입력 요소가 없습니다.", "error");
            return;
        }
        const store_Id = store_Id_Input.value; // 값

        if(idCheck !=='확인완료' && !store_Id_Input.hasAttribute('readonly')){
            showToast("ID 중복확인을 해주세요.","info");
            return;
        }

        const form = document.getElementById("storeForm") as HTMLFormElement | null;

        if (!form) {
            showToast("폼을 찾을 수 없습니다.", "error");
            return;
        }
        
        classify = classify
        const userId = localStorage.getItem("user_id");
        const bank_code = form.bank_select.value;
        const storeData = {
            id : form.store_id.value,
            pass : form.store_pass.value,
            upper_path_value : form.upper_path.value, //상위업체 경로
            upper_rate : form.upper_rate.value, //상위업체 등급 
            upper_id : form.upper_id.value, //상위업체 아이디
            upper_code : form.upper_code.value, //상위업체 코드
            store_name : form.store_name.value,
            store_ceo_name : form.store_ceo_name.value,
            adress : form.coper_address.value,
            adress_detail : form.coper_address_details.value,
            store_business_number : form.store_business_number.value,
            login_state : form.login_state.value  
        }
        var T_realtime_check;
        var realtime_check;
        if(form.T_realtime_check.checked){
            T_realtime_check = 1;    
        }else{
            T_realtime_check = 0;
        }
        if(form.realtime_check.checked){
            realtime_check = 1;    
        }else{
            realtime_check = 0;
        }
        const storeWalletData = {
            name : form.store_name.value,
            account_num : form.account_num.value,
            account_name : form.account_name.value,
            keyin_state : form.keyin_state.value,              //수기결제 사용여부
            ki_realtime_state : realtime_check,             //수기결제 실시간여부
            ki_catId : form.keyin_tid.value,                // 수기결제 tid
            ki_paykey : form.keyin_paykey.value,            //키인결제 결제키

            terminal_state : form.terminal_state.value, //단말기 사용여부
            T_realtime_state : T_realtime_check, //단말기 실시간 사용여부
            DDDpay_state: form.DDDpay_state.value, // 인증결제 사용여부
            T_catId : form.terminal_Tid.value , //단말기 TID
            T_catId_date : form.T_catId_date.value? form.T_catId_date.value : '',
            terminal_commission : form.terminal_commission.value,//결제수수료
            terminal_charge : form.terminal_charge.value ,//단말기 통신부담
            terminal_price : form.terminal_price.value, //단말기 통신비
            terminal_wireless : form.terminal_wireless.value, //단말기 유/무선
            cash_receipts : form.cash_receipts.value, //현금영수증 유/무
            duplicate_state: form.duplicate_use.value //중복결제 확인 유/무
        }

        const storeCommissionData  = {
            partner_id : form.store_id.value,
            upper_rate : form.upper_rate.value, //상위업체 등급 
            terminal_C : form.terminal_commission.value,//결제수수료
            store_name : form.store_name.value
        }

        const editLogData = {
        ip : clientIP,
        browser : navigator.userAgent,
        userId : userId
        };
        
            const payload = {
            userId,
            bank_code,
            classify, 
            storeData,
            storeWalletData,
            storeCommissionData,
            editLogData
            };
        try {
            const response = await fetch('/api/store/writeOk', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
            });

            const result = await response.json();
            if (result.success) {
            showToast('가맹점 등록 성공',"info")
            setTimeout(() => {
                if (classify === "0"){
                    navigateTo('/test/commission'); // 페이지 이동
                }
                else if (classify === "1")
                    navigateTo('/store/list'); // 페이지 이동
            }, 1500); 
            } else {
                console.error('서버 응답 오류:', result);
                alert(`오류: ${result.message}\n에러: ${result.error}`);
            }
        } catch (error) {
            console.error('등록 중 오류 발생:', error);
            console.log("등록 중 오류 발생:", error);
            alert('서버 오류 발생');
        }
    }
    
    onMount(() => {
          // ✅ 공인 IP 조회 (백그라운드에서 비동기 처리)
        fetch('https://api.ipify.org?format=json')
        .then(res => res.json())
        .then(data => {
            clientIP = data.ip;
        })
        .catch(err => {
            console.error('IP 조회 실패:', err);
        });

        loadBankList();
        address();
        if (!window.daum?.Postcode) {
            const script = document.createElement('script');
            script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
            script.async = true;
            document.body.appendChild(script);
        }

        if(classify == "1"){
            upperInfo();
        }
        const editableFields = [
        { inputId: "user_id", buttonId: "idCheckBtn" },
        { inputId: "terminal_Tid", buttonId: "tidCheckBtn" },
        { inputId: "keyin_paykey", buttonId: "kipaykeyCheckBtn" },
        { inputId: "keyin_Tid", buttonId: "kitidCheckBtn" },
        ];

        editableFields.forEach(({ inputId, buttonId }) => {
        const inputEl = document.getElementById(inputId);
        const buttonEl = document.getElementById(buttonId);

        if (inputEl && buttonEl) {
            inputEl.addEventListener("click", () => {
            inputEl.removeAttribute("readonly");
            buttonEl.innerText = "중복확인";
            });
        }
        });

        // 초기 상태 설정
        toggleInputVisibility();

        // 라디오 버튼에 클릭 이벤트 리스너 추가
        document.getElementById("keyinState_0")?.addEventListener("change", toggleInputVisibility);
        document.getElementById("keyinState_1")?.addEventListener("change", toggleInputVisibility);

        document.getElementById("terminalState_0")?.addEventListener("change", toggleInputVisibility);
        document.getElementById("terminalState_1")?.addEventListener("change", toggleInputVisibility);

        document.getElementById("DDDpayState_0")?.addEventListener("change", toggleInputVisibility);
        document.getElementById("DDDpayState_1")?.addEventListener("change", toggleInputVisibility);

    });
 
</script>

<Toast /> 
<LeftMenu/>
<div id="page_contect" class="">
    <section>
        <h5 style="float:left; margin-right:10px;" > 정보등록</h5> 
        <span style="float:left; margin-right:10px;" > - </span>
        <h5> 가맹점 </h5>  
    </section>
      
    <section class="sub_box"> 
        <form id="storeForm" method="post" on:submit|preventDefault={storeWrite}>
            <!-- 기본정보 -->
            <h3>기본정보</h3>
            <div class="agency_form border-bottom">        
                <div class="d-flex">
                    <dl class="col-12 col-lg-6">
                        <dt>상위 파트너</dt>
                        <dd>
                            <div class="form_input">
                                {#if classify === "0" || classify === "1"}
                                    <input type="text" class="input" id="upper_path" value="" name="upper_path" readonly/>
                                    <input type="hidden" class="input" id="upper_code" value="" name="upper_code"/>
                                    <!-- hidden -->
                                {:else}
                                    <input type="text" class="input" id="upper_path" bind:value={upperInfos.upper_name} name="upper_path" readonly/>
                                    <input type="hidden" class="input" id="upper_code" bind:value={upperInfos.upper_code} name="upper_code"/>
                                    <!-- hidden -->
                                {/if}                         
                                <input type="hidden" class="input" id="upper_rate" bind:value={rate} name="upper_rate"/>
                                <!-- 처음엔 등록하는사람 rate였다가 선택후 바뀜 -->
                                <!-- hidden -->
                            </div>
                        </dd>
                    </dl>
        
                    <dl class="col-12 col-lg-6">
                        <dt>상위 파트너 아이디</dt>
                        <dd class="upper_code_box">
                            <div class="form_input">
                                {#if classify === "0" || classify === "1"}
                                    <input type="text" class="input" name="upper_id" id="upper_id" placeholder="상위파트너아이디" style="outline: none;" readonly required/>
                                    <button class="" id="checke_upper" type="button" on:click|preventDefault={() => showModal()}>파트너 확인</button>
                                {:else}
                                    <input type="text" class="input" name="upper_id" id="upper_id" placeholder="상위파트너아이디" style="outline: none;" bind:value={upperInfos.id} readonly required/>
                                {/if}                          
                            </div>
                        </dd>                              
                    </dl>
                </div>
            
                <div class="d-flex">
                    <dl class="col-12 col-lg-6">
                        <dt>전화번호</dt>
                        <dd class="upper_code_box">
                            <div class="form_input">
                                <input type="text" id="user_id" class="input" name="store_id"  required/>
                                <button class="" type="button" id="idCheckBtn" on:click|preventDefault={() =>checkDuplicate('user_id')}>중복확인</button>
                            </div>
                        </dd>
                    </dl>
                </div>
        
                <div class="d-flex">
                    <dl class="col-12 col-lg-6">
                        <dt>비밀번호</dt>
                        <dd>
                            <div class="form_input"><input type="password" class="input" value="" id="store_pass" name="store_pass" required/></div>
                        </dd>
                    </dl>
            
                    <dl class="col-12 col-lg-6">
                        <dt>비밀번호 확인</dt>
                        <dd>
                            <div class="form_input"><input type="password" class="input" value="" id="store_pass_check" name="store_pass_check" required/></div>
                        </dd>
                    </dl>
                </div>
            
                <div class="d-flex">        
                    <dl class="col-12 col-lg-6">
                        <dt>대표자명</dt>
                        <dd>
                            <div class="form_input"><input type="text" class="input" name="store_ceo_name" value="" required/>
                            </div>
                        </dd>
                    </dl>
                    <dl class="col-12 col-lg-6">
                        <dt>상호명</dt>
                        <dd>
                            <div class="form_input"><input type="text" class="input" name="store_name" value="" required/>
                            </div>
                        </dd>
                    </dl>
                </div>
        
                <div class="row formbank_wrap">        
                    <dl class="col-12 col-md-6 col-lg-4">
                        <dt class="dt_width">입금은행명</dt>
                        <dd> 
                              <Select items={bankListData} required bind:value={selectedBank} placeholder="은행 검색" clearable={false}/>
                              <input type="hidden" name="bank_select" value={selectedBank?.value || ''} />
                        </dd>
                    </dl>     
                
                    <dl class="col-12 col-md-6 col-lg-5">
                        <dt>계좌번호</dt>
                        <dd>
                            <div class="form_input">
                                <input type="text" class="input" name="account_num" value=""  required/>
                            </div>
                        </dd>
                    </dl>
        
                    <dl class="col-12 col-md-6 col-lg-3">
                        <dt class="pl_5 text-center">예금주</dt>
                        <dd>
                            <div class="form_input">
                                <input type="text" class="input" name="account_name" value="" required/>
                            </div>
                        </dd>
                    </dl>
                </div>

                <div class="d-flex">
                    <dl class="col-12">
                        <dt>사업장 주소</dt>
                        <dd class="cd-flexa">
                            <div class="form_input"><input type="text" readonly class="input" id="coper_address" name="address" value=""  />
                            </div>
                            <div class=" search_address">
                                <div class="address_btn_box">
                                <button type="button" id="address_kakao">검색</button>
                                </div>
                            </div>
                        </dd>                 
                    </dl>            
                </div>

                <div class="d-flex">                 
                    <dl class="col-12 mb_20px">
                        <dt>상세주소</dt>
                        <dd>
                            <div class="form_input"><input type="text"  class="input" name="coper_address_details" value="" /></div>
                        </dd>
                    </dl>
                </div>

                {#if classify == "0"}
                    <dl class="mb_20px">
                        <dt class="dt_width">메모</dt>
                        <dd class="">
                            <div class="textarea_margin">
                                <textarea name="memo"></textarea>
                            </div>
                        </dd>
                    </dl>
                {/if}
            </div>
            
            <h3> 결제수단 설정 </h3>
            <div class="agency_form border-bottom">
                <div class="agency_form tidform_wrap pay_form_dwn">
                                        <div class="d-flex tidform_wrap_d pay_form_dwn">
                        <div class="col-12">
                            <div class="d-flex tidform_wrap_d">
                                <div class="col-12 col-md-6 col-lg-4">
                                    <dl class="radio_wrap">
                                        <dt>인증결제</dt>
                                        <dd class="d-flex">
                                            <label><input type="radio" name="DDDpay_state" id="DDDpayState_0" value="0" >사용</label>
                                            <label><input type="radio" name="DDDpay_state" id="DDDpayState_1" value="1" checked >미사용</label>
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="d-flex tidform_wrap_d">
                        <div class="col-12 col-md-12 col-lg-3">
                            <div class="row">
                                <div class="col-12 col-md-6 col-lg-12">
                                    <dl class="radio_wrap">
                                        <dt>수기결제</dt>
                                        <dd class="d-flex">
                                            <label><input type="radio" name="keyin_state" id="keyinState_0" value="0" >사용</label>
                                            <label><input type="radio" name="keyin_state" id="keyinState_1" value="1" checked >미사용</label>
                                        </dd>
                                    </dl>
        
                                </div>
                            </div>
                        </div>   
        
                        <div class="col-12 col-md-12 col-lg-9">
                            <div class="row store_edit_row" id="store_edit_row">

                                <div class="col-12 col-md-2 col-lg-2">
                                    <dl class="mb-0">
                                        <dt id="realtime_check_input" style="">
                                            <input type="checkbox" name="realtime_check" value="1" id="realtime_check"/>
                                        </dt>
                                        <dd class="d-flex realtime_check_title">실시간 정산</dd>
                                    </dl>
                                </div>
        
                                <div class="col-12 col-md-5 col-lg-5">
                                    <dl class="mb-0">
                                        <dt class="width_w " id="kitidtitle">수기결제 MID</dt>
                                        <dd class="d-flex form_input">                    
                                            <input type="text" style="background: #fff;" id="keyin_Tid" class="input cat_id" name="keyin_tid" maxlength="15">
                                            <button class="" type="button" id="kitidCheckBtn" on:click|preventDefault={() =>checkDuplicate('keyinTid')}>중복확인</button>
                                        </dd>
                                    </dl>
                                </div>

                                <div class="col-12 col-md-5 col-lg-5">
                                    <dl class="flex_d" style="margin-bottom: 0;">
                                        <dt class="width_w t_center" id="kipaykeytitle">수기 결제키</dt>
                                        <dd class="d-flex form_input">
                                            <input type="text" style="background: #fff;" class="input key_input_t" id="keyin_paykey" name="keyin_paykey" value="" /> 
                                            <button class="" type="button" id="kipaykeyCheckBtn" on:click|preventDefault={() => checkDuplicate('keyin_paykey')}>중복확인</button>                                        
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div> 

                    </div>
                    
                    <div class="d-flex tidform_wrap_d pay_form_dwn">
                        <div class="col-12">
                            <div class="d-flex tidform_wrap_d">
                                <div class="col-12 col-md-6 col-lg-3">
                                    <dl class="radio_wrap">
                                        <dt>단말기</dt>
                                        <dd class="d-flex">
                                            <label><input type="radio" name="terminal_state" id="terminalState_0" value="0" >사용</label>
                                            <label><input type="radio" name="terminal_state" id="terminalState_1" value="1" checked >미사용</label>
                                        </dd>
                                    </dl>
                                </div>


                            <div class="col-12 col-md-6 col-lg-9">

                                <div class="row store_edit_row" id="tertidtitle">

                                    <div class="col-12 col-md-2 col-lg-2">
                                        <dl class="mb-0">
                                            <dt id="realtime_check_input" style="">
                                                <input type="checkbox" name="T_realtime_check" value="1" id="T_realtime_check"/>
                                            </dt>
                                            <dd class="d-flex realtime_check_title">실시간 정산</dd>
                                        </dl>
                                    </div>

                                    <div class="col-12 col-md-6 col-lg-5">
                                        <dl class="mb-0">
                                            <dt class="width_w ">단말기 MID</dt>
                                            <dd class="d-flex form_input">                    
                                                <input type="text" id="terminal_Tid" style="background: #fff;" class="input cat_id" name="terminal_Tid" maxlength="15">       
                                                <button class="" type="button" id="tidCheckBtn" on:click|preventDefault={() => checkDuplicate('terminalTid')}>중복확인</button>                                                   
                                            </dd>
                                        </dl>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>

                            <div class="col-12 col-md-6 col-lg-6"></div>
                            </div>
        
                        <div class="d-flex tidform_wrap_d">
                            <div class="col-12 col-md-12 col-lg-6">
                                <div class="row">
            
                                    <div class="col-12 col-md-6 col-lg-3" id="commissionWrapper" >
                                    <dl class="">
                                        <dt class="width_w">수수료</dt>
                                        <dd class="cd_dlex2">
                                            <input type="text" class="input pay_stored" on:keyup={() => terminalCheck()} id="terminal_commission" name="terminal_commission" value=""/> %
                                        </dd>
                                    </dl>
                                    <input type="hidden" id="settlementCommisionHidden" name="commissionHidden" value="{settlement_commission}">
                                    {#if classify == "1"}
                                    <p class="red_t commission_notice">현재본사의 수수료는 <span id="commission_percent">{settlement_commission}</span>% 입니다.</p>
                                    {/if}
                                    </div>
                                </div>
                            </div>
                        </div>
                </div>
            </div>
        
            <div id="terminal_setWrapper">
                <h3> 단말기 설정</h3>
                    <div class="d-flex">
                        <dl class="col-12 col-lg-6">
                            <dt>단말기 등록일자</dt>
                            <dd style="margin-right: 10px;">
                                <div class="form_input"><input type="date" class="input" id="T_catId_date" name="T_catId_date"/></div>
                            </dd>
                        </dl>
                    </div>
                    
                    <div class="d-flex">
                        <dl class="col-12 col-lg-6 radio_wrap">
                            <dt>단말기 통신비</dt>
                            <dd class="d-flex">
                                <label><input type="radio" name="terminal_charge" id="terminalcharge_0" value="0" checked>에이전시</label>
                                <label><input type="radio" name="terminal_charge" id="terminalcharge_1" value="1" >가맹점</label>
                            </dd>
                        </dl>
                        <dl class="col-12 col-lg-6">
                            <dt>단말기 통신비<br> 금액 (월)</dt>
                            <dd style="margin-right: 10px;">
                                <div class="form_input"><input type="text" class="input" id="terminal_price" name="terminal_price" /></div>
                            </dd>
                        </dl>
                    </div>
        
                    <div class="d-flex">
                        <dl class="col-12 col-lg-6 radio_wrap">
                            <dt>단말기 유/무선</dt>
                            <dd class="d-flex">
                                <label><input type="radio" name="terminal_wireless" id="terminalwireless_0" value="0">유선</label>
                                <label><input type="radio" name="terminal_wireless" id="terminalwireless_1" value="1" checked>무선</label>
                            </dd>
                        </dl>
                        <dl class="col-12 col-lg-6 radio_wrap">
                            <dt>현금영수증</dt>
                            <dd class="d-flex">
                                <label><input type="radio" name="cash_receipts" id="cashReceipts_0" value="0" checked>없음</label>
                                <label><input type="radio" name="cash_receipts" id="cashReceipts_1" value="1" >있음</label>
                            </dd>
                        </dl>
                    </div>
            </div>    
        
            <h3>서비스 설정</h3>        
            <div class="">
                <div class="d-flex">
                    <dl class="col-12 col-lg-6 radio_wrap">
                        <dt>로그인</dt>
                        <dd class="d-flex">
                            <label><input type="radio" name="login_state" id="loginState_0" value="0" checked>정상</label>
                            <label><input type="radio" name="login_state" id="loginState_1" value="1">차단</label>
                            <label><input type="radio" name="login_state" id="loginState_2" value="2">탈퇴</label>
                        </dd>
                    </dl>
                    <dl class="col-12 col-lg-6">
                        <dt>사업자번호</dt>
                        <dd style="margin-right: 10px;">
                            <div class="form_input"><input type="text" class="input" name="store_business_number"/></div>
                        </dd>
                    </dl>
                </div>

                <!-- <div class="d-flex">
                    <dl class="col-12 col-lg-6 radio_wrap">
                        <dt>정산주기 설정</dt>
                        <dd class="d-flex">
                            <label><input type="radio" name="settlement_cycle" id="settlement_cycle_0" value="0" checked>사용</label>
                            <label><input type="radio" name="settlement_cycle" id="settlement_cycle_1" value="1" >미사용</label>
                        </dd>
                    </dl>
                </div> -->
        
                <div class="d-flex">
                    <dl class="col-12 col-lg-6 radio_wrap">
                        <dt>중복결제 알림</dt>
                        <dd class="d-flex">
                            <label><input type="radio" name="duplicate_use" id="duplicate_use_0" value="0" checked>사용</label>
                            <label><input type="radio" name="duplicate_use" id="duplicate_use_1" value="1">미사용</label>
                        </dd>
                    </dl>
                </div>             
            </div>
        
            <div class="btn_box">
                <button type="button" class="cancel_bt" on:click|preventDefault={() => navigateTo('StoreList')}>취소</button>
                <button class="edit_bt" type="submit">등록</button>
            </div>  
        </form>
    </section>
</div>

<!-- 모달 창 HTML -->
<div class="CK_modal" id="check_upper_modal" >
    <div class="modal-content">
        <button class="close_bt" id="close_modal" aria-label="닫기" on:click={closePopup} on:keydown={closePopup}>
            <span class="btn__close"></span>
        </button>
        
        <div id="modalBody" style="margin-top: 1.5rem;">          
             <!-- 보더박스_테이블 시작 -->
             <section class="borderbox_table">                    
                <div id="table_wrap" class="table_wrap">			
                    <table class="table_list upper_member_table" width="100%">
                        <caption>상위업체 검색 테이블</caption>
                    
                        <colgroup>                                                      
                            <col width="5%">        <!--no-->
                            <col width="15%">       <!--등급-->
                            <col width="10%">        <!--업체코드-->
                            <col width="10%">       <!--아이디-->
                            <col width="25%">       <!--업체경로-->
                            <col width="15%">       <!--상호명-->
                            <col width="8%">       <!--대표자명-->
                            <col width="10%">       <!--전화번호-->
                            <col width="5%">        <!--선택-->
                        </colgroup>

                        <thead>
                            <tr>                                                                 
                                <th>No</th>
                                <th scope="col">업체등급</th>
                                <th scope="col">업체코드</th>
                                <th scope="col">아이디</th>
                                <th scope="col">업체경로</th>
                                <th scope="col">상호명</th>
                                <th scope="col">대표자명</th>
                                <th scope="col">전화번호</th>
                                <th scope="col">선택</th>
                            </tr>
                        </thead>

                        <tbody>
                            {#each partnerData as dist, index}
                            <tr>
                                <td>{totalCount - ((currentPage - 1) * page_size) - index}</td>
                                <td>
                                    {#if dist.rate === "p0"}
                                        관리자
                                    {:else}
                                        {dist.rate}
                                    {/if}
                                </td>
                                <td>{dist.code}</td>
                                <td>{dist.id}</td> 
                                <td>{dist.upper_name}</td>  
                                <td>{dist.name}</td>                        
                                <td>{dist.ceo_name}</td> 
                                <td>{dist.contact}</td> 
                                <td><button class="t_btn" on:click|preventDefault={() => inserttext(dist.upper_name, dist.code, dist.id, dist.rate)}>입력하기</button></td>
                            </tr>    
                            {/each}
                        </tbody>
                    </table>
                </div>

            </section>
            <!-- 보더박스_테이블 끝 -->       

           <!-- 페이지네이션 -->   
        <section class="borderbox_pageing">
            <div class="pageing">
                <div class="page_navgation">
                    <!-- 첫 페이지 -->
                    {#if currentPage > 1}
                        <a href="{'a'}" on:click|preventDefault={() => changePage(1)} class="on arrow_bt">
                            <img class="arrow_icon chevron-double-left" src="../img/icon/chevron-double-left.svg" alt="첫 페이지">
                        </a>
                    {/if}

                    <!-- 이전 10페이지 -->
                    {#if startPage > 1}
                        <a href="{'a'}" on:click|preventDefault={() => changePage(startPage - 10)} class="on arrow_bt">
                            <img class="arrow_icon chevron-left" src="../img/icon/chevron-left.svg" alt="10페이지 뒤로">
                        </a>
                    {/if}

                    <!-- 페이지 번호 -->
                    {#each Array(endPage - startPage + 1).fill(0).map((_, i) => startPage + i) as p}
                        {#if currentPage === p}
                            <a href="{'a'}" class="on" on:click|preventDefault={() => changePage(p)}>{p}</a>
                        {:else}
                            <a href="{'a'}" on:click|preventDefault={() => changePage(p)}>{p}</a>
                        {/if}
                    {/each}

                    <!-- 다음 10페이지 -->
                    {#if endPage < totalPages}
                        <a href="{'a'}" on:click|preventDefault={() => changePage(startPage + 10)} class="on arrow_bt">
                            <img class="arrow_icon chevron-right" src="../img/icon/chevron-right.svg" alt="10페이지 앞으로">
                        </a>
                    {/if}

                    <!-- 마지막 페이지 -->
                    {#if currentPage < totalPages}
                        <a href="{'a'}" on:click|preventDefault={() => changePage(totalPages)} class="on arrow_bt">
                            <img class="arrow_icon chevron-double-right" src="../img/icon/chevron-double-right.svg" alt="마지막 페이지">
                        </a>
                    {/if}
                </div>
            </div>
        </section>
        <!-- 보더박스_페이징 끝 -->
        </div>
    </div>
</div>