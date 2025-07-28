<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { authStore } from '$lib/stores/auth';
	import { checkAuth } from '$lib/utils/accessControl';
	import { showToast } from '$lib/stores/toast';
	import LeftMenu from '$lib/components/LeftMenu.svelte';
	import Toast from '$lib/components/Toast.svelte';

	// 파트너 데이터 인터페이스
	interface PartnerData {
		id: string;
		code: string;
		name: string;
		ceo_name: string;
		contact: string;
		login_state: '0' | '1' | '2'; // 0: 정상, 1: 정지, 2: 탈퇴
		rate: string;
		upper_name: string; // 업체경로
		join_date: string;
		edit_date?: string;
	}

	interface PartnerHierarchy {
		partner_name: string;
		rate: string;
	}

	let partners = [];
	
	let pramsId: string | null = null; 
	let pramsName: string | null = null;
	let pramsRate: string | null = null;

	// 페이지네이션 상태
	let currentPage = 1;
	let totalPages = 1;
	let totalCount = 0;
	let pageSize = 10;

	// 검색 상태
	let searchSelect = '';
	let searchText = '';
	let startDate = '';
	let endDate = '';

	// 데이터 상태
	let partnerList: PartnerData[] = [];
	let partnerHierarchy: PartnerHierarchy[] = [];
	let partnerUpperRate = '';
	let loading = false;

	// 오늘 날짜
	const today = new Date().toISOString().split('T')[0];

	onMount(async () => {
		// 권한 체크 - 관리자와 파트너만 접근 가능
		if ($authStore.classify !== '0' && $authStore.classify !== '1') {
			showToast('관리자 또는 파트너만 접근할 수 있습니다.', 'error');
			goto('/dashboard');
			return;
		}

		const hasAccess = await checkAuth('PartnerList');
		if (!hasAccess) {
			showToast('접근 권한이 없습니다.', 'error');
			goto('/dashboard');
			return;
		}

		let params = new URLSearchParams(window.location.search);
			pramsId = params.get('id');
			pramsName = params.get('name');
			pramsRate = params.get('rate');

		await fetchData();
	});



	$: if (pramsRate) {
        fetchData();
    }

	// 데이터 조회
	async function fetchData() {
		if (loading) return;
		
		loading = true;

		console.log("check1",$authStore.classify)
		console.log("check2",$authStore.userId)
		try {
			const params = new URLSearchParams({
				classify: $authStore.classify || '',
				user_code: $authStore.userCode || '',
				rate: pramsRate || '',
				page: currentPage.toString(),
				page_size: pageSize.toString(),
				search_select: searchSelect,
				search_text: searchText,
				start_date: startDate,
				end_date: endDate
			});
			console.log("요청 URL:", `/api/partner_list_view/partnerListAPI?${params.toString()}`);
			const response = await fetch(`/api/partner_list_view/partnerListAPI?${params.toString()}`);
			const result = await response.json();

			if (result.success) {
				partnerUpperRate = result.upper_rate || '';
				partnerList = Array.isArray(result.data) ? result.data : [];
				totalCount = result.pagination?.totalCount || 0;
				totalPages = Math.ceil(totalCount / pageSize);
				
				// 파트너 계층 정보도 업데이트
				if (result.hierarchy) {
					partnerHierarchy = result.hierarchy;
				}
				console.log("load성공+ ",partnerList)
				console.log("result ",result)
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

	// 검색 초기화
	function resetSearch() {
		searchText = '';
		searchSelect = '';
		startDate = '';
		endDate = '';
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

	// 파트너 등급에 따른 CSS 클래스
	function getClassForPartner(rate: string): string {
		const rateMap: Record<string, string> = {
			'p1': 'upper_1_point',
			'p2': 'upper_2_point',
			'p3': 'upper_3_point',
			'p4': 'upper_4_point',
			'p5': 'upper_5_point',
			'p6': 'upper_6_point',
			'p7': 'upper_7_point',
			'p8': 'upper_8_point',
			'p9': 'upper_9_point',
			'p10': 'upper_10_point',
			'p11': 'upper_11_point',
			'p12': 'upper_12_point'
		};
		return rateMap[rate] || '';
	}

	// 파트너 등급 레벨 가져오기
	function getRateLevel(rate: string): number {
		return parseInt(rate.replace('p', ''));
	}

	// 업체 경로 포맷팅
	function formatUpperPath(path: string): string {
		if (typeof path !== 'string') return '';

		const parts = path.split('>').map((part, idx) => {
			const spanId = `upper_${idx + 1}`;
			return `<span class="${spanId}">${part.trim()}</span>`;
		});
		return parts.join(' > ');
	}

	// 계약 상태 텍스트 및 색상
	function getContractStatus(state: string): { text: string; color: string } {
		switch (state) {
			case '0': return { text: '정상', color: '#000000' };
			case '1': return { text: '정지', color: '#be0000' };
			case '2': return { text: '탈퇴', color: '#646464' };
			default: return { text: '에러', color: '#be0000' };
		}
	}

	// 파트너 등록 페이지로 이동
	function navigateToWrite() {
		goto('/partner/write');
	}

	// 파트너 상세 정보 페이지로 이동
	function navigateToDetail(code: string) {
		goto(`/partner/${code}`);
	}

	// Excel 다운로드
	async function downloadExcel() {
		try {
			const params = new URLSearchParams({
				classify: $authStore.classify || '',
				user_code: $authStore.userId || '',
				rate: $authStore.rate || '',
				search_select: searchSelect,
				search_text: searchText,
				start_date: startDate,
				end_date: endDate,
				export: 'excel'
			});

			const response = await fetch(`/api/partner_list_view/excel?${params}`);
			
			if (response.ok) {
				const blob = await response.blob();
				const url = window.URL.createObjectURL(blob);
				const a = document.createElement('a');
				a.href = url;
				a.download = `파트너목록_${new Date().toISOString().split('T')[0]}.xlsx`;
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
						 <h5 class="page_title">파트너 관리</h5>
					</div>

					<form on:submit|preventDefault={handleSearch}>
						<div class="form_search">
							<div class="row mt-3">
								<input type="hidden" name="page" />

								<!-- 날짜 검색 -->
								<div class="col-md-12 col-lg-6">
									<div class="search_box">
										<ul class="calendar_wrap_list btn_wrap_list">
											<li class="li_can">
												<input 
													type="date" 
													class="input" 
													title="일자선택" 
													bind:value={startDate}
													max={endDate || today}
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
												>
											</li>
										</ul>
									</div>
								</div>

								<!-- 검색 조건 -->
								<div class="col-md-12 col-lg-6">
									<div class="row">
										<div class="col-12">
											<div class="search_box">
												<select bind:value={searchSelect} class="select">
													<option value="">전체</option>
													<option value="id">아이디</option>
													<option value="name">업체명</option>
													<option value="contact">연락처</option>
												</select>

												<div class="search_ba wh70">
													<input 
														type="search" 
														class="input" 
														bind:value={searchText}
														placeholder="검색어를 직접 입력해주세요."
													>
													<button 
														type="submit" 
														class="bt blue_bgbor mt_8px"
														disabled={loading}
													>
														{loading ? '검색 중...' : '검색'}
													</button>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>

						<!-- 컨트롤 버튼 -->
						<div class="right_btn">
							<ul>
								<li>
									<button 
										type="button" 
										class="abt signup_bt" 
										on:click={navigateToWrite}
									>
										등록하기
									</button>
								</li>
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
					<!-- 파트너 계층 표시 -->
					<div class="partner-hierarchy">
						{#each partnerHierarchy as partner}
							{#if getRateLevel(partner.rate) <= getRateLevel($authStore.rate || '')}
								<span class={getClassForPartner(partner.rate)}>● {partner.partner_name}</span>
							{/if}
						{/each}
					</div>

					<div id="table_wrap" class="table_wrap">
						<table class="table_list" width="100%">
							<caption>파트너 관리 테이블</caption>

							<colgroup>
								<col style="width: 5%;">  <!-- No -->
								<col style="width: 23%;"> <!-- 업체경로 -->
								<col style="width: 10%;"> <!-- 업체명 -->
								<col style="width: 8%;">  <!-- 대표명 -->
								<col style="width: 10%;"> <!-- 연락처 -->
								<col style="width: 6%;">  <!-- 계약상태 -->
								<col style="width: 10%;"> <!-- 아이디 -->
								<col style="width: 10%;"> <!-- 등록일자 -->
								<col style="width: 10%;"> <!-- 수정일자 -->
								<col style="width: 8%;">  <!-- 정보 -->
							</colgroup>

							<thead>
								<tr>
									<th>No</th>
									<th>업체경로</th>
									<th>업체명</th>
									<th>대표명</th>
									<th>연락처</th>
									<th>계약상태</th>
									<th>아이디</th>
									<th>등록일자</th>
									<th>수정일자</th>
									<th>정보</th>
								</tr>
							</thead>

							<tbody>
								{#if loading}
									<tr>
										<td colspan="10" class="loading">데이터를 불러오는 중...</td>
									</tr>
								{:else if partnerList.length === 0}
									<tr>
										<td colspan="10" class="no_data">등록된 데이터가 없습니다.</td>
									</tr>
								{:else}
									{#each partnerList as partner, index}
										<tr>
											<td>{totalCount - ((currentPage - 1) * pageSize) - index}</td>
											<td class="text_left">{@html formatUpperPath(partner.upper_name)}</td>
											<td>{partner.name}</td>
											<td>{partner.ceo_name}</td>
											<td>{partner.contact}</td>
											<td>
												{#if partner.login_state !== undefined}
													{@const status = getContractStatus(partner.login_state)}
													<p style="color: {status.color};">{status.text}</p>
												{/if}
											</td>
											<td>{partner.id}</td>
											<td>{partner.join_date?.split('T')[0] || ''}</td>
											<td>{partner.edit_date?.split('T')[0] || ''}</td>
											<td>
												<button 
													class="detail-link"
													on:click={() => navigateToDetail(partner.code)}
												>
													상세정보
												</button>
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
								<!-- 첫 페이지 -->
								{#if currentPage > 1}
									<button class="arrow_bt" on:click={() => changePage(1)}>
										<img class="arrow_icon chevron-double-left" src="/img/icon/chevron-double-left.svg" alt="첫 페이지">
									</button>
								{/if}

								<!-- 이전 10페이지 -->
								{#if startPage > 1}
									<button class="arrow_bt" on:click={() => changePage(startPage - 10)}>
										<img class="arrow_icon chevron-left" src="/img/icon/chevron-left.svg" alt="10페이지 뒤로">
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
									<button class="arrow_bt" on:click={() => changePage(startPage + 10)}>
										<img class="arrow_icon chevron-right" src="/img/icon/chevron-right.svg" alt="10페이지 앞으로">
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

	/* 파트너 계층 표시 */
	.partner-hierarchy {
		margin-bottom: 1rem;
		padding: 0.5rem;
	}

	.partner-hierarchy span {
		margin-right: 1rem;
		font-weight: 500;
	}

	/* 상세정보 링크 */
	.detail-link {
		background: none;
		border: none;
		color: #e74c3c;
		text-decoration: underline;
		cursor: pointer;
		font-size: 0.9rem;
	}

	.detail-link:hover {
		color: #c0392b;
	}

	/* 테이블 스타일 */
	.text_left {
		text-align: left;
	}

	.loading, .no_data {
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

		.partner-hierarchy {
			overflow-x: auto;
			white-space: nowrap;
		}
	}
</style>