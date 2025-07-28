<script lang="ts">
    import { onMount } from "svelte";
    import { goto } from '$app/navigation';
    import { authStore } from '$lib/stores/auth';
    import {adminPartnerAccess} from "$lib/utils/accessControl";
    import LeftMenu from "$lib/components/LeftMenu.svelte";
    import {showToast} from "$lib/stores/toast.js";
    import { partnerData, fetchPartners } from '$lib/stores/partner';
    import Toast from "$lib/components/Toast.svelte";
    import TabMenu from "$lib/components/log/tab_menu.svelte";
    
    type logItem = {
        settle_date: string;
        store_catid: string;
        store_name: string;
        pre_value: string;
        to_value: string;
        editor_name: string;
        editor_ip: string;
        editor_browser: string;
        url: string;
        edit_date: string;

    }

    let logLists: logItem[] = [];
    
    //페이지네이션
	let currentPage = 1;
	let totalPages = 1;
	let totalCount = 0;
	let pageSize = 10;     

    // 페이지네이션 범위 계산
	$: startPage = Math.floor((currentPage - 1) / 10) * 10 + 1;
	$: endPage = Math.min(startPage + 9, totalPages);
	$: pageNumbers = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);

	// 검색 상태
	let searchSelect = 'store_name';
	let searchText = '';
	let startDate = '';
	let endDate = '';

    
    //데이터 상태
    let loading = false;
    // 오늘 날짜 (yyyy-mm-dd 포맷)
    const today = new Date().toISOString().split('T')[0];

    // 페이지 변경 - 페이지네이션
	function changePage(page: number) {
		if (page < 1 || page > totalPages) return;
		currentPage = page;
		fetchData();
	}

    // 검색 초기화
	function resetSearch() {
		searchText = '';
		searchSelect = 'store_name';
		startDate = '';
		endDate = '';
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
    
    async function fetchData() {
        if(loading) return;

        loading = true;
        
        try {  
            const params = new URLSearchParams({
            page: currentPage.toString(),  
            page_size: pageSize.toString(), // 페이지 크기
            search_select : searchSelect,
            search_text : searchText,
            start_date : startDate,
            end_date : endDate
            });
            const response = await fetch(`/api/log/StoreSettlementLog?` + params.toString());
            const json = await response.json();

            if (json.success) {
                logLists = json.data;

                // totalCount가 숫자인지 확인하고, 그렇지 않으면 기본값 0 설정
                totalCount = json.pagination.totalCount;    
                totalPages = Math.ceil(totalCount / pageSize);  // 총 페이지 수 계산
                console.log('총 페이지 수:', totalPages);
            } else {
                console.error('서버 오류:', json.message);
                showToast('데이터 조회에 실패했습니다.', 'error');
                logLists = [];
            }

            console.log('받은 데이터:', json);

        } catch(error){
            console.error('API 호출 중 오류 발생:', error);
            showToast('네트워크 오류가 발생했습니다.', 'error');
            logLists = [];
        }finally{
            loading = false;
        }

    }
       onMount(async () => {
            fetchData()
        });
</script>


<LeftMenu/>


<div id="page_contect" class=""> 
    <div id="content" class="container">
        <!-- 보더박스 시작-->
        <section class="borderbox form_view">
            <div class="title_wrap">
                <h5 class="page_title">로그 - 가맹점 정산처리</h5>
            </div>
            <TabMenu/>
            <form  id="searchForm">
                <div class="form_search">
                    <div class="row mt-3">
    
                        <div class="col-md-12 col-lg-6 ">
                            <div class="search_box">
                                <ul class="calendar_wrap_list btn_wrap_list">
                                    <li class="li_can"><input type="date" class="input" title="일자선택" bind:value={startDate} id="start_date" name="start_date" max={endDate}></li>
                                    <li class="ih-lin">~</li>
                                    <li class="li_can"><input type="date"  class="input" title="일자선택" bind:value={endDate} id="end_date" name="end_date" min={startDate} max={today}></li>                   
                                </ul>    
                            </div>
                        </div>
                    
                        <div class="col-md-12 col-lg-6">                    
                            <div class="row">
                                <div class="col-2">
                                    <div class="search_box">
                                        <select name="search_select" class="select mt_8px mr_10" bind:value={searchSelect}>
                                            <option value="store_name">가맹점명</option>
                                            <option value="store_catid">TID</option>
                                            <option value="editor_ip">IP</option>
                                        </select>
                                    </div>
                                </div>
    
                                <div class="col-10">
                                    <div class="search_box">
                                        <div class="search_ba wh70">
                                            <input type="search" class="input mt_8px" name="search_text"bind:value={searchText} placeholder="검색어를 직접 입력해주세요." >
                                            <button type="button" class="bt blue_bgbor mt_8px" on:click={handleSearch} id="search_btn">검색</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>            
                </div>
    
                <div class="right_btn">
                    <ul>             
                        <li><button type="button" class="abt reset_bt" on:click={resetSearch} >초기화</button></li> 
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
            <div id="table_wrap" class="table_wrap">			
                <table class="table_list" width="100%">
                    <caption>관리자 로그인 로그 테이블</caption>
    
                    <colgroup>                     
                        <col style="width: 3.67% !important;"> <!-- 인덱스 -->
                        <col style="width: 6.67% !important;"> <!-- 정산날짜 -->
                        <col style="width: 8.67% !important;"> <!-- TID -->
                        <col style="width: 10% !important;"> <!-- 가맹점명 -->
                        <col style="width: 6.67% !important;"> <!-- 수정 전 -->
                        <col style="width: 6.67% !important;"> <!-- 수정 후 -->
                        <col style="width: 6.67% !important;"> <!-- 수정 관리자명 -->
                        <col style="width: 6.67% !important;"> <!-- 수정 아이피 -->
                        <col style="width: 6.67% !important;"> <!-- 수정 브라우저 -->   
                        <col style="width: 10% !important;"> <!-- 접근 url -->    
                        <col style="width: 14% !important;"> <!--수정날짜-->
                    </colgroup>
    
                    <thead>
                        <tr>
                            <th rowspan="1" scope="col" >No</th>
                            <th rowspan="1" scope="col" >정산날짜</th>
                            <th rowspan="1" scope="col" >TID</th>
                            <th rowspan="1" scope="col" >가맹점명</th>
                            <th rowspan="1" scope="col" >처리 전</th>
                            <th rowspan="1" scope="col" >처리 후</th>
                            <th rowspan="1" scope="col" >담당 관리자명</th>
                            <th rowspan="1" scope="col" >IP</th>
                            <th rowspan="1" scope="col" >브라우저</th>
                            <th rowspan="1" scope="col" >URL</th>
                            <th rowspan="1" scope="col" >처리날짜</th>
                        </tr> 
                    </thead>
                    <tbody>
                        {#if loading}
                        <tr>
                            <td colspan="11" class="loading">데이터를 불러오는 중...</td>
                        </tr>
                        {:else if logLists.length === 0}
                        <tr>
                            <td colspan="11" class="no_data">등록된 데이터가 없습니다.</td>
                        </tr>
                        {:else}
                            {#each logLists as dist, index}
    
                        <tr>
                            <td> {totalCount - ((currentPage - 1) * pageSize) - index} </td>                               <!--인덱스-->
                            <td> {dist.settle_date} </td>                                       <!--정산날짜-->
                            <td> {dist.store_catid} </td>                                   <!--ITD-->
                            <td> {dist.store_name}</td>                                                        <!--가맹점명-->
                            <td> 
                                {#if dist.pre_value === "0"}                                                       <!--처리전 상태-->
                                    <p class="upper_1">예정</p>
                                {:else if dist.pre_value === "1"}
                                    <p class="upper_4">완료</p>
                                {:else if dist.pre_value === "2"}
                                    <p class="upper_2">보류</p>
                                {:else if dist.pre_value === "3"}
                                    <p class="upper_3">미상</p>
                                {/if}
                            </td>
                            <td>                                                            <!--처리후 상태-->
                                {#if dist.to_value === "0"} 
                                    <p>예정</p>
                                {:else if dist.to_value === "1"}
                                    <p class="upper_4">완료</p>
                                {:else if dist.to_value === "2"}
                                    <p class="upper_2">보류</p>
                                {:else if dist.to_value === "3"}
                                    <p class="upper_3">미상</p>
                                {/if}
                            </td>
                            <td> {dist.editor_name} </td>                                 <!--담당 관리자명-->
                            <td> {dist.editor_ip} </td>                                         <!--IP-->                                                           
                            <td> {dist.editor_browser} </td>                                  <!--브라우저-->
                            <td> {dist.url} </td>                                  <!--URL-->
                            <td> {dist.edit_date} </td>                                  <!--처리날짜-->
                        </tr>
                        {/each}
                    {/if}
    
                    </tbody>
                </table>
            </div>
    
        </section>
        <!-- 보더박스_테이블 끝 -->
        <div class="list_box">
            <!-- <button class="defer_btn" type="button" on:click|preventDefault={() => navigateTo('Admin_setting_edit')}>목록으로</button> -->
        </div>
    
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