<script lang="ts">
    import { navigateToPartner } from '$lib/utils/menuUtils';
    import { page } from '$app/stores';
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import LeftMenu from '$lib/components/LeftMenu.svelte';
    import WriteLayout from '$lib/components/partner/write/WriteLayout.svelte'; //페이지 레이아웃
    import BasicInfoForm from '$lib/components/partner/edit/BasicInfoForm.svelte';
    import BusinessForm from '$lib/components/partner/edit/BusinessForm.svelte';
    import ServiceSettingForm from '$lib/components/partner/edit/ServiceSettingForm.svelte';
    import { closeModal,showModal } from '$lib/utils/partnerListModal';
    import PartnerListModal from '$lib/components/partner/write/PartnerListModal.svelte'; //파트너 리스트 모달 컴포넌트
    import { validatePassword } from '$lib/utils/writeUtils'; //수정필요
    import { editUser } from '$lib/utils/editUtils' 
    import { fetchUserInfo, getDefaultPartnerListData, passEditCheck } from '$lib/utils/editUtils'
    import { loadBankList, bankListData } from '$lib/types/bank';
    import { authStore } from '$lib/stores/auth';
    import { showToast } from '$lib/stores/toast';
    import { showBankPassCheck, closeBankPassCheck } from '$lib/utils/editUtils'
    import type { PartnerListData } from '$lib/types/partner'
    
    $: writePartner = $page.url.searchParams ?? '';

    let upperInfos = '';
    let disabledValue = true;
    let pageType = 'Edit'; // 기본값 설정

    let addressName = "address"
    let detailName="address_detail"
    let addressValue = '';
    let detailValue = '';
    let currentPage = 1;
    let totalPages = 1;
    let catIdDate = '';
    let selectedBank: { value: string; label: string } | null = null;

    let isBankDisabled = true;

    //검색할 파트너 코드
    $: code = $page.url.searchParams.get('code') ?? '';
    $: partnerUpperRate = $page.url.searchParams.get("partnerUpperRate") ?? '';

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
    let userData: PartnerListData = getDefaultPartnerListData();

    // 비밀번호 상태
    let password = '';
    let confirmPassword = '';


    //데이터 로드
    async function loadUserData() {
        try {
            loading = true;
            userData = await fetchUserInfo(userId, code , 'partner');   
            addressValue = userData.partnerList.address
            detailValue = userData.partnerList.address_detail
            
        console.log("userData",userData)
        } catch (error) {
            console.error('사용자 정보 로드 실패:', error);
            showToast('사용자 정보를 불러올 수 없습니다.', 'error');
        } finally {
            loading = false;
        }
    }

    async function handlePassCheck(event: Event) {
        event.preventDefault(); 

        const form = event.target as HTMLFormElement;
        const passwordInput = form.querySelector('input[name="bank_edit_pass"]') as HTMLInputElement;
        const password = passwordInput.value;

        let success = await passEditCheck(userId, classify, password);

        disabledValue = success;
    }


    // 수정정보 전송
    async function handleSubmit() {
        if (!validatePassword(password, confirmPassword)) {
            return;
        }

        try {
            loading = true;

            const form = document.getElementById("writeForm") as HTMLFormElement;
            const bank_code = form.bank_select.value;
            const editData = {
                userId: userId,
                classify: classify,
                partnerUpperRate : partnerUpperRate ?? '',
                partnerData: {
                    id: userData.partnerList.id,
                    pass: confirmPassword,
                    code : code, // 전달 받은 code
                    business_type : form.business_type.value,
                    name : form.coper_name.value,
                    ceo_name : form.ceo_name.value,
                    contact : form.coper_contact.value,
                    address : form.address.value,
                    address_detail : form.address_detail.value,
                    memo : form.memo.value,
                    business_number : form.business_number.value,
                    corporate_number : form.corporate_number.value,
                    business_condition : form.business_condition.value,
                    business_subject : form.business_subject.value,
                    login_state : form.login_state.value,
                    upper_name : form.upper_name.value?? '',
                    upper_id : form.upper_id.value?? '',
                    upper_code : form.upper_code.value?? '',
                },
                partnerWalletData: {
                    bank_name: bank_code,
                    account_num : form.account_num.value,
                    account_name : form.account_name.value,
                },
                partnerCommissionData: {
                    partner_id : userData.partnerList.id,
                },
                editLogData: {
                    // ip : clientIP,
                    browser : navigator.userAgent,
                    userId : userId,
                    url: window.location.href,
                    rate: rate,
                }
            };

            const success = await editUser('partner', editData);
            
            if (success) {                
                showToast('파트너 수정이 완료 되었습니다.', 'success');
                disabledValue = true;
                setTimeout(() => {
                    navigateToPartner('/list/partner',{id: writePartner.get('id'),name:writePartner.get("name"),rate:writePartner.get("rate")})
                }, 1500);
            }

        } catch (error) {
            console.error('수정 실패:', error);
            showToast('가맹점 정보수정 중 오류가 발생했습니다.', 'error');
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
        await loadUserData();
        let matched = bankListData.find(
            bank => bank.bank_name === userData.walletList.bank_name
        );

        selectedBank = matched
            ? { value: matched.bank_code, label: matched.bank_name }
            : null;
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

<WriteLayout pageType={pageType}>
     <h3>기본정보</h3>
     <form id="writeForm" method="post" on:submit|preventDefault={handleSubmit}>
        <!-- 기본정보 -->
        <BasicInfoForm
            on:showModal={showModal}
            bind:userData={userData}
            bind:pageType={pageType}
            bind:passwordValue={password}
            bind:confirmPasswordValue={confirmPassword}
            bind:selectedBank={selectedBank}
            disabledValue = {disabledValue}
            partnerUpperRate={partnerUpperRate}
            passwordName="pass"
            confirmPasswordName="pass_check"
            addressBtn="address_kakao"
            addressName={addressName}
            detailName={detailName}
            adressValue={addressValue}
            detailValue={detailValue}
            disabled={loading}
            showBankPassCheck={showBankPassCheck}
        />
        
        <!-- 파트너리스트 모달 -->
        <PartnerListModal
            partnerUpperRate={partnerUpperRate}
            userId={userId}
            rate={rate}
            classify={classify}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            on:close={closeModal}
        />

        <!-- 사업자 정보 폼 -->
         <BusinessForm
            bind:userData={userData}
        />    

        <!-- 서비스 설정 -->
        <ServiceSettingForm 
            bind:userData={userData}
            disabled={loading}
        />
        <div class="sub_box">
            <div class="btn_box">
                <button type="button" class="cancel_bt"on:click={() => navigateToPartner('/list/partner',{id: writePartner.get('id'),name:writePartner.get("name"),rate:writePartner.get("rate")})} disabled={loading}>취소</button>
                <button type="submit" class="edit_bt" disabled={loading}>{loading ? '처리중...' : '수정'}</button>
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

<!-- 패스워드 체크 모달 창 HTML -->
<div class="CK_modal" id="pass_check_modal" >
<div class="modal-content">
    <span class="close_bt" id="close_modal" on:click={closeBankPassCheck}  on:keydown={closeBankPassCheck}  ><span class="btn__close" alt="닫기" title="닫기"></span></span>
    
    <div id="modalBody"> 
    <!-- 내용들어가는자리 -->    
    <section>
        <form id="passCheckForm" on:submit|preventDefault={handlePassCheck}>
            <h4>비밀번호를 입력해주세요</h4>
            <input type="password" name="bank_edit_pass" id="bank_edit_pass">
            <button type="submit">확인</button>
        </form>
    </section>      

    </div>
</div>
</div>
<!--패스워드 체크 모달 끝-->