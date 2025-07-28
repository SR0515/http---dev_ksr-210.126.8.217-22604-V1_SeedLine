<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { authStore } from '$lib/stores/auth';
	import { checkAuth } from '$lib/utils/accessControl';
	import { showToast } from '$lib/stores/toast';
	import LeftMenu from '$lib/components/LeftMenu.svelte';
	import Toast from '$lib/components/Toast.svelte';

	// 정산 데이터 인터페이스
	interface SettlementData {
		id: number;
		settlement_date: string;
		title: string;
		total_amount: number;
		settlement_amount: number;
		fee_amount: number;
		transaction_count: number;
		status: 'pending' | 'processing' | 'completed';
		created_date: string;
	}

	// 페이지네이션 상태
	let currentPage = 1;
	let totalPages = 1;
	let totalCount = 0;
	let pageSize = 10;

	// 검색 상태
	let startDate = '';
	let endDate = '';

	// 데이터 상태
	let settlementList: SettlementData[] = [];
	let loading = false;

	// 오늘 날짜
	const today = new Date().toISOString().split('T')[0];

	onMount(async () => {
		// 권한 체크 - 관리자와 가맹점만 접근 가능
		if ($authStore.classify !== '0' && $authStore.classify !== '2') {
			showToast('관리자 또는 가맹점만 접근할 수 있습니다.', 'error');
			goto('/dashboard');
			return;
		}

		const hasAccess = await checkAuth('settlement_store');
		if (!hasAccess) {
			showToast('접근 권한이 없습니다.', 'error');
			goto('/dashboard');
			return;
		}

		// 기본 날짜 설정 (최근 7일)
		const oneWeekAgo = new Date();
		oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
		startDate = oneWeekAgo.toISOString().split('T')[0];
		endDate = today;

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
				start_date: startDate,
				end_date: endDate,
				classify: $authStore.classify || '',
				user_id: $authStore.userId || ''
			});

			const response = await fetch(`/api/settlement/store_list?${params}`);
			const result = await response.json();

			if (result.success) {
				settlementList = result.data || [];
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
		if (!startDate || !endDate) {
			showToast('시작일과 종료일을 모두 선택해주세요.', 'error');
			return;
		}

		if (new Date(startDate) > new Date(endDate)) {
			showToast('시작일이 종료일보다 늦을 수 없습니다.', 'error');
			return;
		}

		currentPage = 1;
		fetchData();
	}

	// 검색 초기화
	function resetSearch() {
		const oneWeekAgo = new Date();
		oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
		startDate = oneWeekAgo.toISOString().split('T')[0];
		endDate = today;
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

	// 정산 상세 페이지로 이동
	function navigateToDetail(settlementId: number) {
		goto(`/settlement/store/${settlementId}`);
	}

	// 정산 상태 텍스트
	function getStatusText(status: string): string {
		switch (status) {
			case 'pending': return '대기중';
			case 'processing': return '처리중';
			case 'completed': return '완료';
			default: return '알 수 없음';
		}
	}

	// 정산 상태 클래스
	function getStatusClass(status: string): string {
		switch (status) {
			case 'pending': return 'status-pending';
			case 'processing': return 'status-processing';
			case 'completed': return 'status-completed';
			default: return 'status-unknown';
		}
	}

	// 금액 포맷팅
	function formatAmount(amount: number): string {
		return amount.toLocaleString() + '원';
	}

	// 정산 제목 생성
	function generateSettlementTitle(settlement: SettlementData): string {
		const date = new Date(settlement.settlement_date);
		const year = date.getFullYear();
		const month = (date.getMonth() + 1).toString().padStart(2, '0');
		const day = date.getDate().toString().padStart(2, '0');
		
		return `${year}년 ${month}월 ${day}일 매출 정산내역`;
	}

	// Excel 다운로드
	async function downloadExcel() {
		try {
			const params = new URLSearchParams({
				start_date: startDate,
				end_date: endDate,
				classify: $authStore.classify || '',
				user_id: $authStore.userId || '',
				export: 'excel'
			});

			const response = await fetch(`/api/settlement/store_excel?${params}`);
			
			if (response.ok) {
				const blob = await response.blob();
				const url = window.URL.createObjectURL(blob);
				const a = document.createElement('a');
				a.href = url;
				a.download = `가맹점정산목록_${startDate}_${endDate}.xlsx`;
				document.body.appendChild(a);
				a.click();
				window.URL.revokeObjectURL(url);
				document.body.removeChild(a);
				showToast('Excel 파일이 다운로드되었습니다.', 'success');
			} else {
				showToast('Excel 다운로드에 실패했습니다.', 'error');
			}
		} catch (error) {
			console.error('Excel 다운로드 오류:', error);
			showToast('Excel 다운로드 중 오류가 발생했습니다.', 'error');
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
			<div id="content" class="container">
				<!-- 검색 섹션 -->
				<section class="borderbox form_view">
					<div class="title_wrap">
						<h5 class="page_title">정산관리 - 가맹점 정산관리</h5>
					</div>

					<form on:submit|preventDefault={handleSearch}>
						<div class="form_search">
							<div class="row mt-3">
								<input type="hidden" name="page" />
								<div class="col-12">
									<div class="search_box left_search">
										<ul class="calendar_wrap_list btn_wrap_list">
											<li class="li_can">
												<input 
													type="date" 
													class="input" 
													title="일자선택" 
													bind:value={startDate}
													max={endDate || today}
													required
												>
											</li>
											<li class="ih-lin">~</li>
											<li class="li_can">
												<input 
													type="date" 
													class="input" 
													title="일자선택" 
													bind:value={endDate}
													min={startDate}
													max={today}
													required
												>
											</li>
										</ul>
										<div class="btn_list_b">
											<button 
												type="submit" 
												class="bt blue_bgbor"
												disabled={loading}
											>
												{loading ? '검색 중...' : '검색'}
											</button>
										</div>
									</div>
								</div>
							</div>
						</div>

						<div class="right_btn">
							<ul>
								<li>
									<button 
										type="button" 
										class="abt reset_bt" 
										on:click={resetSearch}
									>
										초기화
									</button>
								</li>
								<li>
									<button 
										type="button" 
										class="abt excel_bt"
										on:click={downloadExcel}
									>
										Excel
									</button>
								</li>
								<li>
									<select 
										class="select select_listnum" 
										bind:value={pageSize} 
										on:change={changePageSize}
									>
										<option value="10">10건</option>
										<option value="25">25건</option>
										<option value="50">50건</option>
										<option value="100">100건</option>
									</select>
								</li>
							</ul>
						</div>
					</form>
				</section>

				<!-- 테이블 섹션 -->
				<section class="borderbox_table">
					<div id="table_wrap" class="table_wrap">
						<table class="table_list settlement_table" width="100%">
							<caption>가맹점 정산관리 테이블</caption>

							<colgroup>
								<col style="width: 8%;">  <!-- No -->
								<col style="width: 40%;"> <!-- 정산 내역 -->
								<col style="width: 12%;"> <!-- 거래건수 -->
								<col style="width: 15%;"> <!-- 총 매출액 -->
								<col style="width: 15%;"> <!-- 정산금액 -->
								<col style="width: 10%;"> <!-- 날짜 -->
							</colgroup>

							<thead>
								<tr>
									<th scope="col">No</th>
									<th scope="col">정산 내역</th>
									<th scope="col">거래건수</th>
									<th scope="col">총 매출액</th>
									<th scope="col">정산금액</th>
									<th scope="col">날짜</th>
								</tr>
							</thead>

							<tbody>
								{#if loading}
									<tr>
										<td colspan="6" class="loading">데이터를 불러오는 중...</td>
									</tr>
								{:else if settlementList.length === 0}
									<tr>
										<td colspan="6" class="no-data">검색 결과가 없습니다.</td>
									</tr>
								{:else}
									{#each settlementList as settlement, index}
										<tr>
											<td>{totalCount - ((currentPage - 1) * pageSize) - index}</td>
											<td class="settle_title">
												<button 
													class="settlement-link"
													on:click={() => navigateToDetail(settlement.id)}
												>
													{generateSettlementTitle(settlement)}
												</button>
												<span class="status-badge {getStatusClass(settlement.status)}">
													{getStatusText(settlement.status)}
												</span>
											</td>
											<td class="text-center">{settlement.transaction_count}건</td>
											<td class="text-right">{formatAmount(settlement.total_amount)}</td>
											<td class="text-right settlement-amount">
												{formatAmount(settlement.settlement_amount)}
											</td>
											<td class="text-center">{settlement.created_date}</td>
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
								<!-- 첫 페이지 -->
								{#if currentPage > 1}
									<button class="arrow_bt" on:click={() => changePage(1)}>
										<img class="arrow_icon chevron-double-left" src="/img/icon/chevron-double-left.svg" alt="첫 페이지">
									</button>
								{/if}

								<!-- 이전 10페이지 -->
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

								<!-- 다음 10페이지 -->
								{#if endPage < totalPages}
									<button class="arrow_bt" on:click={() => changePage(endPage + 1)}>
										<img class="arrow_icon chevron-right" src="/img/icon/chevron-right.svg" alt="다음 10페이지">
									</button>
								{/if}

								<!-- 마지막 페이지 -->
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

	/* 정산 링크 */
	.settlement-link {
		background: none;
		border: none;
		color: #e74c3c;
		text-decoration: underline;
		cursor: pointer;
		font-size: 0.95rem;
		padding: 0;
		text-align: left;
		width: 100%;
	}

	.settlement-link:hover {
		color: #c0392b;
	}

	/* 상태 배지 */
	.status-badge {
		display: inline-block;
		padding: 0.25rem 0.5rem;
		border-radius: 12px;
		font-size: 0.75rem;
		font-weight: 500;
		margin-left: 0.5rem;
	}

	.status-pending {
		background-color: #fff3cd;
		color: #856404;
	}

	.status-processing {
		background-color: #d1ecf1;
		color: #0c5460;
	}

	.status-completed {
		background-color: #d4edda;
		color: #155724;
	}

	.status-unknown {
		background-color: #f8d7da;
		color: #721c24;
	}

	/* 테이블 스타일 */
	.settle_title {
		text-align: left;
	}

	.text-center {
		text-align: center;
	}

	.text-right {
		text-align: right;
	}

	.settlement-amount {
		font-weight: 600;
		color: #e74c3c;
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

		.right_btn ul {
			flex-wrap: wrap;
			gap: 0.5rem;
		}

		.settle_title {
			min-width: 200px;
		}

		.status-badge {
			display: block;
			margin-left: 0;
			margin-top: 0.25rem;
			width: fit-content;
		}
	}
</style>