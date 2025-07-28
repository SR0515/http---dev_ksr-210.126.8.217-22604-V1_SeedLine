<script lang="ts">
    import { goto } from '$app/navigation';
    import type { PageData } from './$types';
    
    export let data: PageData;
    
    let currentPage = 'P_settlement_list';
    let classify = 0;
    
    // 검색 변수들
    let startDate = '';
    let endDate = '';
    let pageSize = 10;
    
    // 페이지 이동 함수 (원본과 동일)
    function navigateTo(page: string) {
        if (page === 'P_settlement_list_detail') {
            goto('/settlement/partner/detail');
        }
    }
    
    // 검색 함수
    function handleSearch() {
        console.log('검색 실행:', { startDate, endDate });
    }
    
    function handleReset() {
        startDate = '';
        endDate = '';
        pageSize = 10;
        console.log('초기화 실행');
    }
    
    function handlePageSizeChange() {
        console.log('페이지 크기 변경:', pageSize);
    }
</script>

<!-- 보더박스 시작-->
<section class="borderbox form_view">
    <div class="title_wrap">
        <h5 class="page_title">정산관리 - 파트너 정산관리</h5>
    </div>
    <form id="searchForm">
        <div class="form_search">
            <div class="row mt-3">                    
                <input type="hidden" name="page" id="page"/>           
                    
                <div class="col-12">
                    <div class="search_box left_search">
                        <ul class="calendar_wrap_list btn_wrap_list">
                            <li class="li_can">
                                <input type="date" class="input" title="일자선택" bind:value={startDate} id="start_date" name="start_date" required>
                            </li>
                            <li class="ih-lin">~</li>
                            <li class="li_can">
                                <input type="date" class="input" title="일자선택" bind:value={endDate} id="end_date" name="end_date" required>
                            </li>
                        </ul>
                        <div class="btn_list_b">
                            <button type="submit" class="bt blue_bgbor" on:click|preventDefault={handleSearch}>검색</button>
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
<!--보더박스 끝-->

<!-- 보더박스_테이블 시작 -->
<section class="borderbox_table">        
    <div id="table_wrap" class="table_wrap">			
        <table class="table_list settlement_table" width="100%">
            <caption>파트너 정산관리 테이블</caption>

            <colgroup>                     
                <col style="width: 10% !important;"> <!-- No -->
                <col style="width: 60% !important;"> <!-- 타이틀  -->
                <col style="width: 20% !important;">  <!-- 날짜 -->
            </colgroup>
            <thead>
                <tr>      
                    <th scope="col">No</th>
                    <th scope="col">정산 내역</th>
                    <th scope="col">날짜</th>
                </tr> 
            </thead>

            <tbody>
                <tr>
                    <td>1</td>
                    {#if classify === 0 || classify === 2}
                        <td class="settle_title">
                            <a href="javascript:void(0)" on:click|preventDefault={() => navigateTo('P_settlement_list_detail')}>2023년 03월 정산내역</a>
                        </td>
                    {:else if classify === 1}
                        <td class="settle_title">
                            <a href="javascript:void(0)" on:click|preventDefault={() => navigateTo('P_settlement_list_detail')}>2023년 03월 정산내역</a>
                        </td>
                    {/if}     
                    <td>2025-03</td>
                </tr>
            </tbody>
        </table>
    </div>
</section>
<!-- 보더박스_테이블 끝 -->

<!-- 보더박스_페이징 시작-->
<section class="borderbox_pageing">
    <div class="pageing">
        <div class="page_navgation">
            <a href="javascript:void(0)" class="on arrow_bt">
                <img class="arrow_icon chevron-double-left" src="/img/icon/chevron-double-left.svg" alt="10페이지 전">
            </a>
            <a href="javascript:void(0)" class="on">1</a>
            <a href="javascript:void(0)" class="">2</a>
            <a href="javascript:void(0)" class="">3</a>
            <a href="javascript:void(0)" class="on arrow_bt">
                <img class="arrow_icon chevron-double-right" src="/img/icon/chevron-double-right.svg" alt="10페이지 후">
            </a>
        </div>
    </div>
</section>
<!-- 보더박스_페이징 끝 -->

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
    
    .col-12 {
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
    
    /* 검색 버튼과 달력 박스 정렬 */
    .btn_list_b {
        display: flex;
        align-items: center;
        margin-top: 0 !important;
    }
    
    .btn_list_b .bt {
        padding: 8px 16px;
        background: #000;
        color: white;
        border: 1px solid #000;
        border-radius: 25px;
        cursor: pointer;
        white-space: nowrap;
        margin-top: 0 !important;
        height: 40px !important;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        line-height: 1.4;
    }
    
    .calendar_wrap_list {
        display: flex;
        align-items: center;
        gap: 8px;
    }
    
    .search_box.left_search {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .search_box.left_search ul {
        margin: 0;
        display: flex;
        align-items: center;
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