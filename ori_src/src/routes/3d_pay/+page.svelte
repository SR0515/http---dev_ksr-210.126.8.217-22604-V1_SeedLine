<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { goto } from '$app/navigation';
	import { authStore } from '$lib/stores/auth';
	import { checkAuth } from '$lib/utils/accessControl';
	import { showToast } from '$lib/stores/toast';
	import LeftMenu from '$lib/components/LeftMenu.svelte';
	import Toast from '$lib/components/Toast.svelte';

	// 기존 시스템과 동일한 상품 데이터 구조
	interface Product {
		id: string;
		name: string;
		price: number;
		description: string;
		image?: string;
	}

	interface CustomerInfo {
		name: string;
		phone: string;
		email: string;
		postcode: string;
		address: string;
		detailAddress: string;
	}

	let selectedProducts: Array<{product: Product, quantity: number}> = [];
	let customerInfo: CustomerInfo = {
		name: '',
		phone: '',
		email: '',
		postcode: '',
		address: '',
		detailAddress: ''
	};

	let totalAmount = 0;
	let paymentInProgress = false;
	let showProductModal = false;
	let showAddressModal = false;

	// 기존 시스템과 동일한 콘솔 차단 시스템
	let originalConsole: any = {};

	onMount(async () => {
		// 권한 체크 - 가맹점만 접근 가능
		if ($authStore.classify !== '2') {
			showToast('가맹점만 접근할 수 있습니다.', 'error');
			goto('/dashboard');
			return;
		}

		const hasAccess = await checkAuth('3d_pay');
		if (!hasAccess) {
			showToast('접근 권한이 없습니다.', 'error');
			goto('/dashboard');
			return;
		}

		// 기존 시스템과 동일한 극강 콘솔 차단 시스템
		if (typeof window !== 'undefined' && !window._consoleBlocked) {
			originalConsole = {
				log: console.log,
				error: console.error,
				warn: console.warn,
				info: console.info
			};
			
			const isBlockedMessage = (args: any[]) => {
				const str = args.join(' ').toLowerCase();
				return str.includes('mainpay') || 
					   str.includes('windowlistener') ||
					   str.includes('open popup') ||
					   str.includes('pc-1.0.js');
			};
			
			// 결제 관련 로그 완전 차단
			console.log = (...args: any[]) => {
				if (!isBlockedMessage(args)) {
					originalConsole.log.apply(console, args);
				}
			};
			
			console.error = (...args: any[]) => {
				if (!isBlockedMessage(args)) {
					originalConsole.error.apply(console, args);
				}
			};
			
			window._consoleBlocked = true;
		}
	});

	onDestroy(() => {
		// 콘솔 복원
		if (typeof window !== 'undefined' && originalConsole.log) {
			console.log = originalConsole.log;
			console.error = originalConsole.error;
			console.warn = originalConsole.warn;
			console.info = originalConsole.info;
			window._consoleBlocked = false;
		}
	});

	// 상품 추가
	function addProduct(product: Product, quantity: number = 1) {
		const existingIndex = selectedProducts.findIndex(item => item.product.id === product.id);
		
		if (existingIndex >= 0) {
			selectedProducts[existingIndex].quantity += quantity;
		} else {
			selectedProducts = [...selectedProducts, { product, quantity }];
		}
		
		calculateTotal();
		showProductModal = false;
	}

	// 상품 제거
	function removeProduct(productId: string) {
		selectedProducts = selectedProducts.filter(item => item.product.id !== productId);
		calculateTotal();
	}

	// 수량 변경
	function updateQuantity(productId: string, quantity: number) {
		if (quantity <= 0) {
			removeProduct(productId);
			return;
		}
		
		const index = selectedProducts.findIndex(item => item.product.id === productId);
		if (index >= 0) {
			selectedProducts[index].quantity = quantity;
			selectedProducts = [...selectedProducts]; // 반응성 트리거
			calculateTotal();
		}
	}

	// 총액 계산
	function calculateTotal() {
		totalAmount = selectedProducts.reduce((sum, item) => {
			return sum + (item.product.price * item.quantity);
		}, 0);
	}

	// 카카오 주소 API
	function openAddressSearch() {
		if (typeof window !== 'undefined' && (window as any).daum) {
			new (window as any).daum.Postcode({
				oncomplete: function(data: any) {
					customerInfo.postcode = data.zonecode;
					customerInfo.address = data.address;
					showAddressModal = false;
				}
			}).open();
		} else {
			showToast('주소 검색 서비스를 불러올 수 없습니다.', 'error');
		}
	}

	// 폼 유효성 검사
	function validateForm(): boolean {
		if (selectedProducts.length === 0) {
			showToast('상품을 선택해주세요.', 'error');
			return false;
		}
		
		if (!customerInfo.name.trim()) {
			showToast('고객명을 입력해주세요.', 'error');
			return false;
		}
		
		if (!customerInfo.phone.trim()) {
			showToast('연락처를 입력해주세요.', 'error');
			return false;
		}
		
		if (!customerInfo.email.trim()) {
			showToast('이메일을 입력해주세요.', 'error');
			return false;
		}
		
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(customerInfo.email)) {
			showToast('올바른 이메일 형식을 입력해주세요.', 'error');
			return false;
		}
		
		return true;
	}

	// 3D 인증 결제 처리
	async function process3DPayment() {
		if (paymentInProgress) {
			showToast('결제가 진행 중입니다.', 'warning');
			return;
		}
		
		if (!validateForm()) {
			return;
		}
		
		paymentInProgress = true;
		
		try {
			// 기존 시스템과 동일한 결제 데이터 구성
			const paymentData = {
				storeId: $authStore.userId,
				customerInfo,
				products: selectedProducts,
				totalAmount,
				paymentMethod: '3d_secure',
				pgType: 'KWon', // 기본 PG사
				timestamp: new Date().toISOString()
			};
			
			const response = await fetch('/api/payment/3d_secure', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(paymentData)
			});
			
			const result = await response.json();
			
			if (result.success) {
				// 3D 인증 팝업 열기
				if (result.authUrl) {
					const popup = window.open(
						result.authUrl,
						'3d_auth',
						'width=400,height=600,scrollbars=yes,resizable=yes'
					);
					
					// 팝업 모니터링
					const checkClosed = setInterval(() => {
						if (popup?.closed) {
							clearInterval(checkClosed);
							checkPaymentResult(result.transactionId);
						}
					}, 1000);
				} else {
					// 즉시 완료
					handlePaymentSuccess(result);
				}
			} else {
				showToast(result.message || '결제 요청에 실패했습니다.', 'error');
			}
		} catch (error) {
			console.error('결제 처리 오류:', error);
			showToast('결제 처리 중 오류가 발생했습니다.', 'error');
		} finally {
			paymentInProgress = false;
		}
	}

	// 결제 결과 확인
	async function checkPaymentResult(transactionId: string) {
		try {
			const response = await fetch(`/api/payment/result/${transactionId}`);
			const result = await response.json();
			
			if (result.success) {
				handlePaymentSuccess(result);
			} else {
				showToast(result.message || '결제가 취소되었거나 실패했습니다.', 'error');
			}
		} catch (error) {
			console.error('결제 결과 확인 오류:', error);
			showToast('결제 결과를 확인할 수 없습니다.', 'error');
		}
	}

	// 결제 성공 처리
	function handlePaymentSuccess(result: any) {
		showToast('결제가 완료되었습니다!', 'success');
		
		// 기존 시스템과 동일한 완료 페이지 이동
		setTimeout(() => {
			// 결제 완료 데이터를 세션에 저장
			sessionStorage.setItem('paymentResult', JSON.stringify(result));
			goto('/3d_pay/complete');
		}, 1500);
	}

	// 금액 포맷팅
	function formatAmount(amount: number): string {
		return `${amount.toLocaleString()}원`;
	}

	// 예시 상품 데이터
	const sampleProducts: Product[] = [
		{ id: '1', name: '테스트 상품 A', price: 10000, description: '테스트용 상품입니다.' },
		{ id: '2', name: '테스트 상품 B', price: 20000, description: '테스트용 상품입니다.' },
		{ id: '3', name: '테스트 상품 C', price: 30000, description: '테스트용 상품입니다.' }
	];
</script>

<!-- 카카오 주소 API -->
<svelte:head>
	<script src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"></script>
</svelte:head>

<Toast />

<div class="page-layout">
	<LeftMenu />
	
	<main class="main-content">
		<div class="container">
			<div class="page-header">
				<h1>3D 인증결제</h1>
				<p>안전한 3D Secure 인증을 통한 온라인 결제</p>
			</div>

			<!-- 상품 선택 섹션 -->
			<div class="product-section">
				<div class="card">
					<div class="card-header">
						<h3>상품 선택</h3>
						<button class="btn btn-primary" on:click={() => showProductModal = true}>
							상품 추가
						</button>
					</div>
					
					<div class="card-body">
						{#if selectedProducts.length === 0}
							<div class="no-products">
								<p>선택된 상품이 없습니다.</p>
								<button class="btn btn-outline-primary" on:click={() => showProductModal = true}>
									상품 선택하기
								</button>
							</div>
						{:else}
							<div class="product-list">
								{#each selectedProducts as item}
									<div class="product-item">
										<div class="product-info">
											<h4>{item.product.name}</h4>
											<p>{item.product.description}</p>
											<div class="product-price">{formatAmount(item.product.price)}</div>
										</div>
										<div class="product-controls">
											<div class="quantity-controls">
												<button class="btn btn-sm" on:click={() => updateQuantity(item.product.id, item.quantity - 1)}>-</button>
												<span class="quantity">{item.quantity}</span>
												<button class="btn btn-sm" on:click={() => updateQuantity(item.product.id, item.quantity + 1)}>+</button>
											</div>
											<button class="btn btn-danger btn-sm" on:click={() => removeProduct(item.product.id)}>
												삭제
											</button>
										</div>
										<div class="item-total">
											{formatAmount(item.product.price * item.quantity)}
										</div>
									</div>
								{/each}
								
								<div class="total-amount">
									<strong>총 금액: {formatAmount(totalAmount)}</strong>
								</div>
							</div>
						{/if}
					</div>
				</div>
			</div>

			<!-- 고객 정보 섹션 -->
			<div class="customer-section">
				<div class="card">
					<div class="card-header">
						<h3>고객 정보</h3>
					</div>
					
					<div class="card-body">
						<div class="form-grid">
							<div class="form-group">
								<label for="customerName">고객명 *</label>
								<input
									type="text"
									id="customerName"
									bind:value={customerInfo.name}
									placeholder="고객명을 입력하세요"
									class="input"
									required
								/>
							</div>
							
							<div class="form-group">
								<label for="customerPhone">연락처 *</label>
								<input
									type="tel"
									id="customerPhone"
									bind:value={customerInfo.phone}
									placeholder="010-0000-0000"
									class="input"
									required
								/>
							</div>
							
							<div class="form-group">
								<label for="customerEmail">이메일 *</label>
								<input
									type="email"
									id="customerEmail"
									bind:value={customerInfo.email}
									placeholder="example@email.com"
									class="input"
									required
								/>
							</div>
							
							<div class="form-group address-group">
								<label>주소</label>
								<div class="address-inputs">
									<div class="postcode-group">
										<input
											type="text"
											bind:value={customerInfo.postcode}
											placeholder="우편번호"
											class="input"
											readonly
										/>
										<button type="button" class="btn btn-secondary" on:click={openAddressSearch}>
											주소검색
										</button>
									</div>
									<input
										type="text"
										bind:value={customerInfo.address}
										placeholder="기본주소"
										class="input"
										readonly
									/>
									<input
										type="text"
										bind:value={customerInfo.detailAddress}
										placeholder="상세주소"
										class="input"
									/>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- 결제 버튼 -->
			<div class="payment-section">
				<div class="card">
					<div class="card-body text-center">
						<div class="payment-summary">
							<h3>결제 금액: {formatAmount(totalAmount)}</h3>
							<p>3D Secure 인증을 통한 안전한 결제</p>
						</div>
						
						<button 
							class="btn btn-lg btn-success payment-btn" 
							on:click={process3DPayment}
							disabled={paymentInProgress || totalAmount === 0}
						>
							{#if paymentInProgress}
								결제 진행 중...
							{:else}
								3D 인증결제 진행
							{/if}
						</button>
					</div>
				</div>
			</div>
		</div>
	</main>
</div>

<!-- 상품 선택 모달 -->
{#if showProductModal}
	<div class="modal-backdrop" on:click={() => showProductModal = false}>
		<div class="modal" on:click|stopPropagation>
			<div class="modal-header">
				<h3>상품 선택</h3>
				<button class="close-btn" on:click={() => showProductModal = false}>&times;</button>
			</div>
			
			<div class="modal-body">
				<div class="products-grid">
					{#each sampleProducts as product}
						<div class="product-card">
							<h4>{product.name}</h4>
							<p>{product.description}</p>
							<div class="price">{formatAmount(product.price)}</div>
							<button class="btn btn-primary" on:click={() => addProduct(product)}>
								추가
							</button>
						</div>
					{/each}
				</div>
			</div>
		</div>
	</div>
{/if}

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

	.container {
		max-width: 1200px;
		margin: 0 auto;
	}

	.page-header {
		margin-bottom: 2rem;
		text-align: center;
	}

	.page-header h1 {
		font-size: 2rem;
		color: #2c3e50;
		margin-bottom: 0.5rem;
	}

	.page-header p {
		color: #7f8c8d;
		font-size: 1.1rem;
	}

	/* 카드 컴포넌트 */
	.card {
		background: white;
		border-radius: 8px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		margin-bottom: 2rem;
		overflow: hidden;
	}

	.card-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1.5rem;
		border-bottom: 1px solid #e9ecef;
		background-color: #f8f9fa;
	}

	.card-header h3 {
		margin: 0;
		color: #2c3e50;
	}

	.card-body {
		padding: 1.5rem;
	}

	/* 상품 섹션 */
	.no-products {
		text-align: center;
		padding: 3rem;
		color: #7f8c8d;
	}

	.product-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.product-item {
		display: grid;
		grid-template-columns: 1fr auto auto;
		gap: 1rem;
		align-items: center;
		padding: 1rem;
		border: 1px solid #e9ecef;
		border-radius: 8px;
	}

	.product-info h4 {
		margin: 0 0 0.5rem 0;
		color: #2c3e50;
	}

	.product-info p {
		margin: 0 0 0.5rem 0;
		color: #7f8c8d;
		font-size: 0.9rem;
	}

	.product-price {
		font-weight: 600;
		color: #e74c3c;
	}

	.product-controls {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.quantity-controls {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.quantity {
		min-width: 30px;
		text-align: center;
		font-weight: 600;
	}

	.item-total {
		font-weight: 600;
		color: #2c3e50;
		font-size: 1.1rem;
	}

	.total-amount {
		text-align: right;
		padding: 1rem;
		border-top: 2px solid #e74c3c;
		margin-top: 1rem;
		font-size: 1.2rem;
		color: #e74c3c;
	}

	/* 폼 스타일 */
	.form-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 1.5rem;
	}

	.form-group {
		display: flex;
		flex-direction: column;
	}

	.form-group label {
		margin-bottom: 0.5rem;
		font-weight: 500;
		color: #495057;
	}

	.input {
		padding: 0.75rem;
		border: 1px solid #ced4da;
		border-radius: 4px;
		font-size: 1rem;
	}

	.input:focus {
		outline: none;
		border-color: #3498db;
		box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
	}

	.address-group {
		grid-column: 1 / -1;
	}

	.address-inputs {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.postcode-group {
		display: flex;
		gap: 0.5rem;
	}

	.postcode-group input {
		flex: 1;
	}

	/* 결제 섹션 */
	.payment-section .card-body {
		padding: 3rem;
	}

	.payment-summary {
		margin-bottom: 2rem;
	}

	.payment-summary h3 {
		color: #e74c3c;
		margin-bottom: 0.5rem;
	}

	.payment-btn {
		padding: 1rem 3rem;
		font-size: 1.2rem;
		font-weight: 600;
		min-width: 250px;
	}

	/* 모달 */
	.modal-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 9999;
	}

	.modal {
		background: white;
		border-radius: 8px;
		max-width: 800px;
		width: 90%;
		max-height: 90vh;
		overflow-y: auto;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1.5rem;
		border-bottom: 1px solid #e9ecef;
	}

	.modal-header h3 {
		margin: 0;
		color: #2c3e50;
	}

	.close-btn {
		background: none;
		border: none;
		font-size: 1.5rem;
		cursor: pointer;
		color: #7f8c8d;
	}

	.close-btn:hover {
		color: #2c3e50;
	}

	.modal-body {
		padding: 1.5rem;
	}

	.products-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 1rem;
	}

	.product-card {
		padding: 1.5rem;
		border: 1px solid #e9ecef;
		border-radius: 8px;
		text-align: center;
	}

	.product-card h4 {
		margin: 0 0 0.5rem 0;
		color: #2c3e50;
	}

	.product-card p {
		margin: 0 0 1rem 0;
		color: #7f8c8d;
		font-size: 0.9rem;
	}

	.product-card .price {
		font-weight: 600;
		color: #e74c3c;
		margin-bottom: 1rem;
	}

	/* 반응형 */
	@media (max-width: 768px) {
		.main-content {
			margin-left: 0;
			padding: 1rem;
		}

		.form-grid {
			grid-template-columns: 1fr;
		}

		.product-item {
			grid-template-columns: 1fr;
			text-align: center;
		}

		.payment-section .card-body {
			padding: 1.5rem;
		}

		.payment-btn {
			width: 100%;
			min-width: auto;
		}
	}
</style>