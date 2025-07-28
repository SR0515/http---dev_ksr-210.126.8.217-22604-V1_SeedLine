<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import LeftMenu from '$lib/components/LeftMenu.svelte';
    import SettingsLayout from '$lib/components/settings/SettingsLayout.svelte';
    import PasswordForm from '$lib/components/settings/PasswordForm.svelte';
    import { validatePassword, formatDateTime, fetchUserInfo, updateUserInfo } from '$lib/utils/settingsUtils';
    import { authStore } from '$lib/stores/auth';
    import { showToast } from '$lib/stores/toast';

    // 상태 관리
    let loading = false;
    let userData = {
        name: '',
        access_ip: '',
        transfer_tax: '',
        join_date: '',
        edit_date: ''
    };

    // 비밀번호 상태
    let password = '';
    let confirmPassword = '';

    // 반응형 상태
    $: userId = $authStore.userId;
    $: userName = $authStore.userName;
    $: classify = $authStore.classify;

    // 포맷된 날짜
    $: formattedJoinDate = formatDateTime(userData.join_date);
    $: formattedEditDate = formatDateTime(userData.edit_date);

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
                access_ip: userData.access_ip,
                transfer_tax: userData.transfer_tax
            };

            const success = await updateUserInfo('Admin', updateData);
            
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
        if (classify !== '0') {
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
                font-size: 16px; /* iOS 줌 방지 */
                border: 1px solid #ddd;
                border-radius: 4px;
                box-sizing: border-box;
            }
            
            .form_input input:focus {
                outline: none;
                border-color: #007bff;
                box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
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
            
            .edit_date {
                margin-top: 1rem;
            }
            
            .margin-top {
                margin-top: 1.5rem;
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
            
            .form_input input {
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
            
            .agency_form dt {
                font-size: 0.85rem;
            }
        }
        
        /* 세로 화면 최적화 */
        @media (max-width: 375px) {
            .form_input input {
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

<SettingsLayout showUserProfile={true} userInfo={userData} title="관리자">
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
                                name="id" 
                                value={userId}
                                readonly
                            />
                        </div>
                    </dd>
                </dl>
                <dl class="col-12 col-lg-6">
                    <dt>업체명</dt>
                    <dd>
                        <div class="form_input">
                            <input 
                                type="text" 
                                class="input" 
                                name="name"
                                bind:value={userData.name}
                                readonly
                            />
                        </div>
                    </dd>
                </dl>
            </div>

            <PasswordForm 
                bind:passwordValue={password}
                bind:confirmPasswordValue={confirmPassword}
                passwordName="pass"
                confirmPasswordName="pass_check"
                disabled={loading}
            />
        </div>

        <!-- 서비스 설정 -->
        <h3 class="margin-top">서비스 설정</h3>
        <div class="agency_form">
            <div class="d-flex">
                <dl class="col-12 col-lg-6">
                    <dt>접속 허용 IP<br>(최대 3개)</dt>
                    <dd>
                        <div class="form_input">
                            <input 
                                type="text" 
                                class="input" 
                                name="access_ip"
                                bind:value={userData.access_ip}
                                disabled={loading}
                            />
                        </div>
                    </dd>
                </dl>
                
                <dl class="col-12 col-lg-6">
                    <dt>이체수수료</dt>
                    <dd>
                        <div class="form_input">
                            <input 
                                type="text" 
                                class="input" 
                                name="transfer_tax"
                                bind:value={userData.transfer_tax}
                                disabled={loading}
                            />
                        </div>
                        원
                    </dd>
                </dl>
            </div>

            <div class="d-flex edit_date">
                <dl class="col-12 col-lg-6">
                    <dt>등록날짜</dt>
                    <dd>
                        <div class="form_input">
                            <input 
                                type="text" 
                                class="input" 
                                value={formattedJoinDate}
                                readonly
                            />
                        </div>
                    </dd>
                </dl>
                <dl class="col-12 col-lg-6">
                    <dt>수정날짜</dt>
                    <dd>
                        <div class="form_input">
                            <input 
                                type="text" 
                                class="input" 
                                value={formattedEditDate}
                                readonly
                            />
                        </div>
                    </dd>
                </dl>
            </div>

            <div class="btn_box margin-top">
                <button 
                    type="button" 
                    class="margin-right cancel_bt"
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