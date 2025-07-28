<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { authStore } from '$lib/stores/auth';
	import { checkAuth } from '$lib/utils/accessControl';
	import { showToast } from '$lib/stores/toast';
	import LeftMenu from '$lib/components/LeftMenu.svelte';
	import Toast from '$lib/components/Toast.svelte';

	// 결제 데이터 인터페이스
	interface PaymentData {
		id: number;
		payment_date: string;
		store_name: string;
		card_number: string;
		quota: string;
		approval_number: string;
		approval_amount: number;
		commission_rate: number;
		settlement_amount: number;
		settlement_date: string;
		settlement_state: '0' | '1' | '2'; // 0: 준비중, 1: 대기중, 2: 완료
		transfer_state: '0' | '1'; // 0: 이체불가, 1: 이체가능
	}

	// 페이지네이션 상태
	let currentPage = 1;
	let totalPages = 1;
	let totalCount = 0;
	let pageSize = 10;

	// 검색 상태
	let searchType = 'store_name';
	let searchText = '';
	let startDate = '';
	let endDate = '';

	// 데이터 상태
	let paymentList: PaymentData[] = [];
	let loading = false;
	let selectedItems: number[] = [];

	onMount(async () => {
		// 권한 체크
		const hasAccess = await checkAuth('realtime_settlement');
		if (!hasAccess) {
			showToast('접근 권한이 없습니다.', 'error');
			goto('/dashboard');
			return;
		}

		await fetchData();
	});

	// 데이터 조회
	async function fetchData() {
		if (loading) return;
		
		loading = true;

		try {
			const params = new URLSearchParams({
				page: currentPage.toString(),
				page_size: pageSize.toString(),
				search_type: searchType,
				search_text: searchText,
				start_date: startDate,
				end_date: endDate,
				classify: $authStore.classify || '',
				rate: $authStore.rate || '',
				user_id: $authStore.userId || ''
			});

			const response = await fetch(`/api/payment/realtime_list?${params}`);
			const result = await response.json();

			if (result.success) {
				paymentList = result.data || [];
				totalPages = result.pagination?.total_pages || 1;
				totalCount = result.pagination?.total_count || 0;
			} else {
				console.error('서버 오류:', result.message);
				showToast('데이터 조회에 실패했습니다.', 'error');
			}
		} catch (error) {
			console.error('API 호출 오류:', error);
			showToast('네트워크 오류가 발생했습니다.', 'error');
		} finally {
			loading = false;
		}
	}

	// 검색 실행
	function handleSearch() {
		// 날짜 유효성 검사
		if ((startDate && !endDate) || (!startDate && endDate)) {
			showToast('시작일과 종료일을 모두 선택해주세요.', 'error');
			return;
		}

		currentPage = 1;
		fetchData();
	}

	// 페이지 변경
	function changePage(page: number) {
		if (page < 1 || page > totalPages) return;
		currentPage = page;
		fetchData();
	}

	// 페이지 크기 변경
	function changePageSize(event: Event) {
		const target = event.target as HTMLSelectElement;
		pageSize = parseInt(target.value);
		currentPage = 1;
		fetchData();
	}

	// 카드번호 마스킹
	function maskCardNumber(cardNumber: string): string {
		if (!cardNumber || cardNumber.length < 12) return cardNumber;
		return cardNumber.slice(0, 4) + '-****-****-' + cardNumber.slice(-4);
	}

	// 금액 포맷팅
	function formatAmount(amount: number): string {
		return amount.toLocaleString() + '원';
	}

	// 정산 상태 텍스트
	function getSettlementStatusText(state: string): string {
		switch (state) {
			case '0': return '정산 준비중';
			case '1': return '정산 대기중';
			case '2': return '정산 완료';
			default: return '상태 미확인';
		}
	}

	// 정산 상태 클래스
	function getSettlementStatusClass(state: string): string {
		switch (state) {
			case '0': return 'status-waiting';
			case '1': return 'status-preparing';
			case '2': return 'status-completed';
			default: return 'status-unknown';
		}
	}

	// 개별 이체 처리
	async function processTransfer(paymentId: number) {
		if (!confirm('선택한 항목을 이체 처리하시겠습니까?')) {
			return;
		}

		try {
			const response = await fetch('/api/payment/realtime_transfer', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ payment_id: paymentId })
			});

			const result = await response.json();

			if (result.success) {
				showToast('이체 처리가 완료되었습니다.', 'success');
				await fetchData(); // 데이터 새로고침
			} else {
				showToast(result.message || '이체 처리에 실패했습니다.', 'error');
			}
		} catch (error) {
			console.error('이체 처리 오류:', error);
			showToast('이체 처리 중 오류가 발생했습니다.', 'error');
		}
	}

	// 체크박스 선택/해제
	function toggleSelection(paymentId: number) {
		const index = selectedItems.indexOf(paymentId);
		if (index > -1) {
			selectedItems = selectedItems.filter(id => id !== paymentId);
		} else {
			selectedItems = [...selectedItems, paymentId];
		}
	}

	// 전체 선택/해제
	function toggleSelectAll() {
		if (selectedItems.length === paymentList.length) {
			selectedItems = [];
		} else {
			selectedItems = paymentList.map(item => item.id);
		}
	}

	// 선택된 항목 일괄 이체
	async function processSelectedTransfers() {
		if (selectedItems.length === 0) {
			showToast('이체할 항목을 선택해주세요.', 'warning');
			return;
		}

		if (!confirm(`선택한 ${selectedItems.length}개 항목을 일괄 이체 처리하시겠습니까?`)) {
			return;
		}

		try {
			const response = await fetch('/api/payment/batch_transfer', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ payment_ids: selectedItems })
			});

			const result = await response.json();

			if (result.success) {
				showToast(`${selectedItems.length}개 항목의 이체 처리가 완료되었습니다.`, 'success');
				selectedItems = [];
				await fetchData(); // 데이터 새로고침
			} else {
				showToast(result.message || '일괄 이체 처리에 실패했습니다.', 'error');
			}
		} catch (error) {
			console.error('일괄 이체 처리 오류:', error);
			showToast('일괄 이체 처리 중 오류가 발생했습니다.', 'error');
		}
	}

	// 페이지네이션 범위 계산
	$: startPage = Math.floor((currentPage - 1) / 10) * 10 + 1;
	$: endPage = Math.min(startPage + 9, totalPages);
	$: pageNumbers = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
</script>

<Toast />

<div class="page-layout">
	<LeftMenu />
	
	<main class="main-content">
		<div id="page_contect" class="">
			<!-- 검색 섹션 -->
			<section class="borderbox form_view">
				<div class="title_wrap">
					<h5 class="page_title">결제내역 관리 - 실시간 정산이체</h5>
				</div>

				<form on:submit|preventDefault={handleSearch}>
					<!-- 검색 조건 -->
					<ul class="">
						<li>
							<dl>
								<dt>검색 조건</dt>
								<dd>
									<select bind:value={searchType} class="select">
										<option value="store_name">가맹점명</option>
										<option value="approval_number">승인번호</option>
										<option value="card_number">카드번호</option>
									</select>
									<input 
										type="text" 
										bind:value={searchText}
										placeholder="검색어를 입력하세요"
										class="input"
									>
								</dd>
							</dl>
						</li>
						<li>
							<dl>
								<dt>조회 기간</dt>
								<dd>
									<input 
										type="date" 
										bind:value={startDate}
										class="input date-input"
									>
									<span class="date-separator">~</span>
									<input 
										type="date" 
										bind:value={endDate}
										class="input date-input"
									>
								</dd>
							</dl>
						</li>
					</ul>

					<div class="search-controls">
						<div class="page-selector">
							<select class="select select_listnum" on:change={changePageSize}>
								<option value="10">10건</option>
								<option value="25">25건</option>
								<option value="50">50건</option>
								<option value="100">100건</option>
							</select>
						</div>
						
						<div class="btn_box">
							<button type="submit" class="search_btn" disabled={loading}>
								{loading ? '조회 중...' : '조회'}
							</button>
							{#if selectedItems.length > 0}
								<button 
									type="button" 
									class="transfer_btn"
									on:click={processSelectedTransfers}
								>
									선택 이체 ({selectedItems.length}개)
								</button>
							{/if}
						</div>
					</div>
				</form>
			</section>

			<!-- 테이블 섹션 -->
			<section class="borderbox_table">
				<div id="table_wrap" class="table_wrap">
					<table class="table_list" width="100%">
						<caption>실시간 정산이체 테이블</caption>

						<colgroup>
							<col style="width: 3%;">  <!-- 체크박스 -->
							<col style="width: 3%;">  <!-- No -->
							<col style="width: 12%;"> <!-- 결제일 -->
							<col style="width: 12%;"> <!-- 가맹점명 -->
							<col style="width: 10%;"> <!-- 카드번호 -->
							<col style="width: 5%;">  <!-- 할부 -->
							<col style="width: 10%;"> <!-- 승인번호 -->
							<col style="width: 8%;">  <!-- 승인금액 -->
							<col style="width: 7%;">  <!-- 수수료율 -->
							<col style="width: 9%;">  <!-- 정산금액 -->
							<col style="width: 11%;"> <!-- 정산일 -->
							<col style="width: 10%;"> <!-- 이체상태 -->
						</colgroup>

						<thead>
							<tr>
								<th scope="col">
									<input 
										type="checkbox" 
										checked={selectedItems.length === paymentList.length && paymentList.length > 0}
										on:change={toggleSelectAll}
									>
								</th>
								<th scope="col">No</th>
								<th scope="col">결제일</th>
								<th scope="col">가맹점명</th>
								<th scope="col">카드번호</th>
								<th scope="col">할부</th>
								<th scope="col">승인번호</th>
								<th scope="col">승인금액</th>
								<th scope="col">수수료율</th>
								<th scope="col">정산금액</th>
								<th scope="col">정산일</th>
								<th scope="col">이체상태</th>
							</tr>
						</thead>

						<tbody>
							{#if loading}
								<tr>
									<td colspan="12" class="loading">데이터를 불러오는 중...</td>
								</tr>
							{:else if paymentList.length === 0}
								<tr>
									<td colspan="12" class="no-data">조회된 데이터가 없습니다.</td>
								</tr>
							{:else}
								{#each paymentList as payment, index}
									<tr>
										<td>
											<input 
												type="checkbox" 
												checked={selectedItems.includes(payment.id)}
												on:change={() => toggleSelection(payment.id)}
											>
										</td>
										<td>{(currentPage - 1) * pageSize + index + 1}</td>
										<td>{payment.payment_date}</td>
										<td>
											{#if payment.store_name}
												{payment.store_name}
											{:else}
												<span class="text-muted">미등록 가맹점</span>
											{/if}
										</td>
										<td>{maskCardNumber(payment.card_number)}</td>
										<td>
											{#if payment.quota === '00'}
												일시불
											{:else}
												{payment.quota}개월
											{/if}
										</td>
										<td>{payment.approval_number}</td>
										<td class="text-right">{formatAmount(payment.approval_amount)}</td>
										<td class="text-center">{payment.commission_rate}%</td>
										<td class="text-right">{formatAmount(payment.settlement_amount)}</td>
										<td>{payment.settlement_date || '-'}</td>
										<td class="status-cell">
											<div class="status-container">
												<div class="status-indicator {getSettlementStatusClass(payment.settlement_state)}">
												</div>
												<span class="status-text">{getSettlementStatusText(payment.settlement_state)}</span>
												
												{#if payment.settlement_state === '1' && payment.transfer_state === '1'}
													<button 
														class="transfer-btn"
														on:click={() => processTransfer(payment.id)}
														title="이체 처리"
													>
														이체
													</button>
												{/if}
											</div>
										</td>
									</tr>
								{/each}
							{/if}
						</tbody>
					</table>
				</div>
			</section>

			<!-- 페이지네이션 -->
			{#if totalPages > 1}
				<section class="borderbox_pageing">
					<div class="pageing">
						<div class="page_navgation">
							<!-- 첫 페이지 이동 -->
							{#if currentPage > 1}
								<button class="arrow_bt" on:click={() => changePage(1)}>
									<img class="arrow_icon chevron-double-left" src="/img/icon/chevron-double-left.svg" alt="첫 페이지">
								</button>
							{/if}

							<!-- 이전 10페이지 이동 -->
							{#if startPage > 1}
								<button class="arrow_bt" on:click={() => changePage(startPage - 1)}>
									<img class="arrow_icon chevron-left" src="/img/icon/chevron-left.svg" alt="이전 10페이지">
								</button>
							{/if}

							<!-- 페이지 번호 -->
							{#each pageNumbers as pageNum}
								<button 
									class="page-btn {currentPage === pageNum ? 'on' : ''}"
									on:click={() => changePage(pageNum)}
								>
									{pageNum}
								</button>
							{/each}

							<!-- 다음 10페이지 이동 -->
							{#if endPage < totalPages}
								<button class="arrow_bt" on:click={() => changePage(endPage + 1)}>
									<img class="arrow_icon chevron-right" src="/img/icon/chevron-right.svg" alt="다음 10페이지">
								</button>
							{/if}

							<!-- 마지막 페이지 이동 -->
							{#if currentPage < totalPages}
								<button class="arrow_bt" on:click={() => changePage(totalPages)}>
									<img class="arrow_icon chevron-double-right" src="/img/icon/chevron-double-right.svg" alt="마지막 페이지">
								</button>
							{/if}
						</div>
						
						<div class="page_info">
							총 {totalCount}건 ({currentPage}/{totalPages} 페이지)
						</div>
					</div>
				</section>
			{/if}
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

	/* 검색 컨트롤 */
	.search-controls {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: 1rem;
		padding-top: 1rem;
		border-top: 1px solid #e9ecef;
	}

	.date-input {
		width: 150px;
	}

	.date-separator {
		margin: 0 0.5rem;
		color: #666;
	}

	/* 상태 표시 */
	.status-cell {
		text-align: left;
	}

	.status-container {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.status-indicator {
		width: 12px;
		height: 12px;
		border-radius: 50%;
		display: inline-block;
	}

	.status-waiting {
		background-color: #ffc107;
	}

	.status-preparing {
		background-color: #17a2b8;
	}

	.status-completed {
		background-color: #28a745;
	}

	.status-unknown {
		background-color: #6c757d;
	}

	.status-text {
		font-size: 0.9rem;
		color: #495057;
	}

	/* 이체 버튼 */
	.transfer-btn {
		background-color: #e74c3c;
		color: white;
		border: none;
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		font-size: 0.8rem;
		cursor: pointer;
		margin-left: auto;
	}

	.transfer-btn:hover {
		background-color: #c0392b;
	}

	.transfer_btn {
		background-color: #e74c3c;
		color: white;
		border: none;
		padding: 0.5rem 1rem;
		border-radius: 4px;
		cursor: pointer;
		font-weight: 500;
	}

	.transfer_btn:hover {
		background-color: #c0392b;
	}

	/* 테이블 스타일 */
	.text-right {
		text-align: right;
	}

	.text-center {
		text-align: center;
	}

	.text-muted {
		color: #6c757d;
		font-style: italic;
	}

	.loading, .no-data {
		text-align: center;
		padding: 2rem;
		color: #6c757d;
	}

	/* 페이지네이션 */
	.page_navgation {
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}

	.arrow_bt, .page-btn {
		background: none;
		border: 1px solid #dee2e6;
		padding: 0.5rem;
		cursor: pointer;
		color: #495057;
		border-radius: 4px;
	}

	.page-btn {
		min-width: 2.5rem;
		height: 2.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.page-btn.on {
		background-color: #e74c3c;
		color: white;
		border-color: #e74c3c;
	}

	.arrow_bt:hover, .page-btn:hover {
		background-color: #f8f9fa;
	}

	.page_info {
		margin-left: 1rem;
		color: #6c757d;
		font-size: 0.9rem;
	}

	/* 반응형 */
	@media (max-width: 768px) {
		.main-content {
			margin-left: 0;
			padding: 1rem;
		}

		.search-controls {
			flex-direction: column;
			gap: 1rem;
			align-items: stretch;
		}

		.status-container {
			flex-direction: column;
			align-items: flex-start;
			gap: 0.25rem;
		}
	}
</style>