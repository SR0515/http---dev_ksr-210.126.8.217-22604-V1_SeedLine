<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import LeftMenu from '$lib/components/LeftMenu.svelte';
    import SettingsLayout from '$lib/components/settings/SettingsLayout.svelte';
    import PasswordForm from '$lib/components/settings/PasswordForm.svelte';
    import AddressForm from '$lib/components/settings/AddressForm.svelte';
    import BankInfoForm from '$lib/components/settings/BankInfoForm.svelte';
    import { validatePassword, fetchUserInfo, updateUserInfo } from '$lib/utils/settingsUtils';
    import { authStore } from '$lib/stores/auth';
    import { showToast } from '$lib/stores/toast';

    // 상태 관리
    let loading = false;
    let userData = {
        basicInfo: {
            name: '',
            ceo_name: '',
            business_type: '0',
            contact: '',
            address: '',
            address_detail: '',
            business_number: '',
            corporate_number: '',
            business_condition: '',
            business_subject: '',
            login_state: '0'
        },
        walletInfo: {
            bank_name: '',
            account_num: '',
            account_name: '',
            settlement_commission: ''
        }
    };

    // 비밀번호 상태
    let password = '';
    let confirmPassword = '';

    // 반응형 상태
    $: userId = $authStore.userId;
    $: rate = $authStore.rate;
    $: classify = $authStore.classify;

    // 데이터 로드
    async function loadUserData() {
        try {
            loading = true;
            userData = await fetchUserInfo();
        } catch (error) {
            console.error('사용자 정보 로드 실패:', error);
            showToast('사용자 정보를 불러올 수 없습니다.', 'error');
        } finally {
            loading = false;
        }
    }

    // 정보 수정
    async function handleSubmit() {
        if (!validatePassword(password, confirmPassword)) {
            return;
        }

        try {
            loading = true;
            
            const updateData = {
                basicInfo: {
                    userId: userId,
                    pass: confirmPassword,
                    address: userData.basicInfo.address,
                    address_detail: userData.basicInfo.address_detail
                }
            };

            const success = await updateUserInfo('Partner', updateData);
            
            if (success) {
                // 비밀번호 필드 초기화
                password = '';
                confirmPassword = '';
                
                // 데이터 다시 로드하여 수정날짜 업데이트
                await loadUserData();
            }
        } catch (error) {
            console.error('정보 수정 실패:', error);
            showToast('정보 수정 중 오류가 발생했습니다.', 'error');
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

    onMount(() => {
        checkAccess();
        loadUserData();
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

<SettingsLayout title={"파트너"} showUserProfile={true}>
    <form on:submit|preventDefault={handleSubmit}>
        <!-- 기본정보 -->
        <h3>기본정보</h3>
        <div class="agency_form border-bottom">
            <div class="d-flex">
                <dl class="col-12 col-lg-6">
                    <dt>아이디</dt>
                    <dd>
                        <div class="form_input">
                            <input 
                                type="text" 
                                class="input" 
                                name="partner_id"
                                value={userId}
                                readonly
                            />
                        </div>
                    </dd>
                </dl>
            </div>

            <PasswordForm 
                bind:passwordValue={password}
                bind:confirmPasswordValue={confirmPassword}
                passwordName="partner_pass"
                confirmPasswordName="partner_pass_check"
                disabled={loading}
            />

            <div class="d-flex">
                <dl class="col-12 col-lg-6 radio_wrap">
                    <dt>사업자구분</dt>
                    <dd class="d-flex">
                        <label>
                            <input 
                                type="radio" 
                                name="business_type" 
                                value="0"
                                bind:group={userData.basicInfo.business_type}
                                disabled
                            />
                            비사업자
                        </label>
                        <label>
                            <input 
                                type="radio" 
                                name="business_type" 
                                value="1"
                                bind:group={userData.basicInfo.business_type}
                                disabled
                            />
                            개인사업자
                        </label>
                        <label>
                            <input 
                                type="radio" 
                                name="business_type" 
                                value="2"
                                bind:group={userData.basicInfo.business_type}
                                disabled
                            />
                            법인사업자
                        </label>
                    </dd>
                </dl>
                <dl class="col-12 col-lg-6">
                    <dt>대표자명</dt>
                    <dd>
                        <div class="form_input">
                            <input 
                                type="text" 
                                class="input" 
                                name="ceo_name"
                                bind:value={userData.basicInfo.name}
                                readonly
                            />
                        </div>
                    </dd>
                </dl>
            </div>

            <div class="d-flex">
                <dl class="col-12 col-lg-6">
                    <dt>업체명</dt>
                    <dd>
                        <div class="form_input">
                            <input 
                                type="text" 
                                class="input" 
                                name="name"
                                bind:value={userData.basicInfo.ceo_name}
                                readonly
                            />
                        </div>
                    </dd>
                </dl>
                <dl class="col-12 col-lg-6">
                    <dt>업체 전화번호</dt>
                    <dd>
                        <div class="form_input">
                            <input 
                                type="text" 
                                class="input" 
                                name="contact"
                                bind:value={userData.basicInfo.contact}
                                placeholder="'-'를 제외한 숫자만 입력해주세요."
                                readonly
                            />
                        </div>
                    </dd>
                </dl>
            </div>

            <BankInfoForm 
                bind:bankName={userData.walletInfo.bank_name}
                bind:accountNumber={userData.walletInfo.account_num}
                bind:accountHolder={userData.walletInfo.account_name}
            />

            <AddressForm 
                bind:addressValue={userData.basicInfo.address}
                bind:detailValue={userData.basicInfo.address_detail}
                disabled={loading}
                required={true}
            />
        </div>

        <!-- 사업자정보 -->
        <div class="info_text">
            <h3>사업자정보</h3>
            <span>*사업자 회원만 해당</span>
        </div>

        <div class="agency_form border-bottom">
            <div class="d-flex">
                <dl class="col-12 col-lg-6">
                    <dt>사업자번호</dt>
                    <dd>
                        <div class="form_input">
                            <input 
                                type="text" 
                                class="input" 
                                name="business_number"
                                bind:value={userData.basicInfo.business_number}
                                readonly
                            />
                        </div>
                    </dd>
                </dl>
                <dl class="col-12 col-lg-6">
                    <dt>법인번호</dt>
                    <dd>
                        <div class="form_input">
                            <input 
                                type="text" 
                                class="input" 
                                name="corporate_number"
                                bind:value={userData.basicInfo.corporate_number}
                                readonly
                            />
                        </div>
                    </dd>
                </dl>
            </div>

            <div class="d-flex">
                <dl class="col-12 col-lg-6">
                    <dt>업태</dt>
                    <dd>
                        <div class="form_input">
                            <input 
                                type="text" 
                                class="input" 
                                name="business_condition"
                                bind:value={userData.basicInfo.business_condition}
                                readonly
                            />
                        </div>
                    </dd>
                </dl>
                <dl class="col-12 col-lg-6">
                    <dt>종목</dt>
                    <dd>
                        <div class="form_input">
                            <input 
                                type="text" 
                                class="input" 
                                name="business_subject"
                                bind:value={userData.basicInfo.business_subject}
                                readonly
                            />
                        </div>
                    </dd>
                </dl>
            </div>
        </div>

        <!-- 서비스 설정 -->
        <h3>서비스 설정</h3>
        <div class="agency_form">
            <div class="d-flex">
                <dl class="col-12 col-lg-6 radio_wrap service_ra">
                    <dt>계약상태</dt>
                    <dd class="d-flex">
                        <label>
                            <input 
                                type="radio" 
                                name="login_state" 
                                value="0"
                                bind:group={userData.basicInfo.login_state}
                                disabled
                            />
                            정상
                        </label>
                        <label>
                            <input 
                                type="radio" 
                                name="login_state" 
                                value="1"
                                bind:group={userData.basicInfo.login_state}
                                disabled
                            />
                            정지
                        </label>
                        <label>
                            <input 
                                type="radio" 
                                name="login_state" 
                                value="2"
                                bind:group={userData.basicInfo.login_state}
                                disabled
                            />
                            탈퇴
                        </label>
                    </dd>
                </dl>
                {#if rate === 'p1'}
                    <dl class="col-12 col-lg-6">
                        <dt>수수료</dt>
                        <dd>
                            <div class="form_input">
                                <input 
                                    type="text" 
                                    class="input" 
                                    name="settlement_commission"
                                    bind:value={userData.walletInfo.settlement_commission}
                                    style="width: 20%"
                                    readonly
                                />
                                %
                            </div>
                        </dd>
                    </dl>
                {/if}
            </div>

            <div class="sub_box">
                <div class="btn_box">
                    <button 
                        type="button" 
                        class="cancel_bt"
                        on:click={() => goto('/dashboard')}
                        disabled={loading}
                    >
                        취소
                    </button>
                    <button 
                        type="submit" 
                        class="edit_bt"
                        disabled={loading}
                    >
                        {loading ? '처리중...' : '수정'}
                    </button>
                </div>
            </div>
        </div>
    </form>
</SettingsLayout>

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