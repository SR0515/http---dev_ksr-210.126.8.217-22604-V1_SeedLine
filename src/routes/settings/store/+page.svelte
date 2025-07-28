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
            store_ceo_name: '',
            store_name: '',
            adress: '',
            adress_detail: '',
            keyin_state: '0',
            terminal_state: '0'
        },
        walletInfo: {
            bank_name: '',
            account_num: '',
            account_name: '',
            terminal_commission: '',
            transfer_tax: '',
            T_catId_date: '',
            terminal_charge: '0',
            terminal_price: '',
            terminal_wireless: '0',
            cash_receipts: '0'
        }
    };

    // 비밀번호 상태
    let password = '';
    let confirmPassword = '';

    // 반응형 상태
    $: userId = $authStore.userId;
    $: classify = $authStore.classify;

    // 날짜 포맷팅
    $: if (userData.walletInfo?.T_catId_date) {
        userData.walletInfo.T_catId_date = userData.walletInfo.T_catId_date.split(' ')[0].trim();
    }

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
                userId: userId,
                pass: confirmPassword,
                adress: userData.basicInfo.adress,
                adress_detail: userData.basicInfo.adress_detail
            };

            const success = await updateUserInfo('Store', updateData);
            
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
        if (classify !== '2') {
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
            
            /* 결제수단 설정 */
            .tidform_wrap_d {
                flex-direction: column;
            }
            
            .pay_form_dwn {
                margin-top: 1rem;
            }
            
            .store_edit_commission {
                flex-direction: column;
                justify-content: flex-start;
            }
            
            .store_edit_commission dl {
                width: 100%;
                margin-bottom: 1.5rem;
            }
            
            .store_edit_commission dt {
                margin-bottom: 0.5rem;
                font-weight: 500;
                font-size: 0.9rem;
            }
            
            .store_edit_commission dd {
                margin-left: 0;
            }
            
            .store_edit_commission .form_input {
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }
            
            .store_edit_commission .form_input input {
                flex: 1;
            }
            
            .cd_dlex2 {
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }
            
            .cd_dlex2 input {
                flex: 1;
            }
            
            /* 단말기 설정 */
            .display_block {
                display: block;
            }
            
            .display_block .row {
                flex-direction: column;
            }
            
            .display_block .col-12 {
                width: 100%;
                margin-bottom: 1rem;
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
            
            .border-bottom {
                border-bottom: 1px solid #e0e0e0;
                margin-bottom: 1.5rem;
                padding-bottom: 1.5rem;
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
            .formbank_wrap dt,
            .store_edit_commission dt {
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

<SettingsLayout title="가맹점" showUserProfile={true}>
    <form on:submit|preventDefault={handleSubmit}>
        <!-- 기본정보 -->
        <h3>기본정보</h3>
        <div class="agency_form border-bottom">
            <div class="d-flex">
                <dl class="col-12 col-lg-6">
                    <dt>전화번호</dt>
                    <dd>
                        <div class="form_input">
                            <input 
                                type="text" 
                                class="input" 
                                name="store_id"
                                value={userId}
                                readonly
                                required
                            />
                        </div>
                    </dd>
                </dl>
            </div>

            <PasswordForm 
                bind:passwordValue={password}
                bind:confirmPasswordValue={confirmPassword}
                passwordName="store_pass"
                confirmPasswordName="store_pass_check"
                disabled={loading}
            />

            <div class="d-flex">
                <dl class="col-12 col-lg-6">
                    <dt>대표자명</dt>
                    <dd>
                        <div class="form_input">
                            <input 
                                type="text" 
                                class="input" 
                                name="store_ceo_name"
                                bind:value={userData.basicInfo.store_ceo_name}
                                readonly
                            />
                        </div>
                    </dd>
                </dl>
                <dl class="col-12 col-lg-6">
                    <dt>상호명</dt>
                    <dd>
                        <div class="form_input">
                            <input 
                                type="text" 
                                class="input" 
                                name="store_name"
                                bind:value={userData.basicInfo.store_name}
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
                bind:addressValue={userData.basicInfo.adress}
                bind:detailValue={userData.basicInfo.adress_detail}
                disabled={loading}
                required={true}
            />
        </div>

        <!-- 결제수단 설정 -->
        <h3>결제수단 설정</h3>
        <div class="agency_form tidform_wrap pay_form_dwn border-bottom">
            <div class="d-flex tidform_wrap_d">
                <div class="col-12 col-md-12 col-lg-4">
                    <div class="row">
                        <div class="col-12 col-md-6 col-lg-12">
                            <dl class="radio_wrap">
                                <dt>수기결제</dt>
                                <dd class="d-flex">
                                    <label>
                                        <input 
                                            type="radio" 
                                            name="keyin_state" 
                                            value="0"
                                            bind:group={userData.basicInfo.keyin_state}
                                            disabled
                                        />
                                        사용
                                    </label>
                                    <label>
                                        <input 
                                            type="radio" 
                                            name="keyin_state" 
                                            value="1"
                                            bind:group={userData.basicInfo.keyin_state}
                                            disabled
                                        />
                                        미사용
                                    </label>
                                </dd>
                            </dl>
                        </div>
                    </div>
                </div>
            </div>

            <div class="d-flex tidform_wrap_d pay_form_dwn">
                <div class="col-12 col-md-12 col-lg-12">
                    <div class="row display_block">
                        <div class="col-12 col-md-6 col-lg-4">
                            <dl class="radio_wrap">
                                <dt>단말기</dt>
                                <dd class="d-flex">
                                    <label>
                                        <input 
                                            type="radio" 
                                            name="terminal_state" 
                                            value="0"
                                            bind:group={userData.basicInfo.terminal_state}
                                            disabled
                                        />
                                        사용
                                    </label>
                                    <label>
                                        <input 
                                            type="radio" 
                                            name="terminal_state" 
                                            value="1"
                                            bind:group={userData.basicInfo.terminal_state}
                                            disabled
                                        />
                                        미사용
                                    </label>
                                </dd>
                            </dl>
                        </div>
                    </div>
                </div>
            </div>

            <div class="d-flex tidform_wrap_d">
                <div class="col-12">
                    <div class="row display_block">
                        <div class="col-12 col-lg-4 col-md-6">
                            <div class="row store_edit_commission">
                                <dl class="mb_20px col-md-5">
                                    <dt>수수료</dt>
                                    <dd class="cd_dlex2 form_input">
                                        <input 
                                            type="text" 
                                            class="input pay_stored" 
                                            name="terminal_commission"
                                            bind:value={userData.walletInfo.terminal_commission}
                                            readonly
                                        />
                                        %
                                    </dd>
                                </dl>
                                <dl class="mb_20px col-md-5">
                                    <dt>이체 수수료</dt>
                                    <dd class="cd_dlex2 form_input">
                                        <input 
                                            type="text" 
                                            class="input pay_stored" 
                                            name="transfer_tax"
                                            bind:value={userData.walletInfo.transfer_tax}
                                            readonly
                                        />
                                        원
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 단말기 설정 -->
        <h3>단말기 설정</h3>
        <div class="agency_form">
            <div class="d-flex">
                <dl class="col-12 col-lg-6">
                    <dt>단말기 등록일자</dt>
                    <dd style="margin-right: 10px;">
                        <div class="form_input">
                            <input 
                                type="date" 
                                class="input" 
                                name="T_catId_date"
                                bind:value={userData.walletInfo.T_catId_date}
                                readonly
                            />
                        </div>
                    </dd>
                </dl>
            </div>

            <div class="d-flex">
                <dl class="col-12 col-lg-6 radio_wrap">
                    <dt>단말기 통신비</dt>
                    <dd class="d-flex">
                        <label>
                            <input 
                                type="radio" 
                                name="terminal_charge" 
                                value="0"
                                bind:group={userData.walletInfo.terminal_charge}
                                disabled
                            />
                            에이전시
                        </label>
                        <label>
                            <input 
                                type="radio" 
                                name="terminal_charge" 
                                value="1"
                                bind:group={userData.walletInfo.terminal_charge}
                                disabled
                            />
                            파트너
                        </label>
                    </dd>
                </dl>
                <dl class="col-12 col-lg-6">
                    <dt>단말기 통신비 금액</dt>
                    <dd style="margin-right: 10px;">
                        <div class="form_input">
                            <input 
                                type="text" 
                                class="input" 
                                name="terminal_price"
                                bind:value={userData.walletInfo.terminal_price}
                                readonly
                            />
                        </div>
                    </dd>
                </dl>
            </div>

            <div class="d-flex">
                <dl class="col-12 col-lg-6 radio_wrap">
                    <dt>단말기 유/무선</dt>
                    <dd class="d-flex">
                        <label>
                            <input 
                                type="radio" 
                                name="terminal_wireless" 
                                value="0"
                                bind:group={userData.walletInfo.terminal_wireless}
                                disabled
                            />
                            유선
                        </label>
                        <label>
                            <input 
                                type="radio" 
                                name="terminal_wireless" 
                                value="1"
                                bind:group={userData.walletInfo.terminal_wireless}
                                disabled
                            />
                            무선
                        </label>
                    </dd>
                </dl>
                <dl class="col-12 col-lg-6 radio_wrap">
                    <dt>현금영수증</dt>
                    <dd class="d-flex">
                        <label>
                            <input 
                                type="radio" 
                                name="cash_receipts" 
                                value="0"
                                bind:group={userData.walletInfo.cash_receipts}
                                disabled
                            />
                            없음
                        </label>
                        <label>
                            <input 
                                type="radio" 
                                name="cash_receipts" 
                                value="1"
                                bind:group={userData.walletInfo.cash_receipts}
                                disabled
                            />
                            있음
                        </label>
                    </dd>
                </dl>
            </div>

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
                    class="submit edit_bt"
                    disabled={loading}
                >
                    {loading ? '처리중...' : '수정'}
                </button>
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