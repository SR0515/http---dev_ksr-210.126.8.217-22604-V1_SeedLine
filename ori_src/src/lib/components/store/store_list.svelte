
<script lang="ts">
    import { onMount } from "svelte";
    import { goto } from '$app/navigation';
    import { authStore } from '$lib/stores/auth';
    import {adminPartnerAccess} from "$lib/utils/accessControl";
    import LeftMenu from "$lib/components/LeftMenu.svelte";
    import {showToast} from "$lib/stores/toast.js";
    import { partnerData, fetchPartners } from '$lib/stores/partner';
    import Toast from "$lib/components/Toast.svelte";


    type StoreItem = {
        id: string;
        join_date: string;
        login_state: string;
        mid: string;
        store_ceo_name: string;
        store_name: string;
        store_contact: string | null;
        upper_path: string;
        store_wallet: {
            account_name: string;
            account_num: string;
            bank_name: string;
            terminal_commission: string;
        };
        store_commission_table: {
            store_catid: string;
            code : string;
        };

    };
    let storeLists: StoreItem[] = [];
    
    //페이지네이션
	let currentPage = 1;
	let totalPages = 1;
	let totalCount = 0;
	let pageSize = 10;         

	// 검색 상태
	let searchSelect = '';
	let searchText = '';
	let startDate = '';
	let endDate = '';


    //데이터 상태
    let loading = false;
    // 오늘 날짜 (yyyy-mm-dd 포맷)
    const today = new Date().toISOString().split('T')[0];


    function getRateLevel(rate:string) {
        return parseInt(rate.replace('p', '')); // 예: "p3" → 3
    }

    // rate에 따라 className을 정해주는 함수
    function getClassForPartner(rate:string) {
        if (rate === 'p1') return 'upper_1_point';
        if (rate === 'p2') return 'upper_2_point';
        if (rate === 'p3') return 'upper_3_point';
        if (rate === 'p4') return 'upper_4_point';
        if (rate === 'p5') return 'upper_5_point';
        if (rate === 'p6') return 'upper_6_point';
        if (rate === 'p7') return 'upper_7_point';
        if (rate === 'p8') return 'upper_8_point';
        if (rate === 'p9') return 'upper_9_point';
        if (rate === 'p10') return 'upper_10_point';
        if (rate === 'p11') return 'upper_11_point';
        if (rate === 'p12') return 'upper_12_point';
        return '';
    }

	// 가맹점 등록 페이지로 이동
	function navigateToWrite() {
		goto('/store/write');
	}

	// 파트너 상세 정보 페이지로 이동
	function navigateToDetail(code: string) {
		goto(`/store/${code}`);
	}

    // Excel 다운로드 - 가맹점으로 바꿔야함
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

			const response = await fetch(`/api/store_list_view/excel?${params}`);
			
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


    // 페이지 변경 - 페이지네이션
	function changePage(page: number) {
		if (page < 1 || page > totalPages) return;
		currentPage = page;
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

    
	// 페이지 크기 변경
	function changePageSize(event: Event) {
		const target = event.target as HTMLSelectElement;
		pageSize = parseInt(target.value);
		currentPage = 1;
		fetchData();
	}

    // API로 데이터 가져오기
    async function fetchData() {
        if(loading) return;

        loading = true;

        try {
            const user_id = localStorage.getItem('user_id');
            const user_code = localStorage.getItem('user_code');

            const params = new URLSearchParams({
                // currentpage: currentPage,
                classify: $authStore.classify,
                userCode: $authStore.userId, //code 값 확인필요
                rate: $authStore.rate,
                userId: user_id ?? '',
                page: currentPage.toString(),
				page_size: pageSize.toString(),
				search_select: searchSelect,
				search_text: searchText,
				start_date: startDate,
				end_date: endDate
            });
            const response = await fetch('/api/store_list_view?' + params.toString());
            const json = await response.json();

            if (json.success && Array.isArray(json.data)) {
                // json.data 가 배열이고 각 원소는 flatten 된 객체라 가정
                storeLists = json.data.map((item: any) => ({
                    id: item.id,
                    join_date: item.join_date,
                    login_state: item.login_state,
                    mid: item.mid,
                    store_ceo_name: item.store_ceo_name,
                    store_name: item.store_name,
                    store_contact: item.store_contact,
                    upper_path: item.upper_path,
                    store_wallet: {
                        account_name: item['store_wallet.account_name'] ?? '',
                        account_num: item['store_wallet.account_num'] ?? '',
                        bank_name: item['store_wallet.bank_name'] ?? '',
                        terminal_commission: item['store_wallet.terminal_commission'] ?? ''
                    },
                    store_commission_table: {
                        store_catid: item['store_commission_table.store_catid'] ?? '',
                        code: item['store_commission_table.code'] ?? ''
                    }
                }));

                totalCount = json.pagination?.totalCount ?? 0;
                totalPages = Math.ceil(totalCount / pageSize);

                console.log('총 페이지 수:', totalPages);
            } else {
                console.error('서버 오류:', json.message);
                showToast('데이터 조회에 실패했습니다.', 'error');
                storeLists = [];
            }
            console.log('받은 데이터:', json);
        } catch (error) {
            console.error('API 호출 중 오류 발생:', error);
            showToast('네트워크 오류가 발생했습니다.', 'error');
            storeLists = [];
        }finally{
            loading = false;
        }
    }

    // function formatUpperPath(path) {
    //     const rate = localStorage.getItem("user_rate");
    //     const partsArray = path.split('>');

    //     const parts = partsArray.map((part, idx) => {
    //         const isLast = idx === partsArray.length - 1;
    //         const spanClass = isLast ? 'upper_4' : `upper_${idx + 1}`;

    //         if (rate === 'p0') {
    //             return `<span class="${spanClass}">${part.trim()}</span>`;
    //         } else if (rate === 'p1' && idx >= 1) {
    //             return `<span class="${spanClass}">${part.trim()}</span>`;
    //         } else if (rate === 'p2' && idx >= 2) {
    //             return `<span class="${spanClass}">${part.trim()}</span>`;
    //         } else {
    //             return '';
    //         }
    //     }).filter(Boolean).join(' > ');

    //     return parts;
    // }

    // 페이지네이션 범위 계산
	$: startPage = Math.floor((currentPage - 1) / 10) * 10 + 1;
	$: endPage = Math.min(startPage + 9, totalPages);
	$: pageNumbers = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);

    onMount(async () => {
        adminPartnerAccess();
        fetchData();
        fetchPartners(); 
    });
    
</script>

<LeftMenu/>
<!-- -- 컨텐트 시작  -->
<div id="page_contect" class="">
    <div id="content" class="container">
        <!-- 보더박스 시작-->
        <section class="borderbox form_view">

            <div class="title_wrap">
                <h5 class="page_title">가맹점관리</h5>
            </div>

            <form id="searchForm" on:submit|preventDefault={handleSearch}>

                <div class="form_search">

                    <div class="row mt-3">
                        <div class="col-md-12 col-lg-6 ">
                        
                            <div class="search_box">
                                <ul class="calendar_wrap_list btn_wrap_list">
                                    <li class="li_can"><input type="date" class="input" title="일자선택" id="start_date" name="start_date" bind:value={startDate} max={endDate}></li>
                                    <li class="ih-lin">~</li>
                                    <li class="li_can"><input type="date"  class="input" title="일자선택" id="end_date" name="end_date" bind:value={endDate} min={startDate} max={today}></li>
                                </ul>    
                            </div>
                        </div>
                                    
                        <div class="col-md-12 col-lg-6">   
                            <div class="row">
                                <div class="col-12">
                                    <div class="search_box">
                                        <select id="search_select" name="search_select" bind:value={searchSelect} class="select" >
                                            <option value="">전체</option>
                                            <option value="id">연락처</option>
                                            <option value="store_name">상호명</option>
                                            <option value="store_ceo_name">대표명</option>
                                        </select>
                            
                                        <div class="search_ba wh70">
                                            <input type="search" class="input" id="search_text" name="search_text" bind:value={searchText} placeholder="검색어를 직접 입력해주세요." >
                                            <button type="submit" class="bt blue_bgbor mt_8px" id="search_btn" disabled={loading}>{loading ? '검색 중...' : '검색'}</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="right_btn">
                    <ul>   
                        <!-- {#if classify === "0" || rate === "p1"}        -->
                            <li><button type="button" class="abt  signup_bt" on:click={navigateToWrite}>등록하기</button></li>
                        <!-- {/if} -->
                        <li><button type="button" class="abt reset_bt " on:click={resetSearch}>초기화</button></li> 
                        <li><button type="button" class="abt excel_bt" on:click={downloadExcel} >Excel</button></li> 
                        <li> 
                            <select name="page_size" class="select select_listnum" bind:value={pageSize}  on:change={fetchData}>
                                <option value="{10}">10건</option>
                                <option value="{25}">25건</option>
                                <option value="{50}">50건</option>
                                <option value="{100}">100건</option>
                            </select>
                        </li>           
                    </ul>
                </div>
            </form>
        </section>
        <!-- 보더박스 끝-->

        <!-- 보더박스_테이블 시작 -->
        <section class="borderbox_table">
            <!-- <div>
                {#each partners as partner}
                    {#if getRateLevel(partner.rate) <= getRateLevel(partner.rate)}
                        <span class={getClassForPartner(partner.rate)}>● {partner.partner_name}</span>
                    {/if}
                {/each}
            </div> -->
            
            <div id="table_wrap" class="table_wrap">			
                <table class="table_list" width="100%">
                    <caption>가맹점관리 테이블</caption>

                    <colgroup>           
                        <col style="width: 4% !important;"> <!-- 인덱스 -->          
                        <col style="width: 23% !important;"> <!-- 업체경로 -->
                        <col style="width: 8% !important;"> <!-- 상호명 -->
                        <col style="width: 6% !important;"> <!-- 대표명 -->
                        <col style="width: 4% !important;"> <!-- 수수료율 -->
                        <col style="width: 5% !important;"> <!-- 계약상태 -->
                        <col style="width: 5% !important;"> <!-- 아이디 -->
                        <col style="width: 8% !important;"> <!-- 등록일자 --> 
                        <col style="width: 5% !important;"> <!-- 은행명-->  
                        <col style="width: 5% !important;"> <!-- 계좌번호-->  
                        <col style="width: 5% !important;"> <!-- 예금주-->   
                        <col style="width: 4% !important;"> <!-- 정보수정 -->           
                    </colgroup>

                    <thead>
                        <tr>  
                            <th rowspan="2" scope="col">No</th>
                            <th rowspan="2" scope="col">업체경로 </th>
                            <th rowspan="2" scope="col">업체명</th>
                            <th rowspan="2" scope="col">대표명</th>
                            <th rowspan="2" scope="col">정산 수수료율</th>
                            <th rowspan="2" scope="col">계약상태</th>
                            <th rowspan="2" scope="col">연락처</th>
                            <th rowspan="2" scope="col">등록일자</th>
                            <th colspan="3"  scope="col">계좌정보</th>
                            <th rowspan="2" scope="col">정보</th>
                        </tr> 
                        <tr>
                            <th colspan="1"> 은행명 </th>
                            <th colspan="1"> 계좌번호 </th>
                            <th colspan="1"> 예금주 </th>
                        </tr>

                    </thead>

                    <tbody>
                        {#if loading}
                        <tr>
                            <td colspan="12" class="loading">데이터를 불러오는 중...</td>
                        </tr>
                        {:else if storeLists.length === 0}
                            <tr>
                                <td colspan="12" class="no_data">등록된 데이터가 없습니다.</td>
                            </tr>

                        {:else}
                            {#each storeLists as dist, index}
                            <tr>
                                <td> {totalCount - ((currentPage - 1) * pageSize) - index} </td>
                                <td  style="text-align: left; padding-left: 20px; " class="upper_path_td wd_path">{dist.upper_path}</td> <!--업체경로-->
                                <td> {dist.store_name}</td>                                              <!--업체명-->
                                <td> {dist.store_ceo_name} </td>                                          <!--대표명-->
                                <td> {dist.store_wallet.terminal_commission ?? '-'} %</td> 
                                <td>     
                                    {#if dist.login_state === '0'}
                                        <p style="color: #000000;"> 정상 </p>
                                    {:else if dist.login_state === '1'}
                                        <p style="color: #be0000;" > 정지 </p>
                                    {:else if dist.login_state === '2'}
                                        <p style="color: #646464;" > 탈퇴 </p>
                                    {:else}
                                        <p style="color: #be0000;" > 에러 </p>
                                    {/if}                                        
                                </td>                                                   

                                <td> {dist.id} </td>                                                      <!--아이디-->
                                <td class="wd_date"> {dist.join_date} </td>                                               <!--등록일자-->
                                <td class="wd_bank"> {dist.store_wallet.bank_name ?? '-'}  </td>                                               <!--계좌정보 은행명-->
                                <td> {dist.store_wallet.account_num}</td>                                             <!--계좌정보 계좌번호 -->
                                <td> {dist.store_wallet.account_name} </td>                                            <!--계좌정보 예금주-->
                                <td> 
                                    <button class="detail-link" on:click={() => navigateToDetail(dist.store_commission_table.code)}> 수정 </button>
                                </td>    
                            </tr>
                        {/each}

                        {/if}
                    </tbody>
                </table>
            </div>

        </section>
        <!-- 보더박스_테이블 끝 -->

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
<!-- 컨텐트 끝-->
