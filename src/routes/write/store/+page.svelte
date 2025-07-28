<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import LeftMenu from '$lib/components/LeftMenu.svelte';
    import WriteLayout from '$lib/components/store/write/WriteLayout.svelte';
    import BasicInfoForm from '$lib/components/store/write/BasicInfoForm.svelte';
    import PaymentForm from '$lib/components/store/write/PaymentForm.svelte';
    import ServiceSettingForm from '$lib/components/store/write/ServiceSettingForm.svelte';
    import { closeModal,showModal } from '$lib/utils/partnerListModal';
    import PartnerListModal from '$lib/components/store/write/PartnerListModal.svelte'; //파트너 리스트 모달 컴포넌트
    import { validatePassword, writeUser, validateForm} from '$lib/utils/writeUtils';
    import { authStore } from '$lib/stores/auth';
    import { showToast } from '$lib/stores/toast';
    import { loadBankList, bankListData, bankOptions } from '$lib/types/bank';
    
    let pageType = 'Write'; // 기본값 설정

    let currentPage = 1;
    let totalPages = 1;

    function handlePageChange(page: number) {
        currentPage = page;
        // 페이지 변경 시 데이터 로드 등 처리
    }

    // 반응형 상태
    $: userId = $authStore.userId;
    $: rate = $authStore.rate;
    $: classify = $authStore.classify;

    // 상태 관리
    let loading = false;

    // 비밀번호 상태
    let password = '';
    let confirmPassword = '';

    //주소 검색
    let addressName = "coper_address"
    let detailName="coper_address_details"

    // 등록 전송
    async function handleSubmit() {
        if (!validatePassword(password, confirmPassword)) {
            return;
        }

        const validationMessage = validateForm("Write");

        if (validationMessage) {
            showToast(validationMessage, "warning");
            return;
        }
        try {
            loading = true;

            const idCheck = document.getElementById("idCheckBtn")?.innerText;
            const store_Id_Input = document.getElementById("user_id") // DOM 요소

            if (!store_Id_Input) {
                console.warn("ID가 'user_id'인 요소를 찾을 수 없습니다.");
                return;
                }

            if (idCheck !== '확인완료' && !store_Id_Input.hasAttribute('readonly')) {
                showToast("ID 중복확인을 해주세요.", "info");
                return;
                }
            const form = document.getElementById("writeForm") as HTMLFormElement;
            const bank_code = form.bank_select.value;
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
            const writeData = {
                userId: userId,
                bank_code: bank_code,
                classify: classify,
                storeData: {
                    id: form.store_id.value,
                    pass: confirmPassword,
                    upper_path_value : form.upper_path.value, //상위업체경로
                    upper_rate : form.upper_rate.value,       //상위 업체 등급
                    upper_id : form.upper_id.value,           //상위 업체 ID
                    upper_code: form.upper_code.value,     //상위 업체 코드
                    store_name: form.store_name.value,
                    store_ceo_name: form.store_ceo_name.value,
                    adress : form.coper_address.value,
                    adress_detail : form.coper_address_details.value,
                    store_business_number : form.store_business_number.value,
                    login_state : form.login_state.value  
                },
                storeWalletData: {
                    name : form.store_name.value,
                    account_num : form.account_num.value,
                    account_name : form.account_name.value,
                    keyin_state : form.keyin_state.value,            //수기결제 사용여부
                    ki_realtime_state : realtime_check,             //수기결제 실시간여부
                    ki_catId : form.keyin_tid.value,                // 수기결제 tid
                    ki_paykey : form.keyin_paykey.value,            //키인결제 결제키
                    terminal_state : form.terminal_state.value,      //단말기 사용여부
                    T_realtime_state : T_realtime_check,            //단말기 실시간 사용여부
                    DDDpay_state: form.DDDpay_state.value,          // 인증결제 사용여부
                    T_catId : form.terminal_Tid.value ,             //단말기 TID
                    T_catId_date : form.T_catId_date.value? form.T_catId_date.value : '',
                    terminal_commission : form.terminal_commission.value,//결제수수료
                    terminal_charge : form.terminal_charge.value ,      //단말기 통신부담
                    terminal_price : form.terminal_price.value,         //단말기 통신비
                    terminal_wireless : form.terminal_wireless.value,   //단말기 유/무선
                    cash_receipts : form.cash_receipts.value,           //현금영수증 유/무
                    duplicate_state: form.duplicate_use.value           //중복결제 확인 유/무
                },
                 storeCommissionData: {
                    partner_id : form.store_id.value,
                    upper_rate : form.upper_rate.value, //상위업체 등급 
                    terminal_C : form.terminal_commission.value,//결제수수료
                    store_name : form.store_name.value
                },
                editLogData: {
                // ip : clientIP,
                    browser : navigator.userAgent,
                    userId : userId,
                }
            };

            const success = await writeUser('store', writeData);
            
            if (success) {                
                showToast('가맹점 등록이 완료 되었습니다.', 'success');
                setTimeout(() => {
                    goto('/list/store');
                }, 1500);
            }
        } catch (error) {
            console.error('등록 실패:', error);
            showToast('가맹점 등록 중 오류가 발생했습니다.', 'error');
        } finally {
            loading = false;
        }
    }

    // 권한 체크
    function checkAccess() {
        if (classify !== '0' && classify !== '1') {
            showToast('접근 권한이 없습니다.', 'error');
            goto('/dashboard');
        }
    }

    onMount(async () => {
        await loadBankList();
    });
</script>

<svelte:head>
    <link rel="stylesheet" href="/css/sub.css" />
    <link rel="stylesheet" href="/css/add.css" />
    <style>
        /* 반응형 개선 */
        @media (max-width: 991px) {
            #page_contect {
                padding: 0 1rem;
            }
            
            .sub_box {
                margin: 1rem 0;
                padding: 1rem;
            }
            
            .agency_form {
                padding: 1rem 0.5rem;
            }
        }
        
        @media (max-width: 768px) {
            #page_contect {
                padding: 0 0.5rem;
            }
            
            .sub_box {
                margin: 0.5rem 0;
                padding: 0.5rem;
            }
            
            .agency_form {
                padding: 0.5rem 0;
            }
            
            .d-flex {
                flex-direction: column;
                gap: 0;
            }
            
            .col-12.col-lg-6 {
                width: 100%;
                margin-bottom: 1.5rem;
                padding: 0;
            }
            
            .agency_form dl {
                margin-bottom: 1.5rem;
            }
            
            .agency_form dt {
                margin-bottom: 0.5rem;
                font-weight: 500;
                font-size: 0.9rem;
                color: #333;
            }
            
            .agency_form dd {
                margin-bottom: 0;
                margin-left: 0;
            }
            
            .form_input {
                width: 100%;
            }
            
            .form_input input {
                width: 100%;
                min-width: 0;
                padding: 0.8rem;
                font-size: 16px;
                border: 1px solid #ddd;
                border-radius: 4px;
                box-sizing: border-box;
            }
            
            .form_input input:focus {
                outline: none;
                border-color: #007bff;
                box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
            }
            
            /* 라디오 버튼 그룹 */
            .radio_wrap dd {
                flex-direction: column;
                align-items: flex-start;
                gap: 0.5rem;
            }
            
            .radio_wrap dd label {
                margin-bottom: 0.5rem;
                margin-right: 0;
                display: flex;
                align-items: center;
                font-size: 0.9rem;
            }
            
            .radio_wrap dd label input {
                margin-right: 0.5rem;
                width: auto;
            }
            
            /* 은행 정보 폼 */
            .formbank_wrap {
                flex-direction: column;
            }
            
            .formbank_wrap dl {
                width: 100%;
                margin-bottom: 1.5rem;
            }
            
            .formbank_wrap dt {
                margin-bottom: 0.5rem;
                font-weight: 500;
                font-size: 0.9rem;
            }
            
            .formbank_wrap dd {
                margin-left: 0;
            }
            
            .formbank_wrap input {
                width: 100%;
                padding: 0.8rem;
                font-size: 16px;
                border: 1px solid #ddd;
                border-radius: 4px;
                box-sizing: border-box;
            }
            
            .btn_box {
                display: flex;
                flex-direction: column;
                gap: 10px;
                text-align: center;
                padding: 1.5rem 0;
            }
            
            .btn_box button {
                width: 100%;
                padding: 0.8rem 1rem;
                font-size: 1rem;
                margin-right: 0;
                margin-bottom: 0;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                transition: all 0.2s ease;
            }
            
            .btn_box button:hover {
                opacity: 0.9;
                transform: translateY(-1px);
            }
            
            .btn_box button:active {
                transform: translateY(0);
            }
            
            h3 {
                font-size: 1.2rem;
                margin: 1.5rem 0 1rem 0;
                padding-bottom: 0.5rem;
                border-bottom: 2px solid #f0f0f0;
            }
            
            .info_text {
                margin-top: 1.5rem;
                margin-bottom: 1rem;
            }
            
            .info_text h3 {
                margin: 0;
                padding-bottom: 0.3rem;
                border-bottom: 1px solid #f0f0f0;
            }
            
            .info_text span {
                font-size: 0.75rem;
                color: #e71c1c;
                margin-left: 0.5rem;
            }
        }
        
        @media (max-width: 480px) {
            #page_contect {
                padding: 0 0.25rem;
            }
            
            .sub_box {
                margin: 0.25rem 0;
                padding: 0.25rem;
            }
            
            .agency_form {
                padding: 0.25rem 0;
            }
            
            .form_input input,
            .formbank_wrap input {
                padding: 0.7rem;
                font-size: 16px;
            }
            
            .btn_box button {
                padding: 0.75rem 1rem;
                font-size: 0.95rem;
            }
            
            h3 {
                font-size: 1.1rem;
                margin: 1rem 0 0.75rem 0;
            }
            
            .agency_form dt,
            .formbank_wrap dt {
                font-size: 0.85rem;
            }
            
            .radio_wrap dd label {
                font-size: 0.85rem;
            }
        }
        
        /* 세로 화면 최적화 */
        @media (max-width: 375px) {
            .form_input input,
            .formbank_wrap input {
                padding: 0.6rem;
            }
            
            .btn_box button {
                padding: 0.7rem 0.8rem;
                font-size: 0.9rem;
            }
        }
    </style>
</svelte:head>

<LeftMenu />

<WriteLayout bind:pageType={pageType}>
     <h3>기본정보</h3>
     <form id="writeForm" method="post" on:submit|preventDefault={handleSubmit}>
        <!-- 기본정보 -->
        <BasicInfoForm
            on:showModal={showModal}
            bind:pageType={pageType}
            bind:passwordValue={password}
            bind:confirmPasswordValue={confirmPassword}
            passwordName="store_pass"
            confirmPasswordName="store_pass_check"
            addressBtn="address_kakao"
            addressName={addressName}
            detailName={detailName}
            disabled={loading}
        />
        
        <!-- 파트너리스트 모달 -->
        <PartnerListModal
            userId={userId}
            rate={rate}
            classify={classify}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            on:close={closeModal}
        />

        <!-- 결제수단 설정 -->
         <PaymentForm
            disabled={loading}
        />    

        <!-- 서비스 설정 -->
        <ServiceSettingForm 
            disabled={loading}
        />

        <div class="sub_box">
            <div class="btn_box">
                <button type="button" class="cancel_bt"on:click={() => goto('/list/store')} disabled={loading}>취소</button>
                <button type="submit" class="edit_bt" disabled={loading}>{loading ? '처리중...' : '등록'}</button>
            </div>
        </div>
    </form>
</WriteLayout>

{#if loading}
    <div class="alert_mask"></div>
    <div class="alert_popup qr_ok_popup loading_popup">
        <div class="qr_wrap">
            <div class="qrok_title">
                <div class="loader"></div>
                <h5>처리중 입니다.<br>잠시만 기다려주세요.</h5>
            </div>
        </div>
    </div>
{/if}