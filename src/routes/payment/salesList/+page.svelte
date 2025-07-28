<script lang="ts">
    import { onMount } from 'svelte';
    import { writable } from 'svelte/store';
    import { goto } from '$app/navigation';
    import { get } from 'svelte/store';
    import { authStore } from '$lib/stores/auth';
    import { showToast } from '$lib/stores/toast';
    import LogsLoadingSpinner from '$lib/components/logs/LogsLoadingSpinner.svelte'; //로딩중
    import LogsErrorBoundary from '$lib/components/logs/LogsErrorBoundary.svelte';
    import LeftMenu from '$lib/components/LeftMenu.svelte';
    import Layout from '$lib/components/payment/Layout.svelte';
    import Search from '$lib/components/payment/Search.svelte';
    import Pagenation from '$lib/components/payment/Pagenation.svelte';
    import SalesListModal from '$lib/components/payment/SalesListModal.svelte';
    import { useSalesListData } from '$lib/hooks/usePaymentData';
    import type { PaymentStats } from '$lib/types/payment';
    import { showSalesDetails} from '$lib/utils/payment/paymentUtils';
    import { PAYMENT_SALES_OPTIONS } from '$lib/constants/searchOptions';

    // 커스텀 훅 사용
    const listData = useSalesListData({searchSelect: 'store_catid'});

    // 리액티브 스토어 구독
    $: ({ loading, error, data: Lists, pagination, searchParams, totalStats } = $listData);

    // 검색 실행
    function handleSearch() {
        listData.search({
            searchSelect: searchParams.searchSelect,
            searchText: searchParams.searchText,
        });
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

    onMount(async () => {
       listData.loadData();
    });
</script>

<LeftMenu />
<SalesListModal />

<Layout>
    <Search
        bind:searchSelect={searchParams.searchSelect}
        bind:searchText={searchParams.searchText}
        bind:startDate={searchParams.startDate}
        bind:endDate={searchParams.endDate}
        bind:pageSize={pagination.pageSize}
        onSearch={handleSearch}
        onReset={handleReset}
        onPageSizeChange={handlePageSizeChange}
        searchOptions={PAYMENT_SALES_OPTIONS}
    />

    <!-- 로딩 및 에러 상태 -->
    <LogsLoadingSpinner {loading} message="데이터를 불러오는 중..." />
    <LogsErrorBoundary {error} onRetry={handleRetry} />

    <section class="borderbox_table">
        <div id="table_wrap" class="table_wrap">            
            <!--합계테이블 시작-->
            <table class="table_list" width="100%">
                <caption>매출내역 합계 </caption>
                <colgroup>                     
                    <col style="width: 14% !important;"> <!-- 합계 -->
                    <col style="width: 12% !important;">  <!--승인건수 -->
                    <col style="width: 12% !important;"> <!-- 승인금액  -->
                    <col style="width: 12% !important;"> <!-- 취소건수 -->
                    <col style="width: 12% !important;"> <!-- 취소금액  -->
                    <col style="width: 12% !important;"> <!-- 결제금액 -->
                </colgroup>
                <tbody>
                    <tr>
                        <th colspan="2" rowspan="2">합계</th>
                        <th>승인건수</th>
                        <th>승인금액</th>
                        <th>취소건수</th>
                        <th>취소금액</th>
                        <th>결제금액</th>                    
                    </tr>
                    <tr>
                        <td>0</td>   <!--승인건수-->
                        <td>0</td>   <!--승인금액-->
                        <td>0</td>   <!--취소건수-->
                        <td>0</td>   <!--취소금액-->
                        <td>0</td>   <!--결제금액-->
                    </tr>
                </tbody>
            </table>

            <table class="table_list" width="100%">
                <caption>매출내역 테이블</caption>
                <colgroup>        
                    <col style="width: 5% !important;">   <!-- 인덱스 -->             
                    <col style="width: 8.3% !important;"> <!-- 거래일자 -->
                    <col style="width: 8.3% !important;"> <!-- 가맹점 명 -->
                    <col style="width: 8.3% !important;"> <!-- 결제건수 -->
                    <col style="width: 8.3% !important;"> <!-- 결제건수 -->
                    <col style="width: 8.3% !important;"> <!-- 승인건수 -->
                    <col style="width: 8.3% !important;"> <!-- 승인금액 -->
                    <col style="width: 8.3% !important;"> <!-- 취소건수 -->
                    <col style="width: 8.3% !important;"> <!-- 취소금액 -->   
                    <col style="width: 8.3% !important;"> <!-- 결제금액 -->   
                </colgroup>

                <thead>
                    <tr>  
                        <th scope="col">No</th>
                        <th scope="col">거래일자 </th>
                        <th scope="col" class="wd_name">가맹점 명</th>
                        <th scope="col">TID</th>
                        <th scope="col">승인건수</th>
                        <th scope="col">승인금액</th>
                        <th scope="col">취소건수</th>
                        <th scope="col">취소금액</th>
                        <th scope="col">총결제건수</th>
                        <th scope="col">총결제금액</th>
                    </tr> 
                </thead>

                <tbody>
                    <!-- {#if Lists.length === 0 } -->
                        <!-- <tr>
                            <td colspan="9"> No data available </td>
                        </tr> -->
                    <!-- {:else} -->
                        <!-- {#each Lists as list, index}                    -->
                        <tr>
                            <td>1</td>
                            <td>2025-03-21</td>                         <!--거래일자-->
                            <td class="name_click wd_name">             <!--가맹점명-->
                                <span
                                    role="button"
                                    tabindex="0"
                                    on:click={showSalesDetails}
                                    on:keydown={showSalesDetails}                           
                                    aria-label="상세보기"
                                >
                                    <strong>길동횟집</strong>
                                </span>
                            </td>  
                            <td>store_catid</td>                         <!--catId-->
                            <td>0</td>                                   <!--승인 건수-->
                            <td>0</td>                                   <!--승인 금액-->
                            <td>0</td>                                   <!--취소 건수-->
                            <td>0</td>                                   <!--취소 금액-->
                            <td>0</td>                                   <!--총 결제건수-->
                            <td>0</td>                                   <!--총 결제금액-->
                        </tr>
                        <!-- {/each}
                    {/if} -->
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