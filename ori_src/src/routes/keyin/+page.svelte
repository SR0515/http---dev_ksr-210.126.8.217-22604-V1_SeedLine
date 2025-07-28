<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { authStore } from '$lib/stores/auth';
	import { checkAuth } from '$lib/utils/accessControl';
	import { showToast } from '$lib/stores/toast';
	import LeftMenu from '$lib/components/LeftMenu.svelte';
	import Toast from '$lib/components/Toast.svelte';

	// 카드 정보 인터페이스
	interface CardInfo {
		card_num1: string;
		card_num2: string;
		card_num3: string;
		card_num4: string;
		card_info_month: string;
		card_info_year: string;
		card_pass: string;
		card_plan: string;
	}

	// 구매자 정보 인터페이스
	interface BuyerInfo {
		buyer_name: string;
		buyer_email: string;
		buyer_tel: string;
		buyer_birth: string;
	}

	// 결제 정보
	interface PaymentInfo {
		product_name: string;
		pay_sum: number;
	}

	// 폼 데이터
	let cardInfo: CardInfo = {
		card_num1: '',
		card_num2: '',
		card_num3: '',
		card_num4: '',
		card_info_month: '',
		card_info_year: '',
		card_pass: '',
		card_plan: '00'
	};

	let buyerInfo: BuyerInfo = {
		buyer_name: '',
		buyer_email: '',
		buyer_tel: '',
		buyer_birth: ''
	};

	let paymentInfo: PaymentInfo = {
		product_name: '',
		pay_sum: 1000
	};

	let keyinInProgress = false;

	onMount(async () => {
		// 권한 체크 - 가맹점만 접근 가능
		if ($authStore.classify !== '2') {
			showToast('가맹점만 접근할 수 있습니다.', 'error');
			goto('/dashboard');
			return;
		}

		const hasAccess = await checkAuth('keyinpay');
		if (!hasAccess) {
			showToast('접근 권한이 없습니다.', 'error');
			goto('/dashboard');
			return;
		}
	});

	// 기존 시스템과 동일한 자동 포커스 이동 함수
	function moveToNext(el: HTMLInputElement, maxLength: number) {
		if (el.value.length >= maxLength) {
			const next = el.nextElementSibling as HTMLInputElement;
			if (next && next.tagName === 'INPUT') {
				next.focus();
			}
		}
	}

	// 기존 시스템과 동일한 길이 제한 함수
	function limitLength(el: HTMLInputElement, maxLength: number) {
		if (el.value.length > maxLength) {
			el.value = el.value.slice(0, maxLength);
		}
	}

	// 폼 유효성 검사
	function validateForm(): boolean {
		// 결제 금액 검사
		if (!paymentInfo.pay_sum || paymentInfo.pay_sum <= 0) {
			showToast('결제 금액을 입력해주세요.', 'error');
			return false;
		}

		// 상품명 검사
		if (!paymentInfo.product_name.trim()) {
			showToast('상품명을 입력해주세요.', 'error');
			return false;
		}

		// 카드번호 검사
		if (!cardInfo.card_num1 || !cardInfo.card_num2 || !cardInfo.card_num3 || !cardInfo.card_num4) {
			showToast('카드번호를 완전히 입력해주세요.', 'error');
			return false;
		}

		// 유효기간 검사
		if (!cardInfo.card_info_month || !cardInfo.card_info_year) {
			showToast('카드 유효기간을 입력해주세요.', 'error');
			return false;
		}

		// 월 범위 검사
		const month = parseInt(cardInfo.card_info_month);
		if (month < 1 || month > 12) {
			showToast('유효한 월을 입력해주세요. (01-12)', 'error');
			return false;
		}

		// 비밀번호 검사
		if (!cardInfo.card_pass.trim()) {
			showToast('카드 비밀번호를 입력해주세요.', 'error');
			return false;
		}

		// 구매자명 검사
		if (!buyerInfo.buyer_name.trim()) {
			showToast('구매자명을 입력해주세요.', 'error');
			return false;
		}

		// 휴대폰번호 검사
		if (!buyerInfo.buyer_tel.trim()) {
			showToast('휴대폰번호를 입력해주세요.', 'error');
			return false;
		}

		// 생년월일 검사
		if (!buyerInfo.buyer_birth.trim()) {
			showToast('생년월일을 입력해주세요.', 'error');
			return false;
		}

		return true;
	}

	// 기존 시스템과 동일한 수기결제 처리
	async function keyinSubmit() {
		if (keyinInProgress) {
			showToast('결제가 진행 중입니다.', 'warning');
			return;
		}

		if (!validateForm()) {
			return;
		}

		keyinInProgress = true;

		try {
			// 기존 시스템과 동일한 데이터 구성
			const cardNumber = cardInfo.card_num1 + cardInfo.card_num2 + cardInfo.card_num3 + cardInfo.card_num4;
			const cardExpiry = cardInfo.card_info_year + cardInfo.card_info_month.padStart(2, '0');
			const storeId = $authStore.userId;

			const payload = {
				card_number: cardNumber,
				card_expiry: cardExpiry,
				card_pass: cardInfo.card_pass,
				quota: cardInfo.card_plan,
				payer_name: buyerInfo.buyer_name,
				payer_email: buyerInfo.buyer_email,
				payer_tel: buyerInfo.buyer_tel,
				payer_birth: buyerInfo.buyer_birth,
				product_name: paymentInfo.product_name,
				amount: paymentInfo.pay_sum.toString(),
				store_id: storeId
			};

			const response = await fetch('/api/kwon/payment/keyin', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			});

			const result = await response.json();
			
			if (result.success) {
				showToast('수기결제가 성공적으로 완료되었습니다!', 'success');
				
				// 기존 시스템과 동일한 완료 후 이동
				setTimeout(() => {
					goto('/payment/terminal');
				}, 1500);
			} else {
				console.error('서버 응답 오류:', result);
				showToast(result.message || '결제 처리에 실패했습니다.', 'error');
				if (result.error) {
					console.error('상세 오류:', result.error);
				}
			}
		} catch (error) {
			console.error('API 호출 중 오류 발생:', error);
			showToast('결제 처리 중 오류가 발생했습니다.', 'error');
		} finally {
			keyinInProgress = false;
		}
	}

	// 취소 버튼 처리
	function handleCancel() {
		// 폼 초기화
		cardInfo = {
			card_num1: '',
			card_num2: '',
			card_num3: '',
			card_num4: '',
			card_info_month: '',
			card_info_year: '',
			card_pass: '',
			card_plan: '00'
		};

		buyerInfo = {
			buyer_name: '',
			buyer_email: '',
			buyer_tel: '',
			buyer_birth: ''
		};

		paymentInfo = {
			product_name: '',
			pay_sum: 1000
		};

		showToast('입력 내용이 초기화되었습니다.', 'info');
	}

	// 숫자만 입력 허용 함수
	function handleNumberInput(event: Event) {
		const target = event.target as HTMLInputElement;
		target.value = target.value.replace(/[^0-9]/g, '');
	}

	// 카드번호 입력 처리
	function handleCardInput(event: Event, maxLength: number) {
		const target = event.target as HTMLInputElement;
		handleNumberInput(event);
		limitLength(target, maxLength);
		moveToNext(target, maxLength);
	}

	// 유효기간 입력 처리
	function handleExpiryInput(event: Event, maxLength: number) {
		const target = event.target as HTMLInputElement;
		handleNumberInput(event);
		limitLength(target, maxLength);
		if (maxLength === 2) {
			moveToNext(target, maxLength);
		}
	}
</script>

<Toast />

<div class="page-layout">
	<LeftMenu />
	
	<main class="main-content">
		<div id="page_contect" class="">
			<section class="borderbox form_view">
				<div class="title_wrap">
					<h5 class="page_title">수기결제</h5>
				</div>

				<form on:submit|preventDefault={keyinSubmit}>
					<input type="hidden" name="keyin_id" value="" readonly />
					
					<div class="key_inpay_wrap">
						<ul>
							<li>
								<div class="half_row">
									<div class="pay_money_text">
										<div class="cd_dlex">
											<label for="pay_sum">결제금액</label>
											<div class="cd_dlex1">
												<input 
													class="" 
													type="number" 
													placeholder="0" 
													name="pay_sum" 
													id="pay_sum" 
													bind:value={paymentInfo.pay_sum}
													min="1"
													required
												>
												<span>원</span>
											</div>
										</div>
									</div>

									<div class="pay_money_select">
										<div class="cd_dlex">
											<label for="card_plan">개월수</label>
											<select class="select" name="card_plan" bind:value={cardInfo.card_plan}>
												<option value="00">일시불</option>
												<option value="02">2개월</option>
												<option value="03">3개월</option>
												<option value="04">4개월</option>
												<option value="05">5개월</option>
												<option value="06">6개월</option>
												<option value="07">7개월</option>
												<option value="08">8개월</option>
												<option value="09">9개월</option>
												<option value="10">10개월</option>
												<option value="11">11개월</option>
												<option value="12">12개월</option>
											</select>
										</div>
									</div>
								</div>
							</li>

							<li>
								<div class="cd_dlex">
									<label for="product_name">상품명</label>
									<input 
										class="" 
										type="text" 
										placeholder="상품명을 입력해주세요." 
										name="product_name" 
										id="product_name"
										bind:value={paymentInfo.product_name}
										required
									>
								</div>
							</li>

							<li>
								<div class="cd_dlex">
									<label for="card_num1">카드번호</label>
									<div class="cd_dlex1">
										<input 
											class="" 
											type="text" 
											placeholder="xxxx" 
											name="card_num1" 
											id="card_num1"
											bind:value={cardInfo.card_num1}
											maxlength="4"
											on:input={(e) => handleCardInput(e, 4)}
											required
										>
										<input 
											class="" 
											type="text" 
											placeholder="xxxx" 
											name="card_num2"
											bind:value={cardInfo.card_num2}
											maxlength="4"
											on:input={(e) => handleCardInput(e, 4)}
											required
										>
										<input 
											class="" 
											type="text" 
											placeholder="xxxx" 
											name="card_num3"
											bind:value={cardInfo.card_num3}
											maxlength="4"
											on:input={(e) => handleCardInput(e, 4)}
											required
										>
										<input 
											class="" 
											type="text" 
											placeholder="xxxx" 
											name="card_num4"
											bind:value={cardInfo.card_num4}
											maxlength="4"
											on:input={(e) => handleNumberInput(e)}
											required
										>
									</div>
								</div>
							</li>

							<li>
								<div class="cd_dlex">
									<label for="card_info_month">유효기간</label>
									<div class="cd_dlex1">
										<input 
											class="" 
											type="text" 
											placeholder="MM" 
											name="card_info_month" 
											id="card_info_month"
											bind:value={cardInfo.card_info_month}
											maxlength="2"
											on:input={(e) => handleExpiryInput(e, 2)}
											required
										>
										<input 
											class="" 
											type="text" 
											placeholder="YY" 
											name="card_info_year"
											bind:value={cardInfo.card_info_year}
											maxlength="2"
											on:input={(e) => handleExpiryInput(e, 2)}
											required
										>
									</div>
								</div>
							</li>
						</ul>

						<ul>
							<li>
								<div class="cd_dlex">
									<label for="card_pass">비밀번호</label>
									<input 
										class="" 
										type="password" 
										placeholder="비밀번호를 입력해주세요." 
										name="card_pass" 
										id="card_pass"
										bind:value={cardInfo.card_pass}
										required
									>
								</div>
							</li>

							<li>
								<div class="cd_dlex">
									<label for="buyer_birth">생년월일</label>
									<input 
										class="" 
										type="text" 
										placeholder="생년월일을 입력해주세요. (YYYYMMDD)" 
										name="buyer_birth" 
										id="buyer_birth"
										bind:value={buyerInfo.buyer_birth}
										maxlength="8"
										on:input={handleNumberInput}
										required
									>
								</div>
							</li>

							<li>
								<div class="cd_dlex">
									<label for="buyer_name">구매자성명</label>
									<input 
										class="" 
										type="text" 
										placeholder="고객명을 입력해주세요." 
										name="buyer_name" 
										id="buyer_name"
										bind:value={buyerInfo.buyer_name}
										required
									>
								</div>
							</li>

							<li>
								<div class="cd_dlex">
									<label for="buyer_tel">휴대폰번호</label>
									<input 
										class="" 
										type="text" 
										placeholder="숫자만 입력해주세요." 
										name="buyer_tel" 
										id="buyer_tel"
										bind:value={buyerInfo.buyer_tel}
										on:input={handleNumberInput}
										required
									>
								</div>
							</li>

							<li>
								<div class="cd_dlex">
									<label for="buyer_email">구매자 이메일</label>
									<input 
										class="" 
										type="email" 
										placeholder="이메일을 입력해주세요." 
										name="buyer_email" 
										id="buyer_email"
										bind:value={buyerInfo.buyer_email}
									>
								</div>
							</li>
						</ul>
					</div>

					<div class="sub_box">
						<div class="btn_box">
							<button 
								type="button" 
								class="cancel_bt" 
								on:click={handleCancel}
								disabled={keyinInProgress}
							>
								취소
							</button>
							<button 
								type="submit" 
								class="edit_bt"
								disabled={keyinInProgress}
							>
								{keyinInProgress ? '처리 중...' : '승인요청'}
							</button>
						</div>
					</div>
				</form>
			</section>
		</div>
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

	/* 기존 CSS 스타일과 호환 */
	button:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	/* 반응형 */
	@media (max-width: 768px) {
		.main-content {
			margin-left: 0;
			padding: 1rem;
		}
	}
</style>