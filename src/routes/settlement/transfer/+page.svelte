<script lang="ts">
    import { goto } from '$app/navigation';
    import type { PageData } from './$types';
    
    export let data: PageData;
    
    let currentPage = 'A_transfer_list';
    
    var pageNumber = 1;
    var totalPages = 3;
    var totalCount = 25;
    var page_size = 10;     
    let page = 1;           

    // 검색 변수들
    let searchSelect = '';
    let searchText = '';
    let startDate = '';
    let endDate = '';
    let pageSize = 10;

    // 페이지네이션
    function search_page(i) {
        page = i;
        pageNumber = i;
        console.log('페이지 변경:', i);
    }

    // 검색 함수
    function handleSearch() {
        console.log('검색 실행:', { searchSelect, searchText, startDate, endDate });
    }

    function handleReset() {
        searchSelect = '';
        searchText = '';
        startDate = '';
        endDate = '';
        pageSize = 10;
        console.log('초기화 실행');
    }

    function handlePageSizeChange() {
        console.log('페이지 크기 변경:', pageSize);
    }
</script>

<section class="borderbox form_view">
    <div class="title_wrap">
        <h5 class="page_title">정산 관리 - 가맹점 이체내역</h5>
    </div>

    <form id="searchForm">
        <div class="form_search">
            <div class="row mt-3">
                <input type="hidden" name="page" id="page"/>
                <div class="col-12 col-lg-6">
                    <div class="search_box">
                        <ul class="calendar_wrap_list btn_wrap_list">                
                            <li class="li_can">
                                <input type="date" class="input" title="일자선택" bind:value={startDate} id="start_date" name="start_date">
                            </li>
                            <li class="ih-lin">~</li>
                            <li class="li_can">
                                <input type="date" class="input" title="일자선택" bind:value={endDate} id="end_date" name="end_date">
                            </li>
                        </ul>
                    </div>
                </div>

                <div class="col-12 col-lg-6">
                    <div class="row">
                        <div class="col-12">
                            <div class="search_box">
                                <select bind:value={searchSelect} name="search_select" id="search_select" class="select">
                                    <option value="">전체</option>
                                    <option value="sender_id">송금관리자 아이디</option>
                                    <option value="settlement_account_number">계좌번호</option>
                                    <option value="settlement_holder">예금주명</option>
                                </select>
                
                                <div class="search_ba">
                                    <input type="search" class="input" bind:value={searchText} id="search_text" name="search_text" placeholder="검색어를 직접 입력해주세요.">
                                    <button type="submit" class="bt blue_bgbor mt_8px" on:click|preventDefault={handleSearch}>검색</button>
                                </div>
                            </div>                    
                        </div>
                    </div>
                </div>                
            </div>
        </div>

        <div class="right_btn">
            <ul>             
                <li>
                    <button type="button" class="abt reset_bt" on:click={handleReset} alt="초기화" title="초기화">초기화</button>
                </li> 
                <li> 
                    <select name="page_size" class="select select_listnum" bind:value={pageSize} on:change={handlePageSizeChange}>
                        <option value={10}>10건</option>
                        <option value={25}>25건</option>
                        <option value={50}>50건</option>
                        <option value={100}>100건</option>
                    </select>
                </li>           
            </ul>
        </div>
    </form>
</section>

<section class="borderbox_table">
    <div id="table_wrap" class="table_wrap">			
        <table class="table_list" width="100%">
            <caption>관리자 송금 테이블</caption>

            <colgroup>      
                <col style="width: 5% !important;"> <!-- 인덱스 -->               
                <col style="width: 8.67% !important;"> <!-- 송금자 아이디 -->
                <col style="width: 6.67% !important;"> <!-- 은행 -->
                <col style="width: 6.67% !important;"> <!-- 계좌번호 -->
                <col style="width: 6.67% !important;"> <!-- 예금주명 -->
                <col style="width: 6.67% !important;"> <!-- 송금금액 -->
                <col style="width: 6.67% !important;"> <!-- 송금수수료 -->
                <col style="width: 10% !important;"> <!-- 송금일자 -->   
            </colgroup>

            <thead>
                <tr>
                    <th rowspan="1" scope="col">No</th>
                    <th rowspan="1" scope="col">송금자ID</th>
                    <th rowspan="1" scope="col">은행</th>
                    <th rowspan="1" scope="col">계좌번호</th>
                    <th rowspan="1" scope="col">예금주명</th>
                    <th rowspan="1" scope="col">송금금액</th>
                    <th rowspan="1" scope="col">송금수수료</th>
                    <th rowspan="1" scope="col">송금일자</th>
                </tr> 
            </thead>
            <tbody>
                <tr>
                    <td>1</td>
                    <td class="wd_name">admin001</td>
                    <td>우리은행</td>
                    <td style="mso-number-format:'\@'">123-456-789012</td>
                    <td>홍길동</td>
                    <td>1,000,000</td>
                    <td>500</td>
                    <td>2023-03-21</td>
                </tr>
            </tbody>
        </table>
    </div>
</section>

<!-- 페이지네이션 -->
<section class="borderbox_pageing">
    <div class="pageing">
        <div class="page_navgation">
            <!-- 첫 페이지 이동 -->
            {#if page > 1}
                <a href="javascript:void(0)" on:click|preventDefault={() => search_page(1)} class="on arrow_bt">
                    <img class="arrow_icon chevron-double-left" src="/img/icon/chevron-double-left.svg" alt="첫 페이지">
                </a>
            {/if}

            <!-- 10페이지 뒤로 이동 -->
            {#if totalPages > 10}
                <a href="javascript:void(0)" on:click|preventDefault={() => search_page(1)} class="on arrow_bt">
                    <img class="arrow_icon chevron-left" src="/img/icon/chevron-left.svg" alt="10페이지 뒤로">
                </a>
            {/if}

            <!-- 페이지 번호 렌더링 -->
            {#each Array(Math.min(totalPages, 10)).fill(0).map((_, i) => i + 1) as pageNum}
                {#if pageNumber == pageNum}
                    <a href="javascript:void(0)" class="on" on:click|preventDefault={() => search_page(pageNum)}>{pageNum}</a>
                {:else}
                    <a href="javascript:void(0)" on:click|preventDefault={() => search_page(pageNum)}>{pageNum}</a>
                {/if}
            {/each}

            <!-- 10페이지 앞으로 이동 -->
            {#if totalPages - 10 >= page}
                <a href="javascript:void(0)" on:click|preventDefault={() => search_page(10)} class="on arrow_bt">
                    <img class="arrow_icon chevron-right" src="/img/icon/chevron-right.svg" alt="10페이지 앞으로">
                </a>
            {/if}

            <!-- 마지막 페이지 이동 -->
            {#if page < totalPages}
                <a href="javascript:void(0)" on:click|preventDefault={() => search_page(totalPages)} class="on arrow_bt">
                    <img class="arrow_icon chevron-double-right" src="/img/icon/chevron-double-right.svg" alt="마지막 페이지">
                </a>
            {/if}
        </div>
    </div>
</section>

<style>
    /* 전체 컨테이너 overflow 설정 */
    .borderbox.form_view {
        overflow: visible !important;
    }
    
    .form_search {
        overflow: visible !important;
        position: relative;
        z-index: 1;
    }
    
    .right_btn {
        overflow: visible !important;
        position: relative;
        z-index: 1;
    }
    
    .search_box {
        position: relative;
        z-index: 100;
        overflow: visible !important;
    }
    
    #searchForm {
        overflow: visible !important;
        position: relative;
        z-index: 1;
    }
    
    .row {
        overflow: visible !important;
    }
    
    .col-12, .col-lg-6 {
        overflow: visible !important;
    }
    
    /* 달력 input 스타일 */
    input[type="date"] {
        position: relative;
        z-index: 1000;
        overflow: visible !important;
        height: 40px !important;
        padding: 8px 12px !important;
        border: 1px solid #ddd;
        border-radius: 4px;
        box-sizing: border-box;
        font-size: 14px !important;
        line-height: 1.4 !important;
    }
    
    input[type="date"]::-webkit-calendar-picker-indicator {
        position: relative;
        z-index: 1001;
        cursor: pointer;
        width: 20px;
        height: 20px;
    }
    
    input[type="date"]::-webkit-datetime-edit {
        padding: 0;
        font-size: 14px;
        line-height: 1.4;
    }
    
    /* 셀렉트 박스 스타일 */
    select {
        box-sizing: border-box;
        height: 40px !important;
        padding: 8px 12px !important;
        font-size: 14px !important;
        line-height: 1.4 !important;
        border: 1px solid #ddd;
        border-radius: 4px;
        position: relative;
        z-index: 1000;
        overflow: visible !important;
    }
    
    select:focus {
        z-index: 1001 !important;
        position: relative;
        outline: none;
        border-color: #007bff;
    }
    
    /* 검색 버튼 스타일링 */
    .bt.blue_bgbor {
        padding: 8px 16px;
        background: #000;
        color: white;
        border: 1px solid #000;
        border-radius: 25px;
        cursor: pointer;
        white-space: nowrap;
        height: 40px !important;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        line-height: 1.4;
    }
    
    .search_ba {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .calendar_wrap_list {
        display: flex;
        align-items: center;
        gap: 8px;
    }
    
    /* 텍스트 입력 박스 스타일 */
    input[type="text"], input[type="search"] {
        height: 40px !important;
        padding: 8px 12px !important;
        font-size: 14px !important;
        line-height: 1.4 !important;
        border: 1px solid #ddd;
        border-radius: 4px;
        box-sizing: border-box;
    }
    
    /* 전체 폼 요소 높이 통일 */
    .input {
        height: 40px !important;
        padding: 8px 12px !important;
        font-size: 14px !important;
        line-height: 1.4 !important;
        border: 1px solid #ddd;
        border-radius: 4px;
        box-sizing: border-box;
    }
</style>