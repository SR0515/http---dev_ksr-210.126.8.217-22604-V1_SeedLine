
<script lang="ts">
    import {adminPartnerAccess} from "$lib/utils/accessControl";
    import { onMount, createEventDispatcher } from "svelte";
    import LeftMenu from "$lib/components/LeftMenu.svelte";
    import Toast from "$lib/components/Toast.svelte";
    import {showToast} from "$lib/stores/toast.js";
    import { partnerData, fetchPartners } from '$lib/stores/partner';

    const dispatch = createEventDispatcher();

    let currentPage = 'StoreList';
    var pageNumber = 1;
    let classify = localStorage.getItem('classify');
    let rate = localStorage.getItem('user_rate');

    type StoreItem = {
        id: string;
        join_date: string;
        login_state: string;
        mid: string;
        store_ceo_name: string;
        store_name: string;
        store_contact: string | null;
        upper_path: string;
        store_commission_table?: {store_catid: string;};
        store_wallet?: {
            account_name: string;
            account_num: string;
            bank_name: string;
            terminal_commission: string;
        };
    };
    let storeLists: StoreItem[] = [];
    
    var totalPages = '';
    var totalCount = '';
    var page_size = 10;     
    let page = 1;           

    var search_select = '';
    var search_text = ''; // 검색어

    var start_date = '';
    var end_date = '';

    // 시작 페이지 번호 계산
    $: startPage = Math.floor((page - 1) / 10) * 10 + 1;
    $: endPage = Math.min(startPage + 9, Number(totalPages));

    // 오늘 날짜 (yyyy-mm-dd 포맷)
    const today = new Date().toISOString().split('T')[0];

    let partners: partnerData[] = [];
    $: partners = $partnerData;

    $: console.log('파트너경로 store_list:', $partnerData);

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

    // 페이지 이동 함수
    function navigateTo(page: string, mid: string) {
    // 중요: 현재 페이지 상태를 즉시 업데이트
    currentPage = page;
        console.log('메뉴 클릭으로 페이지 변경:', page);
        
        const detail = { page };
        if (mid) {
            detail.mid = mid;
            sessionStorage.setItem('mid', mid); // 세션에 저장
        }

        window.dispatchEvent(new CustomEvent('pageChange', { detail }));  
    }

    //페이지네이션
    function search_page(i){
        page = i;  // 페이지 번호 갱신
        fetchData(); // 데이터 갱신
        pageNumber = i;
    }

    // 검색 초기화
    function resetSearch() {
        search_text = '';
        search_select = '';
        page = 1;
        pageNumber = 1;
        start_date = '';
        end_date = '';
        fetchData();
    }

    function validateSearch() {
        // 날짜 중 하나만 입력된 경우 경고
        if ((start_date && !end_date) || (!start_date && end_date)) {
            showToast('시작일과 종료일을 모두 선택해주세요.', 'error');
            return;
        }
        page = 1;
        pageNumber = 1;
        // 유효성 통과 시 데이터 불러오기
        fetchData();
    }

    // API로 데이터 가져오기
    async function fetchData() {
        try {
            const user_id = localStorage.getItem('user_id');
            const user_code = localStorage.getItem('user_code');

            const params = new URLSearchParams({
                // currentpage: currentPage,
                classify: classify,
                rate: rate,
                userId: user_id ?? '',
                userCode: user_code ?? '',
                page: page,  // 현재 페이지를 API에 전달
                page_size: page_size, // 페이지 크기
                search_select : search_select,
                search_text : search_text,
                start_date : start_date,
                end_date : end_date
            });
            const response = await fetch('/api/store_list_view?' + params.toString());
            const json = await response.json();

            if (json.success) {
                storeLists = json.data;

                // totalCount가 숫자인지 확인하고, 그렇지 않으면 기본값 0 설정
                totalCount = json.pagination.totalCount;

            
                totalPages = Math.ceil(totalCount / page_size);  // 총 페이지 수 계산
                console.log('총 페이지 수:', totalPages);
            } else {
                console.error('서버 오류:', json.message);
            }

            console.log('받은 데이터:', json);
        } catch (err) {
            console.error('API 호출 중 오류 발생:', err);
        }
    }

    function formatUpperPath(path) {
        const rate = localStorage.getItem("user_rate");
        const partsArray = path.split('>');

        const parts = partsArray.map((part, idx) => {
            const isLast = idx === partsArray.length - 1;
            const spanClass = isLast ? 'upper_4' : `upper_${idx + 1}`;

            if (rate === 'p0') {
                return `<span class="${spanClass}">${part.trim()}</span>`;
            } else if (rate === 'p1' && idx >= 1) {
                return `<span class="${spanClass}">${part.trim()}</span>`;
            } else if (rate === 'p2' && idx >= 2) {
                return `<span class="${spanClass}">${part.trim()}</span>`;
            } else {
                return '';
            }
        }).filter(Boolean).join(' > ');

        return parts;
    }

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

            <form id="searchForm">

                <div class="form_search">

                    <div class="row mt-3">
                        <div class="col-md-12 col-lg-6 ">
                        
                            <div class="search_box">
                                <ul class="calendar_wrap_list btn_wrap_list">
                                    <li class="li_can"><input type="date" class="input" title="일자선택" id="start_date" name="start_date" bind:value={start_date} max={end_date}></li>
                                    <li class="ih-lin">~</li>
                                    <li class="li_can"><input type="date"  class="input" title="일자선택" id="end_date" name="end_date" bind:value={end_date} min={start_date} max={today}></li>
                                </ul>    
                            </div>
                        </div>
                                    
                        <div class="col-md-12 col-lg-6">   
                            <div class="row">
                                <div class="col-12">
                                    <div class="search_box">
                                        <select id="search_select" name="search_select" bind:value={search_select} class="select" >
                                            <option value="">전체</option>
                                            <option value="id">연락처</option>
                                            <option value="store_name">상호명</option>
                                            <option value="store_ceo_name">대표명</option>
                                        </select>
                            
                                        <div class="search_ba wh70">
                                            <input type="search" class="input" id="search_text" name="search_text" bind:value={search_text} placeholder="검색어를 직접 입력해주세요." >
                                            <button type="button" class="bt blue_bgbor mt_8px" id="search_btn" on:click={validateSearch}>검색</button>
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
                            <li><button type="button" class="abt  signup_bt" on:click|preventDefault={() => navigateTo('StoreWrite')} alt="등록하기" tltie="등록하기">등록하기</button></li>
                            <li><button type="button" class="abt  signup_bt" on:click|preventDefault={() => navigateTo('StoreWriteTest')} alt="등록하기" tltie="등록하기">등록하기 테스트</button></li>
                        <!-- {/if} -->
                        <li><button type="button" class="abt reset_bt " onclick="" alt="초기화" tltie="초기화" on:click={resetSearch}>초기화</button></li> 
                        <li><button type="button" class="abt excel_bt" onclick="download();" alt="다운로드" tltie="엑셀다운로드하기">Excel</button></li> 
                        <li> 
                            <select name="page_size" class="select select_listnum" bind:value={page_size}  on:change={fetchData}>
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
            <div>
                {#each partners as partner}
                    {#if getRateLevel(partner.rate) <= getRateLevel(partner.rate)}
                        <span class={getClassForPartner(partner.rate)}>● {partner.partner_name}</span>
                    {/if}
                {/each}
            </div>
            
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
                        {#if storeLists.length === 0}
                            <tr>
                                <td colspan="12" class="no_data">등록된 데이터가 없습니다.</td>
                            </tr>

                        {:else}
                            {#each storeLists as dist, index}
                            <tr>
                                <td> {totalCount - ((page - 1) * page_size) - index} </td>
                                <input type="hidden" class="upper_path" value="">
                                <!-- <td  style="text-align: left; padding-left: 20px; " class="upper_path_td wd_path">{@html formatUpperPath(dist.upper_path)}</td> 업체경로 -->
                                <td  style="text-align: left; padding-left: 20px; " class="upper_path_td wd_path">{dist.upper_path}</td> <!--업체경로-->
                                <td> {dist.store_name}</td>                                              <!--업체명-->
                                <td> {dist.store_ceo_name} </td>                                          <!--대표명-->
                                <td> {dist["store_wallet.terminal_commission"]} %</td> 
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
                                <td class="wd_bank"> {dist["store_wallet.bank_name"]}  </td>                                               <!--계좌정보 은행명-->
                                <td> {dist["store_wallet.account_num"]}</td>                                             <!--계좌정보 계좌번호 -->
                                <td> {dist["store_wallet.account_name"]} </td>                                            <!--계좌정보 예금주-->
                                <td> 
                                        <a href="{'javascript:void(0)'}" on:click|preventDefault={() => navigateTo('Store_edit',dist["store_commission_table.store_catid"])}>수정</a><br/>                  <!--정보수정-->
                                        <a href="{'javascript:void(0)'}" on:click|preventDefault={() => navigateTo('Store_edit_test',dist["store_commission_table.store_catid"])}>테스트 수정</a><br/>                  <!--정보수정-->
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
    <section class="borderbox_pageing">
    <div class="pageing">
        <div class="page_navgation">
            <!-- 첫 페이지 -->
            {#if page > 1}
                <a href="{'a'}" on:click|preventDefault={() => search_page(1)} class="on arrow_bt">
                    <img class="arrow_icon chevron-double-left" src="../img/icon/chevron-double-left.svg" alt="첫 페이지">
                </a>
            {/if}

            <!-- 이전 10페이지 -->
            {#if startPage > 1}
                <a href="{'a'}" on:click|preventDefault={() => search_page(startPage - 10)} class="on arrow_bt">
                    <img class="arrow_icon chevron-left" src="../img/icon/chevron-left.svg" alt="10페이지 뒤로">
                </a>
            {/if}

            <!-- 페이지 번호 -->
            {#each Array(endPage - startPage + 1).fill(0).map((_, i) => startPage + i) as p}
                {#if page === p}
                    <a href="{'a'}" class="on" on:click|preventDefault={() => search_page(p)}>{p}</a>
                {:else}
                    <a href="{'a'}" on:click|preventDefault={() => search_page(p)}>{p}</a>
                {/if}
            {/each}

            <!-- 다음 10페이지 -->
            {#if endPage < totalPages}
                <a href="{'a'}" on:click|preventDefault={() => search_page(startPage + 10)} class="on arrow_bt">
                    <img class="arrow_icon chevron-right" src="../img/icon/chevron-right.svg" alt="10페이지 앞으로">
                </a>
            {/if}

            <!-- 마지막 페이지 -->
            {#if page < totalPages}
                <a href="{'a'}" on:click|preventDefault={() => search_page(totalPages)} class="on arrow_bt">
                    <img class="arrow_icon chevron-double-right" src="../img/icon/chevron-double-right.svg" alt="마지막 페이지">
                </a>
            {/if}
        </div>
    </div>
</section>

    </div>
</div>
<!-- 컨텐트 끝-->
