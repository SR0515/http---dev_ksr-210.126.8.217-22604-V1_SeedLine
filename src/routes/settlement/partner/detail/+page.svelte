<script>
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import LeftMenu from '$lib/components/LeftMenu.svelte';

    let currentPage = 'P_settlement_list_detail';

    // 페이지 이동 함수
    function navigateTo(page) {
        if (page === 'P_settlement_list') {
            goto('/settlement/partner');
        }
    }

    function closePopup() {
        document.getElementById("detail_modal").style.display="none";
    }

    function showSalesDetails(){   
        document.getElementById("detail_modal").style.display="block";        
    }
</script>

<LeftMenu />

<div id="page_contect" class="">
    <div id="content" class="container">
        <!-- 보더박스 시작-->
        <section class="borderbox form_view">
            <form id="stateform" method="post">
                <input type="hidden" name="settle_date" id="settle_date" value="">
            </form>
            <div class="title_wrap">
                <h5 class="page_title">정산관리 - 2025-03 파트너 정산내역</h5>
            </div>
    
            <div class="right_btn">
                <ul>             
                    <li><button type="button" class="abt woori_bt" alt="다운로드" title="엑셀다운로드하기" style="border-radius: 25px; padding: 8px 16px; cursor: pointer;">우리은행</button></li>          
                    <li><button type="button" class="abt ibk_bt" alt="다운로드" title="엑셀다운로드하기" style="border-radius: 25px; padding: 8px 16px; cursor: pointer;">기업은행</button></li>          
                    <li><button type="button" class="abt excel_bt" alt="다운로드" title="엑셀다운로드하기" style="border-radius: 25px; padding: 8px 16px; cursor: pointer;">Excel</button></li>          
                </ul>
            </div>
        </section>
        <!-- 보더박스_테이블 시작 -->
        <section class="borderbox_table">
            <div id="table_wrap" class="table_wrap">	
                <div id="table_wrap2" class="table_wrap">
                    <table class="table_list" width="100%">
                        <colgroup>                     
                            <col style="width: 16% !important;"> <!-- 상점 명 -->
                            <col style="width: 8% !important;"> <!--catID -->
                            <col style="width: 6% !important;"> <!--결제금액 -->
                            <col style="width: 5% !important;"> <!-- 수수료  -->
                            <col style="width: 8% !important;"> <!-- 본사(업체명) -->
                            <col style="width: 1% !important;"> <!-- 수수료율  -->
                            <col style="width: 6% !important;"> <!-- 정산금액 -->
                            <col style="width: 10% !important;"> <!-- 대행사(업체명) -->
                            <col style="width: 1% !important;"> <!-- 수수료율 -->
                            <col style="width: 5% !important;"> <!-- 정산금액 -->
                            <col style="width: 10% !important;"> <!-- 에이전시(업체명) -->
                            <col style="width: 1% !important;"> <!-- 수수료율 -->
                            <col style="width: 5% !important;"> <!-- 정산 금액 -->
                        </colgroup>
                        <thead>
                            <tr>
                                <th scope="col" rowspan="2"> 상점명</th>
                                <th scope="col" rowspan="2">TID</th> 
                                <th scope="col" rowspan="2"> 결제금액</th>
                                <th scope="col" rowspan="2">수수료</th> 
                                <th scope="col" colspan="9">소속 파트너</th>
                            </tr> 
                            <tr>
                                <th scope="col" colspan="1">본사(업체명)</th>
                                <th scope="col" colspan="1">수수료율</th>
                                <th scope="col" colspan="1">정산금액</th>
                                <th scope="col" colspan="1">대행사(업체명)</th>
                                <th scope="col" colspan="1">수수료율</th>
                                <th scope="col" colspan="1">정산금액</th>
                                <th scope="col" colspan="1">에이전시(업체명)</th>
                                <th scope="col" colspan="1">수수료율</th>
                                <th scope="col" colspan="1">정산금액</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td class="pay_t name_click wd_date"> <strong on:click={showSalesDetails} on:keydown={showSalesDetails}> 길동이주점 </strong></td>
                                <td class="pay_t">00001111</td>
                                <td class="pay_t"> 1,000</td>
                                <td class="pay_t">100</td>
                                <td class="pay_t wd_name">MTS</td>   
                                <td class="pay_t"><span class="red_t">10.0 % </span></td>
                                <td class="pay_t">900</td>
                                <td class="pay_t wd_name" data-mso-number-format="\@">
                                    대행사1
                                    <input type="hidden" value="">
                                    <input type="hidden" value="">
                                    <input type="hidden" value="">
                                </td>    
                                <td class="pay_t"><span class="red_t">1.0 % </span></td>
                                <td class="pay_t">891</td>
                                <td class="pay_t wd_agency" data-mso-number-format="\@">
                                    에이전시1
                                    <input type="hidden" value="">
                                    <input type="hidden" value="">
                                    <input type="hidden" value="">
                                    <span>-</span>
                                </td>
                                <td class="pay_t" data-mso-number-format="\@">
                                    <span class="red_t">0.0 % </span> 
                                    <span>-</span>
                                </td>
                                <td class="pay_t" data-mso-number-format="\@">
                                    <span class="pay_t">891</span> 
                                    <span>-</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <!--합계 테이블 시작-->
                <table class="table_list" width="100%">
                    <colgroup>                     
                        <col style="width: 8% !important;"> <!-- 합계 -->
                        <col style="width: 5% !important;"> <!-- 결제건수 -->
                        <col style="width: 5% !important;">  <!--승인건수 -->
                        <col style="width: 10% !important;"> <!-- 승인금액  -->
                        <col style="width: 5% !important;"> <!-- 취소건수 -->
                        <col style="width: 10% !important;"> <!-- 취소금액  -->
                        <col style="width: 10% !important;"> <!-- 정산금액 -->
                        <col style="width: 10% !important;"> <!-- 수수료 -->
                        <col style="width: 10% !important;"> <!-- 최종 정산금액-->
                    </colgroup>
                    <tbody>
                        <tr>
                            <th scope="col" rowspan="2" colspan="2">합계</th>
                            <th scope="col" rowspan="1" colspan="5">가맹점 결제금액</th>
                            <th scope="col" rowspan="1" colspan="5">본사 정산금액</th>
                            <th scope="col" rowspan="1" colspan="5">파트너 정산금액</th>
                        </tr>
                        <tr>
                            <td colspan="5">900</td>
                            <td colspan="5">891</td>
                            <td colspan="5">891</td>
                        </tr>
                    </tbody>
                </table>
                <!--합계 테이블 끝-->
            </div>   
        </section>
        <!-- 보더박스_테이블 끝 -->
        <div class="list_box">
            <button class="defer_btn" type="button" on:click|preventDefault={() => navigateTo('P_settlement_list')} style="border-radius: 25px; padding: 8px 16px; cursor: pointer;">목록으로</button>
        </div>
    </div>
</div>

<!-- 모달 창 HTML -->
<div class="CK_modal btn_position" id="detail_modal" style="display: none;">
    <div class="modal-content" style="height: 600px;">
        <a href="javascript:void(0)" on:click={closePopup} class="btn_close"><span class="btn__close" alt="닫기" title="닫기"></span></a>
        <div id="modalBody" style="overflow-y: auto;">  
            <button id="captureButton">캡쳐</button>        
            <div id="table_wrap_modal" class="table_wrap_modal">
                <!-- 터미널 매출 상세 모달 내용 -->
                <p>터미널 매출 상세 정보</p>
            </div>
        </div>
    </div>
</div>

<style>
    /* 드롭다운 짤림 현상 해결 */
    .form_search, .right_btn {
        overflow: visible !important;
    }
    
    .search_box {
        position: relative;
        z-index: 10;
        overflow: visible !important;
    }
</style>