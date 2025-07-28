<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { authStore } from '$lib/stores/auth';
	import { checkAuth } from '$lib/utils/accessControl';
	import { showToast } from '$lib/stores/toast';
	import LeftMenu from '$lib/components/LeftMenu.svelte';

	// 기존 시스템과 동일한 결제 데이터 구조
	interface Payment {
		id: string;
		transactionId: string;
		storeName: string;
		storeId: string;
		paymentAmount: number;
		commission: number;
		pgType: string; // Korpay, Galaxia, Ksnet, KWon
		paymentMethod: string; // 카드, 계좌이체, 가상계좌
		status: string; // completed, cancelled, pending, failed
		paymentDate: string;
		cancelDate?: string;
		cancelReason?: string;
		canCancel: boolean; // 당일 결제만 취소 가능
		customerName: string;
		customerPhone: string;
		productName: string;
		approvalNumber: string;
		partnerName?: string;
		upperPath?: string;
	}

	interface PaymentSearch {
		storeName: string;
		storeId: string;
		partnerName: string;
		transactionId: string;
		customerName: string;
		pgType: string;
		status: string;
		startDate: string;
		endDate: string;
		minAmount: string;
		maxAmount: string;
	}

	interface PaymentStats {
		totalCount: number;
		totalAmount: number;
		completedCount: number;
		completedAmount: number;
		cancelledCount: number;
		cancelledAmount: number;
		commissionTotal: number;
	}

	let payments: Payment[] = [];
	let searchParams: PaymentSearch = {
		storeName: '',
		storeId: '',
		partnerName: '',
		transactionId: '',
		customerName: '',
		pgType: '',
		status: '',
		startDate: '',
		endDate: '',
		minAmount: '',
		maxAmount: ''
	};

	let stats: PaymentStats = {
		totalCount: 0,
		totalAmount: 0,
		completedCount: 0,
		completedAmount: 0,
		cancelledCount: 0,
		cancelledAmount: 0,
		commissionTotal: 0
	};

	let pagination = {
		page: 1,
		totalPages: 1,
		totalCount: 0,
		perPage: 20
	};

	let loading = false;
	let showDetailModal = false;
	let selectedPayment: Payment | null = null;

	// 기존 시스템과 동일한 날짜 초기화 (오늘)
	onMount(async () => {
		// 권한 체크 - classify !== '1' (파트너 제외)
		if ($authStore.classify === '1') {
			showToast('파트너는 접근할 수 없습니다.', 'error');
			goto('/dashboard');
			return;
		}

		const hasAccess = await checkAuth('terminal_pay');
		if (!hasAccess) {
			showToast('접근 권한이 없습니다.', 'error');
			goto('/dashboard');
			return;
		}

		// 오늘 날짜로 초기화
		const today = new Date().toISOString().split('T')[0];
		searchParams.startDate = today;
		searchParams.endDate = today;

		await fetchPayments();
	});

	// 기존 시스템과 동일한 결제 내역 조회
	async function fetchPayments() {
		loading = true;
		
		try {
			const params = new URLSearchParams({
				classify: $authStore.classify || '',
				rate: $authStore.rate || '',
				userId: $authStore.userId || '',
				page: pagination.page.toString(),
				perPage: pagination.perPage.toString(),
				...searchParams
			});

			const response = await fetch(`/api/payment/terminal?${params}`);
			const result = await response.json();

			if (result.success) {
				payments = result.data.payments || [];
				stats = result.data.stats || stats;
				pagination = {
					...pagination,
					...result.data.pagination
				};
			} else {
				showToast(result.message || '데이터 로딩에 실패했습니다.', 'error');
			}
		} catch (error) {
			console.error('결제 내역 조회 오류:', error);
			showToast('네트워크 오류가 발생했습니다.', 'error');
		} finally {
			loading = false;
		}
	}

	// 기존 시스템과 동일한 결제 취소 기능 (당일만)
	async function cancelPayment(payment: Payment) {
		if (!payment.canCancel) {
			showToast('당일 결제만 취소할 수 있습니다.', 'error');
			return;
		}

		const confirmed = confirm(`결제를 취소하시겠습니까?\n\n거래일시: ${payment.transactionId}\n결제금액: ${formatAmount(payment.paymentAmount)}`);
		
		if (!confirmed) return;

		try {
			const response = await fetch('/api/payment/cancel', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					transactionId: payment.transactionId,
					pgType: payment.pgType,
					userId: $authStore.userId
				})
			});

			const result = await response.json();

			if (result.success) {
				showToast('결제가 성공적으로 취소되었습니다.', 'success');
				await fetchPayments(); // 목록 새로고침
			} else {
				showToast(result.message || '취소에 실패했습니다.', 'error');
			}
		} catch (error) {
			console.error('결제 취소 오류:', error);
			showToast('네트워크 오류가 발생했습니다.', 'error');
		}
	}

	// 검색 기능
	async function handleSearch() {
		// 날짜 검증
		if ((searchParams.startDate && !searchParams.endDate) || 
			(!searchParams.startDate && searchParams.endDate)) {
			showToast('시작일과 종료일을 모두 선택해주세요.', 'error');
			return;
		}

		// 금액 범위 검증
		if (searchParams.minAmount && searchParams.maxAmount) {
			const min = parseFloat(searchParams.minAmount);
			const max = parseFloat(searchParams.maxAmount);
			if (min > max) {
				showToast('최소 금액이 최대 금액보다 클 수 없습니다.', 'error');
				return;
			}
		}

		pagination.page = 1;
		await fetchPayments();
	}

	// 검색 초기화
	function resetSearch() {
		const today = new Date().toISOString().split('T')[0];
		searchParams = {
			storeName: '',
			storeId: '',
			partnerName: '',
			transactionId: '',
			customerName: '',
			pgType: '',
			status: '',
			startDate: today,
			endDate: today,
			minAmount: '',
			maxAmount: ''
		};
		pagination.page = 1;
		fetchPayments();
	}

	// 페이지 변경
	async function changePage(newPage: number) {
		if (newPage < 1 || newPage > pagination.totalPages) return;
		
		pagination.page = newPage;
		await fetchPayments();
	}

	// 페이지 크기 변경
	async function changePerPage(newPerPage: number) {
		pagination.perPage = newPerPage;
		pagination.page = 1;
		await fetchPayments();
	}

	// 상세 보기
	function viewPaymentDetail(payment: Payment) {
		selectedPayment = payment;
		showDetailModal = true;
	}

	// 모달 닫기
	function closeModal() {
		showDetailModal = false;
		selectedPayment = null;
	}

	// 금액 포맷팅
	function formatAmount(amount: number): string {
		return `${amount.toLocaleString()}원`;
	}

	// 날짜 포맷팅
	function formatDate(dateString: string): string {
		return dateString.replace(' ', '\n');
	}

	// PG사 로고 경로
	function getPgLogo(pgType: string): string {
		return `/img/logo/${pgType.toLowerCase()}.png`;
	}

	// 결제 상태 텍스트
	function getStatusText(status: string): string {
		switch(status) {
			case 'completed': return '완료';
			case 'cancelled': return '취소';
			case 'pending': return '대기';
			case 'failed': return '실패';
			default: return status;
		}
	}

	// 결제 방법 텍스트
	function getPaymentMethodText(method: string): string {
		switch(method) {
			case 'card': return '카드';
			case 'transfer': return '계좌이체';
			case 'virtual': return '가상계좌';
			default: return method;
		}
	}

	// 파일 다운로드 (엑셀 내보내기)
	async function downloadExcel() {
		try {
			const params = new URLSearchParams({
				classify: $authStore.classify || '',
				rate: $authStore.rate || '',
				userId: $authStore.userId || '',
				export: 'excel',
				...searchParams
			});

			const response = await fetch(`/api/payment/terminal/export?${params}`);
			
			if (response.ok) {
				const blob = await response.blob();
				const url = window.URL.createObjectURL(blob);
				const a = document.createElement('a');
				a.href = url;
				a.download = `결제내역_${new Date().toISOString().split('T')[0]}.xlsx`;
				document.body.appendChild(a);
				a.click();
				document.body.removeChild(a);
				window.URL.revokeObjectURL(url);
				
				showToast('엑셀 파일이 다운로드되었습니다.', 'success');
			} else {
				showToast('다운로드에 실패했습니다.', 'error');
			}
		} catch (error) {
			console.error('다운로드 오류:', error);
			showToast('네트워크 오류가 발생했습니다.', 'error');
		}
	}

	// 페이지네이션 계산
	$: startPage = Math.floor((pagination.page - 1) / 10) * 10 + 1;
	$: endPage = Math.min(startPage + 9, pagination.totalPages);
</script>

<div class="page-layout">
	<LeftMenu />
	
	<main class="main-content">
		<div class="container">
			<div class="page-header">
				<h1>매출 조회</h1>
				<div class="header-actions">
					<button class="btn btn-success" on:click={downloadExcel}>
						엑셀 내보내기
					</button>
				</div>
			</div>

			<!-- 통계 카드 -->
			<div class="stats-section">
				<div class="stats-grid">
					<div class="stat-card total">
						<div class="stat-header">
							<h3>전체 결제</h3>
							<div class="stat-icon total-icon"></div>
						</div>
						<div class="stat-content">
							<div class="stat-number">{stats.totalCount.toLocaleString()}</div>
							<div class="stat-label">건</div>
						</div>
						<div class="stat-amount">{formatAmount(stats.totalAmount)}</div>
					</div>

					<div class="stat-card completed">
						<div class="stat-header">
							<h3>완료 결제</h3>
							<div class="stat-icon completed-icon"></div>
						</div>
						<div class="stat-content">
							<div class="stat-number">{stats.completedCount.toLocaleString()}</div>
							<div class="stat-label">건</div>
						</div>
						<div class="stat-amount">{formatAmount(stats.completedAmount)}</div>
					</div>

					<div class="stat-card cancelled">
						<div class="stat-header">
							<h3>취소 결제</h3>
							<div class="stat-icon cancelled-icon"></div>
						</div>
						<div class="stat-content">
							<div class="stat-number">{stats.cancelledCount.toLocaleString()}</div>
							<div class="stat-label">건</div>
						</div>
						<div class="stat-amount">{formatAmount(stats.cancelledAmount)}</div>
					</div>

					<div class="stat-card commission">
						<div class="stat-header">
							<h3>수수료 수입</h3>
							<div class="stat-icon commission-icon"></div>
						</div>
						<div class="stat-content">
							<div class="stat-number">{formatAmount(stats.commissionTotal)}</div>
						</div>
					</div>
				</div>
			</div>

			<!-- 검색 필터 -->
			<div class="search-section">
				<div class="card">
					<div class="card-header">
						<h3>검색 조건</h3>
					</div>
					<div class="card-body">
						<div class="search-form">
							<div class="form-row">
								<div class="form-group">
									<label>가맹점명</label>
									<input
										type="text"
										bind:value={searchParams.storeName}
										placeholder="가맹점명 입력"
										class="input"
									/>
								</div>
								<div class="form-group">
									<label>거래일시</label>
									<input
										type="text"
										bind:value={searchParams.transactionId}
										placeholder="거래일시 입력"
										class="input"
									/>
								</div>
								<div class="form-group">
									<label>고객명</label>
									<input
										type="text"
										bind:value={searchParams.customerName}
										placeholder="고객명 입력"
										class="input"
									/>
								</div>
								<div class="form-group">
									<label>PG사</label>
									<select bind:value={searchParams.pgType} class="select">
										<option value="">전체</option>
										<option value="Korpay">한국페이</option>
										<option value="Galaxia">갤럭시아</option>
										<option value="Ksnet">케이에스넷</option>
										<option value="KWon">퀀</option>
									</select>
								</div>
							</div>

							<div class="form-row">
								<div class="form-group">
									<label>결제일 시작</label>
									<input
										type="date"
										bind:value={searchParams.startDate}
										class="input"
									/>
								</div>
								<div class="form-group">
									<label>결제일 종료</label>
									<input
										type="date"
										bind:value={searchParams.endDate}
										class="input"
									/>
								</div>
								<div class="form-group">
									<label>최소금액</label>
									<input
										type="number"
										bind:value={searchParams.minAmount}
										placeholder="최소금액"
										class="input"
									/>
								</div>
								<div class="form-group">
									<label>최대금액</label>
									<input
										type="number"
										bind:value={searchParams.maxAmount}
										placeholder="최대금액"
										class="input"
									/>
								</div>
							</div>

							<div class="form-row">
								<div class="form-group">
									<label>상태</label>
									<select bind:value={searchParams.status} class="select">
										<option value="">전체</option>
										<option value="completed">완료</option>
										<option value="cancelled">취소</option>
										<option value="pending">대기</option>
										<option value="failed">실패</option>
									</select>
								</div>
								<div class="form-group search-buttons">
									<button class="btn btn-primary" on:click={handleSearch} disabled={loading}>
										검색
									</button>
									<button class="btn btn-secondary" on:click={resetSearch}>
										초기화
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- 결제 목록 -->
			<div class="table-section">
				<div class="card">
					<div class="card-header">
						<h3>결제 내역</h3>
						<div class="list-controls">
							<span class="total-count">총 {pagination.totalCount.toLocaleString()}개</span>
							<select bind:value={pagination.perPage} on:change={() => changePerPage(pagination.perPage)} class="per-page-select">
								<option value={20}>20개씩 보기</option>
								<option value={50}>50개씩 보기</option>
								<option value={100}>100개씩 보기</option>
							</select>
						</div>
					</div>
					
					<div class="table-container">
						{#if loading}
							<div class="loading-overlay">
								<div class="loading-spinner"></div>
								<p>데이터를 불러오는 중...</p>
							</div>
						{:else}
							<table class="table">
								<thead>
									<tr>
										<th>No</th>
										<th>결제일시</th>
										<th>가맹점</th>
										<th>고객명</th>
										<th>상품명</th>
										<th>결제금액</th>
										<th>수수료</th>
										<th>PG사</th>
										<th>결제방법</th>
										<th>상태</th>
										<th>관리</th>
									</tr>
								</thead>
								<tbody>
									{#if payments.length === 0}
										<tr>
											<td colspan="11" class="no-data">결제 내역이 없습니다.</td>
										</tr>
									{:else}
										{#each payments as payment, index}
											<tr class="payment-row">
												<td>{(pagination.page - 1) * pagination.perPage + index + 1}</td>
												<td class="payment-date">
													<div class="date-wrapper">
														{@html formatDate(payment.paymentDate)}
													</div>
													<div class="transaction-id">{payment.transactionId}</div>
												</td>
												<td class="store-info">
													<div class="store-name">{payment.storeName}</div>
													<div class="store-id">{payment.storeId}</div>
												</td>
												<td class="customer-info">
													<div class="customer-name">{payment.customerName}</div>
													<div class="customer-phone">{payment.customerPhone}</div>
												</td>
												<td class="product-name">{payment.productName}</td>
												<td class="amount">{formatAmount(payment.paymentAmount)}</td>
												<td class="commission">{formatAmount(payment.commission)}</td>
												<td class="pg-info">
													<img src={getPgLogo(payment.pgType)} alt={payment.pgType} class="pg-logo" />
													<span>{payment.pgType}</span>
												</td>
												<td class="payment-method">{getPaymentMethodText(payment.paymentMethod)}</td>
												<td>
													<span class="status status-{payment.status}">
														{getStatusText(payment.status)}
													</span>
												</td>
												<td class="actions">
													<button class="btn btn-sm btn-info" on:click={() => viewPaymentDetail(payment)}>
														상세
													</button>
													{#if payment.canCancel && payment.status === 'completed'}
														<button class="btn btn-sm btn-danger" on:click={() => cancelPayment(payment)}>
															취소
														</button>
													{/if}
												</td>
											</tr>
										{/each}
									{/if}
								</tbody>
							</table>
						{/if}
					</div>

					<!-- 페이지네이션 -->
					{#if pagination.totalPages > 1}
						<div class="pagination">
							{#if startPage > 1}
								<button class="page-btn" on:click={() => changePage(startPage - 1)}>이전</button>
							{/if}

							{#each Array(endPage - startPage + 1) as _, i}
								{@const pageNum = startPage + i}
								<button 
									class="page-btn" 
									class:active={pageNum === pagination.page}
									on:click={() => changePage(pageNum)}
								>
									{pageNum}
								</button>
							{/each}

							{#if endPage < pagination.totalPages}
								<button class="page-btn" on:click={() => changePage(endPage + 1)}>다음</button>
							{/if}
						</div>
					{/if}
				</div>
			</div>
		</div>
	</main>
</div>

<!-- 상세 보기 모달 -->
{#if showDetailModal && selectedPayment}
	<div class="modal-backdrop" on:click={closeModal}>
		<div class="modal" on:click|stopPropagation>
			<div class="modal-header">
				<h3>결제 상세 정보</h3>
				<button class="close-btn" on:click={closeModal}>&times;</button>
			</div>
			
			<div class="modal-body">
				<div class="detail-grid">
					<div class="detail-item">
						<label>거래일시</label>
						<span>{selectedPayment.transactionId}</span>
					</div>
					<div class="detail-item">
						<label>승인번호</label>
						<span>{selectedPayment.approvalNumber}</span>
					</div>
					<div class="detail-item">
						<label>가맹점</label>
						<span>{selectedPayment.storeName} ({selectedPayment.storeId})</span>
					</div>
					<div class="detail-item">
						<label>고객 정보</label>
						<span>{selectedPayment.customerName} ({selectedPayment.customerPhone})</span>
					</div>
					<div class="detail-item">
						<label>상품명</label>
						<span>{selectedPayment.productName}</span>
					</div>
					<div class="detail-item">
						<label>결제금액</label>
						<span class="amount">{formatAmount(selectedPayment.paymentAmount)}</span>
					</div>
					<div class="detail-item">
						<label>수수료</label>
						<span class="commission">{formatAmount(selectedPayment.commission)}</span>
					</div>
					<div class="detail-item">
						<label>PG사</label>
						<span>{selectedPayment.pgType}</span>
					</div>
					<div class="detail-item">
						<label>결제방법</label>
						<span>{getPaymentMethodText(selectedPayment.paymentMethod)}</span>
					</div>
					<div class="detail-item">
						<label>결제일시</label>
						<span>{selectedPayment.paymentDate}</span>
					</div>
					{#if selectedPayment.status === 'cancelled' && selectedPayment.cancelDate}
						<div class="detail-item">
							<label>취소일시</label>
							<span>{selectedPayment.cancelDate}</span>
						</div>
						<div class="detail-item">
							<label>취소사유</label>
							<span>{selectedPayment.cancelReason || '-'}</span>
						</div>
					{/if}
					<div class="detail-item full-width">
						<label>상태</label>
						<span class="status status-{selectedPayment.status}">
							{getStatusText(selectedPayment.status)}
						</span>
					</div>
				</div>
			</div>
			
			<div class="modal-footer">
				{#if selectedPayment.canCancel && selectedPayment.status === 'completed'}
					<button class="btn btn-danger" on:click={() => cancelPayment(selectedPayment)}>
						결제 취소
					</button>
				{/if}
				<button class="btn btn-secondary" on:click={closeModal}>
					닫기
				</button>
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
		max-width: 1600px;
		margin: 0 auto;
	}

	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;
	}

	.page-header h1 {
		font-size: 2rem;
		color: #2c3e50;
		margin: 0;
	}

	/* 통계 카드 */
	.stats-section {
		margin-bottom: 2rem;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 1.5rem;
	}

	.stat-card {
		background: white;
		border-radius: 8px;
		padding: 1.5rem;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		transition: transform 0.2s;
	}

	.stat-card:hover {
		transform: translateY(-2px);
	}

	.stat-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
	}

	.stat-header h3 {
		font-size: 1rem;
		color: #7f8c8d;
		margin: 0;
		font-weight: 500;
	}

	.stat-icon {
		width: 40px;
		height: 40px;
		border-radius: 8px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.total-icon { background-color: #e8f4fd; }
	.completed-icon { background-color: #e8f5e8; }
	.cancelled-icon { background-color: #ffe8e8; }
	.commission-icon { background-color: #fff2e8; }

	.stat-content {
		display: flex;
		align-items: baseline;
		gap: 0.5rem;
		margin-bottom: 0.5rem;
	}

	.stat-number {
		font-size: 2rem;
		font-weight: 700;
		color: #2c3e50;
	}

	.stat-label {
		font-size: 1rem;
		color: #7f8c8d;
	}

	.stat-amount {
		font-size: 1.1rem;
		color: #3498db;
		font-weight: 600;
	}

	/* 검색 및 테이블 */
	.search-section, .table-section {
		margin-bottom: 2rem;
	}

	.card {
		background: white;
		border-radius: 8px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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

	.search-form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.form-row {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1rem;
		align-items: end;
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

	.input, .select {
		padding: 0.75rem;
		border: 1px solid #ced4da;
		border-radius: 4px;
		font-size: 0.95rem;
	}

	.input:focus, .select:focus {
		outline: none;
		border-color: #3498db;
		box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
	}

	.search-buttons {
		display: flex;
		gap: 0.5rem;
	}

	.list-controls {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.total-count {
		font-weight: 600;
		color: #495057;
	}

	.per-page-select {
		padding: 0.5rem;
		border: 1px solid #ced4da;
		border-radius: 4px;
		font-size: 0.9rem;
	}

	/* 테이블 */
	.table-container {
		position: relative;
		overflow-x: auto;
	}

	.loading-overlay {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 3rem;
		color: #7f8c8d;
	}

	.loading-spinner {
		width: 40px;
		height: 40px;
		border: 3px solid #e9ecef;
		border-top: 3px solid #3498db;
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin-bottom: 1rem;
	}

	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}

	.table {
		width: 100%;
		border-collapse: collapse;
		min-width: 1200px;
	}

	.table th,
	.table td {
		padding: 1rem 0.75rem;
		text-align: left;
		border-bottom: 1px solid #e9ecef;
		vertical-align: top;
	}

	.table th {
		background-color: #f8f9fa;
		font-weight: 600;
		color: #495057;
		white-space: nowrap;
		position: sticky;
		top: 0;
		z-index: 10;
	}

	.payment-row:hover {
		background-color: #f8f9fa;
	}

	.no-data {
		text-align: center;
		color: #7f8c8d;
		font-style: italic;
		padding: 3rem;
	}

	/* 테이블 셀 스타일 */
	.payment-date {
		white-space: nowrap;
	}

	.date-wrapper {
		font-weight: 600;
		color: #2c3e50;
		line-height: 1.3;
	}

	.transaction-id {
		font-size: 0.85rem;
		color: #7f8c8d;
		margin-top: 0.25rem;
	}

	.store-info, .customer-info {
		min-width: 120px;
	}

	.store-name, .customer-name {
		font-weight: 600;
		color: #2c3e50;
	}

	.store-id, .customer-phone {
		font-size: 0.85rem;
		color: #7f8c8d;
		margin-top: 0.25rem;
	}

	.product-name {
		max-width: 150px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.amount {
		font-weight: 600;
		color: #2c3e50;
		text-align: right;
	}

	.commission {
		font-weight: 600;
		color: #e74c3c;
		text-align: right;
	}

	.pg-info {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.pg-logo {
		width: 24px;
		height: 24px;
		object-fit: contain;
	}

	.payment-method {
		white-space: nowrap;
	}

	.status {
		padding: 0.25rem 0.75rem;
		border-radius: 20px;
		font-size: 0.85rem;
		font-weight: 500;
		white-space: nowrap;
	}

	.status-completed {
		background-color: #d4edda;
		color: #155724;
	}

	.status-cancelled {
		background-color: #f8d7da;
		color: #721c24;
	}

	.status-pending {
		background-color: #fff3cd;
		color: #856404;
	}

	.status-failed {
		background-color: #f8d7da;
		color: #721c24;
	}

	.actions {
		white-space: nowrap;
	}

	.actions .btn {
		margin-right: 0.5rem;
	}

	/* 페이지네이션 */
	.pagination {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 0.5rem;
		padding: 1.5rem;
		border-top: 1px solid #e9ecef;
	}

	.page-btn {
		padding: 0.5rem 0.75rem;
		border: 1px solid #ced4da;
		background: white;
		color: #495057;
		border-radius: 4px;
		cursor: pointer;
		transition: all 0.2s;
	}

	.page-btn:hover {
		background-color: #e9ecef;
	}

	.page-btn.active {
		background-color: #3498db;
		color: white;
		border-color: #3498db;
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

	.detail-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}

	.detail-item {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.detail-item.full-width {
		grid-column: 1 / -1;
	}

	.detail-item label {
		font-weight: 600;
		color: #495057;
		font-size: 0.9rem;
	}

	.detail-item span {
		color: #2c3e50;
	}

	.detail-item .amount {
		font-weight: 600;
		color: #2c3e50;
	}

	.detail-item .commission {
		font-weight: 600;
		color: #e74c3c;
	}

	.modal-footer {
		display: flex;
		justify-content: flex-end;
		gap: 0.5rem;
		padding: 1.5rem;
		border-top: 1px solid #e9ecef;
	}

	/* 반응형 */
	@media (max-width: 768px) {
		.main-content {
			margin-left: 0;
			padding: 1rem;
		}

		.page-header {
			flex-direction: column;
			align-items: flex-start;
			gap: 1rem;
		}

		.stats-grid {
			grid-template-columns: 1fr;
			gap: 1rem;
		}

		.form-row {
			grid-template-columns: 1fr;
		}

		.table {
			font-size: 0.85rem;
		}

		.table th,
		.table td {
			padding: 0.75rem 0.5rem;
		}

		.detail-grid {
			grid-template-columns: 1fr;
		}
	}
</style>