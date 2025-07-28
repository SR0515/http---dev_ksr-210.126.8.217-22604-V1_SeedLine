<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { authStore } from '$lib/stores/auth';
	import { checkAuth } from '$lib/utils/accessControl';
	import { showToast } from '$lib/stores/toast';
	import LeftMenu from '$lib/components/LeftMenu.svelte';
	import Toast from '$lib/components/Toast.svelte';

	// 관리자 정보 인터페이스
	interface AdminInfo {
		id: string;
		name: string;
		access_ip: string;
		transfer_tax: number;
		join_date: string;
		edit_date?: string;
	}

	// 폼 데이터
	interface FormData {
		pass: string;
		pass_check: string;
		access_ip: string;
		transfer_tax: number;
	}

	// 상태 변수
	let adminInfo: AdminInfo = {
		id: '',
		name: '',
		access_ip: '',
		transfer_tax: 0,
		join_date: '',
		edit_date: ''
	};

	let formData: FormData = {
		pass: '',
		pass_check: '',
		access_ip: '',
		transfer_tax: 0
	};

	let loading = false;
	let submitting = false;

	onMount(async () => {
		// 관리자 권한 체크
		if ($authStore.classify !== '0') {
			showToast('관리자만 접근할 수 있습니다.', 'error');
			goto('/dashboard');
			return;
		}

		const hasAccess = await checkAuth('admin_settings');
		if (!hasAccess) {
			showToast('접근 권한이 없습니다.', 'error');
			goto('/dashboard');
			return;
		}

		await fetchAdminInfo();
	});

	// 관리자 정보 조회
	async function fetchAdminInfo() {
		if (loading) return;
		
		loading = true;

		try {
			const params = new URLSearchParams({
				userId: $authStore.userId || '',
				classify: $authStore.classify || ''
			});

			const response = await fetch(`/api/InfoEdit?${params}`);
			const result = await response.json();

			if (result.success && result.data) {
				adminInfo = result.data;
				// 폼 데이터 초기화
				formData.access_ip = adminInfo.access_ip;
				formData.transfer_tax = adminInfo.transfer_tax;
			} else {
				console.error('서버 오류:', result.message);
				showToast('관리자 정보를 불러올 수 없습니다.', 'error');
			}
		} catch (error) {
			console.error('API 호출 오류:', error);
			showToast('네트워크 오류가 발생했습니다.', 'error');
		} finally {
			loading = false;
		}
	}

	// 시간 포맷팅 함수
	function formatTime(datetimeStr: string): string {
		if (!datetimeStr) return '';
		
		const date = new Date(datetimeStr);
		const year = date.getFullYear();
		const month = (date.getMonth() + 1).toString().padStart(2, '0');
		const day = date.getDate().toString().padStart(2, '0');

		let hour = date.getHours();
		const minutes = date.getMinutes().toString().padStart(2, '0');
		const seconds = date.getSeconds().toString().padStart(2, '0');

		const ampm = hour >= 12 ? '오후' : '오전';
		if (hour > 12) hour -= 12;
		if (hour === 0) hour = 12;

		return `${year}-${month}-${day} ${ampm} ${hour}:${minutes}:${seconds}`;
	}

	// 폼 유효성 검사
	function validateForm(): boolean {
		// 비밀번호 검증
		if (formData.pass && !formData.pass_check) {
			showToast('비밀번호 확인을 입력해주세요.', 'error');
			return false;
		}

		if (formData.pass_check && !formData.pass) {
			showToast('새 비밀번호를 입력해주세요.', 'error');
			return false;
		}

		if (formData.pass !== formData.pass_check) {
			showToast('비밀번호와 비밀번호 확인이 다릅니다.', 'error');
			return false;
		}

		// 비밀번호 강도 검증 (선택사항)
		if (formData.pass && formData.pass.length < 8) {
			showToast('비밀번호는 8자 이상이어야 합니다.', 'error');
			return false;
		}

		// IP 주소 형식 검증 (간단한 검증)
		if (formData.access_ip) {
			const ipPattern = /^(\d{1,3}\.){3}\d{1,3}(,\s*(\d{1,3}\.){3}\d{1,3}){0,2}$/;
			if (!ipPattern.test(formData.access_ip.trim())) {
				showToast('올바른 IP 주소 형식으로 입력해주세요. (예: 192.168.1.1, 192.168.1.2)', 'error');
				return false;
			}
		}

		// 이체수수료 검증
		if (formData.transfer_tax < 0) {
			showToast('이체수수료는 0 이상이어야 합니다.', 'error');
			return false;
		}

		return true;
	}

	// 관리자 정보 수정
	async function updateAdminInfo() {
		if (submitting) {
			showToast('처리 중입니다. 잠시만 기다려주세요.', 'warning');
			return;
		}

		if (!validateForm()) {
			return;
		}

		submitting = true;

		try {
			const adminData = {
				userId: $authStore.userId,
				pass: formData.pass_check, // 확인된 비밀번호 사용
				access_ip: formData.access_ip.trim(),
				transfer_tax: formData.transfer_tax
			};

			const response = await fetch('/api/InfoEdit/Admin', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(adminData)
			});

			const result = await response.json();

			if (result.success) {
				showToast('정보수정이 완료되었습니다!', 'success');
				
				// 비밀번호 필드 초기화
				formData.pass = '';
				formData.pass_check = '';
				
				// 데이터 새로고침
				setTimeout(async () => {
					await fetchAdminInfo();
				}, 1500);
			} else {
				console.error('서버 응답 오류:', result);
				showToast(result.message || '정보수정에 실패했습니다.', 'error');
			}
		} catch (error) {
			console.error('수정 중 오류 발생:', error);
			showToast('서버 오류가 발생했습니다.', 'error');
		} finally {
			submitting = false;
		}
	}

	// 로그 조회 페이지로 이동
	function navigateToLoginLog() {
		goto('/admin/login-log');
	}

	// 취소 (메인으로 이동)
	function handleCancel() {
		goto('/dashboard');
	}

	// 반응형 계산 값들
	$: formattedJoinDate = formatTime(adminInfo.join_date);
	$: formattedEditDate = formatTime(adminInfo.edit_date || '');
</script>

<Toast />

<div class="page-layout">
	<LeftMenu />
	
	<main class="main-content">
		<div id="page_contect" class="">
			<!-- 사용자 정보 섹션 -->
			<section class="contect_w top_contect_w">
				<div class="borderbox_table user_wrap_box">
					<div class="row">
						<div class="col-12 main_boxwh">
							<div class="contentbox userw_wrap">
								<div class="user_info_wrap">
									<div class="content_left">
										<div class="user_img">
											<img src="/img/noimage.png" alt="이미지">
										</div>
										{#if adminInfo.name}
											<h2 class="user_name">{adminInfo.name}</h2>
										{/if}
										<span>님, 안녕하세요.</span>
									</div>
									<div class="">
										<button 
											type="button"
											class="btn_log"
											on:click={navigateToLoginLog}
										>
											로그조회
										</button>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			<!-- 페이지 제목 -->
			<section class="page-title-section">
				<h5 style="float:left; margin-right:10px;">정보수정</h5>
				<span style="float:left; margin-right:10px;">-</span>
				<h5>관리자</h5>
			</section>

			<!-- 설정 폼 섹션 -->
			<section class="sub_box admin_seeting_wrap">
				<form on:submit|preventDefault={updateAdminInfo}>
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
											value={$authStore.userId}
											readonly
										>
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
											bind:value={adminInfo.name}
											readonly
										>
									</div>
								</dd>
							</dl>
						</div>

						<div class="d-flex">
							<dl class="col-12 col-lg-6">
								<dt>새 비밀번호</dt>
								<dd>
									<div class="form_input">
										<input 
											type="password" 
											class="input" 
											bind:value={formData.pass}
											placeholder="비밀번호를 변경하려면 입력하세요"
											minlength="8"
										>
									</div>
								</dd>
							</dl>
							<dl class="col-12 col-lg-6">
								<dt>새 비밀번호 확인</dt>
								<dd>
									<div class="form_input">
										<input 
											type="password" 
											class="input" 
											bind:value={formData.pass_check}
											placeholder="새 비밀번호를 다시 입력하세요"
											minlength="8"
										>
									</div>
								</dd>
							</dl>
						</div>
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
											bind:value={formData.access_ip}
											placeholder="예: 192.168.1.1, 192.168.1.2"
										>
									</div>
									<small class="help-text">
										여러 IP는 쉼표(,)로 구분하여 입력하세요
									</small>
								</dd>
							</dl>
							<dl class="col-12 col-lg-6">
								<dt>이체수수료</dt>
								<dd>
									<div class="form_input">
										<input 
											type="number" 
											class="input" 
											bind:value={formData.transfer_tax}
											min="0"
											step="1"
										>
									</div>
									원
								</dd>
							</dl>
						</div>

						<!-- 등록/수정 날짜 -->
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
										>
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
										>
									</div>
								</dd>
							</dl>
						</div>

						<!-- 버튼 -->
						<div class="btn_box margin-top">
							<button 
								type="button" 
								class="margin-right cancel_btn"
								on:click={handleCancel}
								disabled={submitting}
							>
								취소
							</button>
							<button 
								type="submit" 
								class="submit edit_btn"
								disabled={submitting || loading}
							>
								{submitting ? '처리중...' : '수정'}
							</button>
						</div>
					</div>
				</form>
			</section>
		</div>

		<!-- 로딩 팝업 -->
		{#if submitting}
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
	</main>
</div>

<style>
	/* 기본 레이아웃 */
	.page-layout {
		display: flex;
		min-height: 100vh;
	}

	.main-content {
		flex: 1;
		margin-left: 250px;
		padding: 2rem;
		background-color: #f8f9fa;
	}

	/* 페이지 제목 섹션 */
	.page-title-section {
		margin: 1rem 0;
		overflow: hidden; /* float 클리어를 위해 */
	}

	.page-title-section h5 {
		margin: 0;
		color: #2c3e50;
	}

	.page-title-section span {
		color: #7f8c8d;
	}

	/* 도움말 텍스트 */
	.help-text {
		color: #6c757d;
		font-size: 0.8rem;
		margin-top: 0.25rem;
		display: block;
	}

	/* 폼 요소 스타일 */
	.form_input input:read-only {
		background-color: #f8f9fa;
		color: #6c757d;
	}

	.form_input input[type="password"] {
		font-family: inherit;
	}

	/* 버튼 스타일 */
	.btn_log {
		background: none;
		border: 1px solid #e74c3c;
		color: #e74c3c;
		padding: 0.5rem 1rem;
		border-radius: 4px;
		cursor: pointer;
		text-decoration: none;
		font-size: 0.9rem;
		transition: all 0.2s;
	}

	.btn_log:hover {
		background-color: #e74c3c;
		color: white;
	}

	.cancel_btn, .edit_btn {
		padding: 0.75rem 1.5rem;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-weight: 500;
		transition: all 0.2s;
	}

	.cancel_btn {
		background-color: #6c757d;
		color: white;
	}

	.cancel_btn:hover {
		background-color: #5a6268;
	}

	.edit_btn {
		background-color: #e74c3c;
		color: white;
	}

	.edit_btn:hover {
		background-color: #c0392b;
	}

	.cancel_btn:disabled, .edit_btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	/* 로딩 팝업 */
	.alert_mask {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.5);
		z-index: 9998;
	}

	.loading_popup {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		background: white;
		padding: 2rem;
		border-radius: 8px;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
		z-index: 9999;
		text-align: center;
	}

	.loader {
		border: 4px solid #f3f3f3;
		border-top: 4px solid #e74c3c;
		border-radius: 50%;
		width: 40px;
		height: 40px;
		animation: spin 1s linear infinite;
		margin: 0 auto 1rem;
	}

	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}

	/* 반응형 */
	@media (max-width: 768px) {
		.main-content {
			margin-left: 0;
			padding: 1rem;
		}

		.d-flex {
			flex-direction: column;
		}

		.col-12.col-lg-6 {
			width: 100%;
			margin-bottom: 1rem;
		}

		.page-title-section h5,
		.page-title-section span {
			float: none !important;
			display: inline;
		}
	}
</style>