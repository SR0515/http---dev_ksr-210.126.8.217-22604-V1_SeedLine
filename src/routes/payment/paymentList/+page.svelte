<script lang="ts">
    import { onMount } from 'svelte';
    import { writable } from 'svelte/store';
    import { goto } from '$app/navigation';
    import { get } from 'svelte/store';
    import { authStore } from '$lib/stores/auth';
    import { showToast } from '$lib/stores/toast';
    import { getClientIP} from '$lib/utils/store/commissionUtils'; // 공인 IP 조회함수
    import { getTodayDate } from '$lib/utils/formatters';
    import LogsLoadingSpinner from '$lib/components/logs/LogsLoadingSpinner.svelte'; //로딩중
    import LogsErrorBoundary from '$lib/components/logs/LogsErrorBoundary.svelte';
    import LeftMenu from '$lib/components/LeftMenu.svelte';
    import Layout from '$lib/components/payment/Layout.svelte';
    import PaymentListSearch from '$lib/components/payment/PaymentListSearch.svelte';
    import Pagenation from '$lib/components/payment/Pagenation.svelte';
    import { usePaymentListData } from '$lib/hooks/usePaymentData';
    import { getPaymentListData, paymentCancel, formatPayDate} from '$lib/utils/payment/paymentUtils';
    import type { PaymentStats } from '$lib/types/payment';

    // 커스텀 훅 사용
    const listData = usePaymentListData({searchSelect: 'appNo', pgSelect: '', cancelSelect: ''});

    // 리액티브 스토어 구독
    $: ({ loading, error, data: Lists, pagination, searchParams, totalStats } = $listData);

    const todayDate = getTodayDate().replace(/-/g, ''); 


    // 검색 실행
    async function handleSearch() {
        console.log('handleSearch 호출 - searchParams:', searchParams);
        listData.search({
            searchSelect: searchParams.searchSelect,
            pgSelect: searchParams.pgSelect,
            cancelSelect: searchParams.cancelSelect,
            searchText: searchParams.searchText,
            startDate: searchParams.startDate,
            endDate: searchParams.endDate
        });

        const result = await getPaymentListData(
            1, // 현재 페이지 번호
            10, // 페이지 사이즈
            {
                searchSelect: searchParams.searchSelect,
                pgSelect: searchParams.pgSelect, 
                searchText: searchParams.searchText,
                cancelSelect: searchParams.cancelSelect,
                startDate: searchParams.startDate,
                endDate: searchParams.endDate
            }
        );

        totalStats = result.totalStats;
    }
    
    // 검색 초기화
    function handleReset() {
        listData.reset();
    }
    
    // 페이지 크기 변경
    function handlePageSizeChange() {
        listData.changePageSize(pagination.pageSize);
    }
    
    // 페이지 이동
    function handlePageChange(page: number) {
        listData.changePage(page);
    }
    
    // 재시도 함수
    function handleRetry() {
        listData.loadData();
    }

    function openReceipt(){
        window.open('/payment/receipt', '_blank', 'width=400,height=700');
    }

    onMount(async () => {
        const result = await getPaymentListData(
            1, // 현재 페이지 번호
            10, // 페이지 사이즈
            {
                searchSelect: searchParams.searchSelect,
                pgSelect: searchParams.pgSelect,
                searchText: searchParams.searchText,
                cancelSelect: searchParams.cancelSelect,
                startDate: searchParams.startDate,
                endDate: searchParams.endDate
            }
        );
        totalStats = result.totalStats;
    });
</script>

<LeftMenu />

<Layout>
    <PaymentListSearch 
        bind:searchSelect={searchParams.searchSelect}
        bind:pgSelect={searchParams.pgSelect}
        bind:cancelSelect={searchParams.cancelSelect}
        bind:searchText={searchParams.searchText}
        bind:startDate={searchParams.startDate}
        bind:endDate={searchParams.endDate}
        bind:pageSize={pagination.pageSize}
        onSearch={handleSearch}
        onReset={handleReset}
        onPageSizeChange={handlePageSizeChange}
    />

    <!-- 로딩 및 에러 상태 -->
    <LogsLoadingSpinner {loading} message="데이터를 불러오는 중..." />
    <LogsErrorBoundary {error} onRetry={handleRetry} />

    <section class="terminal_df_bw">
        <div class="status-legend">
            <ul class="legend-items" style="display:flex;align-items: center;">
                <li>
                    <span class="status-indicator status-waiting"></span>
                    <span>입금대기</span>
                </li>
                <li>
                    <span class="status-indicator status-preparing"></span>
                    <span>입금준비</span>
                </li>
                <li>
                    <span class="status-indicator status-completed"></span>
                    <span>입금완료</span>
                </li>
            </ul>
        </div>

        <div class="left_title" style="display:flex;align-items: center;">
            <div>
                승인 : 
                <span class="sumt_textr">{totalStats?.pay_count ?? 0}</span>건 
                {#if totalStats?.pay_sum == null }
                    <span class="sumt_textr"> 0 </span>원 |
                {:else}
                    <span class="sumt_textr">{totalStats.pay_sum?.toLocaleString()}</span>원
                {/if}            
            </div>

            <div>
                취소 : 
                <span class="cancel_textr">{totalStats?.refund_count ?? 0}</span>건 
                {#if totalStats.refund_count == null }
                    <span class="cancel_textr"> 0 </span>원 |
                {:else}
                    <span class="cancel_textr">{totalStats.refund_sum?.toLocaleString()}</span>원
                {/if}
            </div>

            <div>
                결제 금액 :
                {#if totalStats.total_amount == null }
                    <span class="sum_textr"> 0 </span>원
                {:else}
                    <span class="sum_textr">{totalStats.total_amount?.toLocaleString()}</span>원
                {/if}               
            </div>

            <div>
                정산 금액 :
                {#if totalStats.settle_sum == null}
                    <span class="settle_textr">0</span>원
                {:else}
                    <span class="settle_textr">{totalStats.settle_sum?.toLocaleString()}</span>원
                {/if}             
            </div>
        </div>
    </section>

    <section class="borderbox_table">     
        <div id="table_wrap" class="table_wrap">			
            <table class="table_list" width="100%">
                <caption>결제내역 테이블</caption>

                <colgroup>                     
                    <col style="width: 5% !important;">  <!-- 인덱스 -->
                    <col style="width: 7% !important;">  <!-- 상태 -->
                    <col style="width: 7% !important;">  <!-- 결제상태 -->
                    <col style="width: 10% !important;"> <!-- 결제일 -->   
                    <col style="width: 10% !important;"> <!-- 취소일 -->   
                    <col style="width: 8.3% !important;"> <!-- 결제금액 -->  
                    <col style="width: 8.3% !important;"> <!-- TID -->   
                    <col style="width: 8.3% !important;"> <!-- 가맹점명 -->   
                    <col style="width: 8.3% !important;"> <!-- PG -->
                    <col style="width: 5% !important;"> <!-- 매입사 -->
                    <col style="width: 8.3% !important;"> <!-- 승인번호 -->
                    <col style="width: 8.3% !important;"> <!-- 카드번호 -->
                    <col style="width: 8.3% !important;"> <!-- 할부 -->
                    <col style="width: 8.3% !important;"> <!-- 결제구분 -->  
                </colgroup>

                <thead>
                    <tr>  
                        <th scope="col">No</th>
                        <th scope="col">상태</th>
                        <th scope="col">결제상태</th>
                        <th scope="col">결제일</th>
                        <th scope="col">취소일</th>
                        <th scope="col">결제금액</th>
                        <th scope="col">TID</th>
                        <th scope="col">가맹점명</th>
                        <th scope="col">PG</th>
                        <th scope="col">매입사</th>
                        <th scope="col">승인번호</th>
                        <th scope="col">카드번호</th>
                        <th scope="col">할부</th>
                        <th scope="col">결제구분</th>
                    </tr> 
                </thead>

                <tbody>
                    {#if Lists.length === 0 }
                        <tr>
                            <td colspan="14"> No data available </td>
                        </tr>
                    {:else}
                        {#each Lists as list, index}
                        <tr>
                            <td> {pagination.totalCount - ((pagination.currentPage - 1) * pagination.pageSize) - index} </td>
                            <td>                                         <!--입금상태-->
                                {#if list.pay_type === "2"}
                                    {#if list.settlement_state === "0"}
                                        <!-- 입금대기 상태 -->
                                        <div class="status-indicator status-waiting" title="입금대기"></div>
                                    {:else if list.settlement_state === "1"}
                                        <!-- 입금준비 상태 -->
                                        <div class="status-indicator status-preparing" title="입금준비"></div>
                                    {:else if list.settlement_state === "2"}
                                        <!-- 입금완료 상태 -->
                                    <div class="status-indicator status-completed" title="입금완료"></div>
                                    {:else}
                                        <!-- 상태 미확인 -->
                                        <div class="status-indicator status-unknown" title="상태미확인"></div>
                                    {/if}
                                {:else if (list.pay_type === "1" || list.pay_type === "4") && list.cancelYN === "N"}
                                    {#if list.settlement_state === '2'}
                                        <div class="status-indicator status-completed" title="입금완료"></div>
                                    {:else if todayDate === list.appDtm.substring(0, 8)}
                                        <button type="button" on:click={() => paymentCancel(list.pay_type, list.cancelYN, list.tid)}>승인취소</button>
                                    {/if}
                                {/if}
                            </td>
                            <td>        <!--결제상태-->
                                {#if list.cancelYN === "Y" || list.cancelYN === "CY"}
                                    <a class="pay_t name_click paylink red_text" href="{'javascript:void(0)'}" on:click|preventDefault={openReceipt}><strong>취소</strong></a>
                                {:else if list.cancelYN === "N" || list.cancelYN === "CN"}
                                    <a class="pay_t name_click paylink green_text" href="{'javascript:void(0)'}" on:click|preventDefault={openReceipt}><strong>승인</strong></a>                                
                                {:else if list.cancelYN === "DY"}
                                    <a class="pay_t name_click paylink gray_text" href="{'javascript:void(0)'}" on:click|preventDefault={openReceipt}><strong>중복결제 취소</strong></a>
                                {/if}
                            </td>            
                            <td style="mso-number-format:'\@'"> {formatPayDate(list.appDtm)}</td>                 <!--결제일-->  
                            <td style="mso-number-format:'\@'"> {formatPayDate(list.ccDnt)} </td>                <!--취소일-->   
                            <td> {Number(list.amt)?.toLocaleString()} </td>                                                     <!--결제금액-->
                            <td>                                                                 <!--TID-->
                                {#if list.pay_type === "0"}
                                    {list.T_catId || ""}
                                {:else if list.pay_type === "1" || list.pay_type === "2"}
                                    {list.Ki_catId || ""}
                                {/if}
                            </td>  

                            <td>
                                {#if list.Name === null}                                                                 <!-- 가맹점명 -->
                                    미등록 가맹점
                                {:else}
                                    {list.Name}
                                {/if}
                            </td>

                            <td>     <!--PG-->
                                {#if list.result_type === "0"}
                                    Korpay
                                {:else if list.result_type === "1"}
                                    Galaxia
                                {:else if list.result_type === "2"}
                                    Ksnet
                                {:else if list.result_type === "3"}
                                    Kwon
                                {/if}
                            </td>                                 
                            <td> {list.appCardCd}</td>                                  <!--매입사-->
                            <td> {list.appNo} </td>                                     <!--승인번호-->
                            <td> {list.cardNo} cardNo</td>                              <!--카드번호-->
                            <td class="wd_quota">                                       <!--할부-->
                                {#if list.quota === "00" || list.quota === "0"}
                                    일시불
                                {:else}
                                    {list.quota}개월
                                {/if}
                            </td>                                               
                            <td>
                                {#if list.pay_type === "0"}
                                    단말기
                                {:else if list.pay_type === "1"}
                                    수기
                                {:else if list.pay_type === "2"}
                                    수기(실시간)   
                                {:else if list.pay_type === "3"}
                                    단말기(실시간)
                                {:else if list.pay_type === "4"}
                                    인증
                                {:else}
                                    관리자 문의
                                {/if}
                            </td>                            
                            <!-- <td>결제구분
                                <% IF terminalRs("pay_type") = "1" AND terminalRs("cancelYN") ="N" Then %>
                                    <% todayDate = Year(Date()) & Right("0" & Month(Date()), 2) & Right("0" & Day(Date()), 2)
                                        getDate = Left(terminalRs("appDtm"), 8)
                                        If todayDate  = getDate Then %>
                                        <a href="#" onclick="checkSubmit('<%=terminalRS("tid")%>','<%=terminalRs("buyerId")%>')">승인취소</a>
                                    <% End If %>
                                <% End If %>
                            </td> -->
                        </tr>
                        {/each}
                    {/if}
                </tbody>
            </table>
        </div>
    </section>

    <!-- 페이지네이션 -->
    {#if Lists.length > 0}
        <Pagenation
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
        />
    {/if}

</Layout>