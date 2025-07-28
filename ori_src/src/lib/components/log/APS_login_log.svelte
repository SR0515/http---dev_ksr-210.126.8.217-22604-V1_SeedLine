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
        id:string;
        name:string;
        type:string;
        rate:string;
        date:string;
        ip:string;
        browser:string;
        url:string;
        login_status:string;
        fail_detail:string;
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
	let searchSelect = 'id';
	let searchText = '';
	let startDate = '';
	let endDate = '';
    let typeSelect = '';

    
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
		searchSelect = 'id';
        typeSelect = '';
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
            type_select : typeSelect,
            search_text : searchText,
            start_date : startDate,
            end_date : endDate
            });
            const response = await fetch(`/api/log/LoginLog?` + params.toString());
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
    <!-- 컨텐트 시작 -->
    <div id="content" class="container">
    <!-- 보더박스 시작-->
    <section class="borderbox form_view">
  
        <div class="title_wrap">
            <h5 class="page_title">로그 - 로그인</h5>
        </div>
       <TabMenu/>
        <form id="searchForm">
  
          <div class=" form_search">
  
              <div class="row mt-3">

  
                      <div class="col-12 col-md-12 col-lg-4">
  
                          <div class="search_box">
                              <ul class="calendar_wrap_list btn_wrap_list">
                                  <li class="li_can"><input type="date" class="input" title="일자선택" id="start_date" bind:value={startDate} name="start_date" max={endDate}></li>
                                  <li class="ih-lin">~</li>
                                  <li class="li_can"><input type="date"  class="input" title="일자선택" id="end_date" bind:value={endDate} name="end_date" min={startDate} max={today}></li>
                              </ul>    
                          </div>
                      </div>
                   
                <div class="col-12 col-md-12 col-lg-8">
                    
                  <div class="row">
  
                      <div class="col-6 col-md-4 col-lg-2">
                          <!-- <label for="">검색조건</label> -->
                          <div class="search_box">
                            <select name="search_select" bind:value={searchSelect} class="select mt_8px mr_10">
                                <option value="id" selected>id</option>
                                <option value="name">사용자명</option>
                                <option value="ip">IP</option>
                            </select>
                          </div>
                      </div>
                      <div class="col-6 col-md-4 col-lg-2">
                          <!-- <label for="">로그인타입</label> -->
                          <div class="search_box">                     
                            <select name="type_select" class="select mt_8px mr_10" bind:value={typeSelect} id="type_select">
                                <option value="">전체</option>
                                <option value="0">관리자</option>
                                <option value="1">파트너</option>
                                <option value="2">가맹점</option>
                            </select>
                          </div>
                      </div>
  
                      <div class="col-12 col-md-4 col-lg-8">
                          <!-- <label for="" class="m_t2">검색입력</label> -->
                          <div class="search_box">
                            <div class="search_ba wh70">
                                <input type="search" class="input mt_8px" bind:value={searchText} name="search_text" placeholder="검색어를 직접 입력해주세요." >
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
                    <li><button type="button" class="abt reset_bt " on:click={resetSearch} >초기화</button></li> 
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
                    <col style="width: 6.67% !important;"> <!-- 인덱스 -->
                    <col style="width: 6.67% !important;"> <!-- 아이디 -->
                    <col style="width: 6.67% !important;"> <!-- 사용자명 -->
                    <col style="width: 4.67% !important;"> <!-- 타입 -->
                    <col style="width: 6.67% !important;"> <!-- 등급 -->
                    <col style="width: 8.67% !important;"> <!-- 시도 날짜 -->
                    <col style="width: 6.67% !important;"> <!-- 아이피 -->
                    <col style="width: 6.67% !important;"> <!-- 브라우저 -->
                    <col style="width: 12% !important;"> <!-- 접근 url -->    
                    <col style="width: 4.67% !important;"> <!-- 로그인 상태 -->   
                    <col style="width: 14% !important;"> <!--실패사유-->
                </colgroup>
  
                <thead>
                    <tr>
                        <th rowspan="1" scope="col" >No</th>
                        <th rowspan="1" scope="col" >아이디</th>
                        <th rowspan="1" scope="col" >사용자명</th>
                        <th rowspan="1" scope="col" >타입</th>
                        <th rowspan="1" scope="col" >등급</th>
                        <th rowspan="1" scope="col" >시도일자</th>
                        <th rowspan="1" scope="col" >IP</th>
                        <th rowspan="1" scope="col" >브라우저</th>
                        <th rowspan="1" scope="col" >URL</th>
                        <th rowspan="1" scope="col" >로그인 상태</th>
                        <th rowspan="1" scope="col" >실패 사유</th>
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
                        <td> {dist.id || ''} </td>                                       <!--관리자 아이디-->
                        <td> {dist.name || ''} </td>                                   <!--사용자명-->
                        <td> 
                            {#if dist.type === '0'}
                                <p>관리자</p>
                            {:else if dist.type === '1'}
                                <p>파트너</p>
                            {:else if dist.type === '2'}
                                <p>가맹점</p>
                            {/if}
                        </td>
                        <td>
                            {#if dist.rate === 'p1'}
                                    <p>대행사</p>
                            {:else if dist.rate === 'p2'}
                                    <p>에이전시</p>
                            {:else}
                                    <p></p>
                            {/if }
                        </td>
                        <td class="wd_date"> {dist.date}</td>                                 <!--시도일자-->
                        <td> {dist.ip} </td>                                         <!--IP-->                                                           
                        <td> {dist.browser}</td>                                  <!--브라우저-->
                        <td> {dist.url}</td>                                  <!--URL-->
                        <td>       
                            {#if dist.login_status === '0'}                                                       <!--로그인 상태-->
                                    <p style="color: #000000;"> 성공 </p>
                            {:else if dist.login_status === '1'}
                                    <p style="color: #be0000;" > 실패 </p>
                            {:else}
                                    <p style="color: #be0000;" > 에러 </p>
                            {/if}
                        </td> 
  
                        <td>{dist.fail_detail || ''} </td>                                  <!--실패사유-->
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
  <!-- 컨텐트 끝-->
</div>