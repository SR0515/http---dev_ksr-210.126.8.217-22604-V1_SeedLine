<script lang="ts">
    import { onMount } from 'svelte';
    import { closeModal, openReceipt} from '$lib/utils/payment/paymentUtils';

    let terminalRs_modal = {};
    let cancelRs = [];
    let matchFound = false;
    let result_type = 3;
    let cancelYN = "N";

    
</script>

<!-- 모달 창 HTML -->
<div class="CK_modal btn_position" id="detail_modal">
    <div class="modal-content" style="height: 600px;">
        <a href="{'javascript:void(0)'}" on:click={closeModal} class="btn_close" aria-label="닫기">
            <span class="btn__close"></span>
        </a>
      
        <div id="modalBody" style="overflow-y:auto;">          
            <div id="table_wrap_modal" class="table_wrap_modal">		
                <div class="modal_title">
                    <h4>총 건수 : <span class="sum_textr">1</span> 승인 건수 : <span class="sumt_textr">1</span>  취소 건수 : <span class="cancel_textr">0</span></h4>
                    <p class="load_time_w"><span>로딩 시간 :</span> <span class="sum_textr1">0.050</span> <span class="unit_t">초</span></p>
                </div>

                <table class="modal_table_list" width="100%">
                    <caption>결제내역 테이블</caption>
                    <colgroup>
                        <col style="width: 5% ">     <!-- 번호 -->
                        <col style="width: 8% ">     <!-- 결제상태 -->
                        <col style="width: 8% ">     <!-- PG -->
                        <col style="width: 12% ">    <!-- 카드번호 -->
                        <col style="width: 10% ">    <!-- 승인번호 -->
                        <col style="width: 6% ">     <!-- 할부 -->
                        <col style="width: 8% ">     <!-- 결제금액 -->
                        <col style="width: 10% ">    <!-- 가맹점명 -->
                        <col style="width: 8% ">     <!-- TID -->
                        <col style="width: 5% ">     <!-- 결제구분 -->
                        <col style="width: 10% ">    <!-- 결제일 -->
                        <col style="width: 10% ">    <!-- 취소일 -->
                    </colgroup>

                    <thead>
                        <tr>
                            <th scope="col">번호</th>
                            <th scope="col">결제상태</th>
                            <th scope="col">PG</th>
                            <th scope="col">카드번호</th>
                            <th scope="col">승인번호</th>
                            <th scope="col">할부</th>
                            <th scope="col">결제금액</th>
                            <th scope="col">가맹점명</th>
                            <th scope="col">TID</th>
                            <th scope="col">결제구분</th>
                            <th scope="col">결제일</th>
                            <th scope="col">취소일</th>
                        </tr>
                    </thead>

                    <tbody>
                        <!-- <% If terminalRs_modal.EOF Then %>
                            <tr>
                                <td colspan="12">검색 결과가 없습니다.</td>
                            </tr>
                        <% Else %> -->
                        <tr>
                            <td>1</td>
                            <td>                 
                                {#if cancelYN === "Y"}
                                    <a class="pay_t name_click paylink red_text" href="{'javascript:void(0)'}" on:click|preventDefault={openReceipt}>
                                        <strong>취소</strong>
                                    </a>
                                {:else if cancelYN === "N"}
                                    {#if matchFound}
                                    <div style="padding-right: 20px; min-width: 70px;">
                                        <span><img class="recycle_icon" src="../img/icon/recycle.png" alt=""></span>
                                        <a class="pay_t name_click paylink green_text" href="{'javascript:void(0)'}" on:click|preventDefault={openReceipt}>
                                            <strong>승인</strong>
                                        </a>
                                    </div>
                                    {:else}
                                    <a class="pay_t name_click paylink green_text" href="{'javascript:void(0)'}" on:click|preventDefault={openReceipt} >
                                        <strong>승인</strong>
                                    </a>
                                    {/if}
                                {:else if cancelYN === "DY"}
                                    <a class="pay_t name_click paylink gray_text" href="{'javascript:void(0)'}" on:click|preventDefault={openReceipt}>
                                        <strong>중복결제 취소</strong>
                                    </a>
                                {/if}
                            </td>
                            <td> 
                                {#if result_type === 0}
                                Korpay
                                {:else if result_type === 1}
                                Galaxia
                                {:else if result_type === 2}
                                Ksnet
                                {:else if result_type === 3}
                                Kwon
                                {/if}
                            </td> 
                            <td>123456789000</td>
                            <td>11112222</td>
                            <td>
                                <!-- <% If terminalRs_modal("quota") = "00" Then %> -->
                                    일시불
                                <!-- <% Else %>
                                    <%= terminalRs_modal("quota") %>개월
                                <% End If %> -->
                            </td>
                            <td>1,000</td>
                            <td>
                                <!-- <% If IsNull(terminalRs_modal("name")) Then %>
                                    미등록 가맹점
                                <% Else %>
                                    <%= terminalRs_modal("name") %>
                                <% End If %> -->
                                가맹점명
                            </td>
                            <td>12345678</td>
                            <td>신용</td>
                            <td>20250331141800</td>
                            <td>20250331141800</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>