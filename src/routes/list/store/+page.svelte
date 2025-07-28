<script lang="ts">
    import { writable } from 'svelte/store';
    import { onMount, onDestroy } from 'svelte';
    import ListLayout from '$lib/components/list/ListLayout.svelte';
    import ListSearch from '$lib/components/list/ListSearch.svelte';
    import ListPagination from '$lib/components/list/ListPagination.svelte';
    import LeftMenu from '$lib/components/LeftMenu.svelte';
    import LogsLoadingSpinner from '$lib/components/logs/LogsLoadingSpinner.svelte'; //로딩중
    import LogsErrorBoundary from '$lib/components/logs/LogsErrorBoundary.svelte';
    import { getTypeLabel, getUserTypeLabel, getUserRateLabel } from '$lib/utils/formatters';
    import { STORE_LIST_OPTIONS } from '$lib/constants/searchOptions';
    import { useListData } from '$lib/hooks/useListData';
    import type { StoreListData } from '$lib/types/store';
    import { goto } from '$app/navigation';

    let rate =  writable('');
    // 커스텀 훅 사용
    const listDataStore = useListData(rate, 'id', 'store');
    
    // 리액티브 스토어 구독
    $: ({ loading, error, data: storeLists, pagination, searchParams } = $listDataStore);
    
    // 포매터 함수들 (재생성 방지)
    const formatters = {
        getTypeLabel,
        getUserTypeLabel,
        getUserRateLabel
    };
    
    // 분류 텍스트 변환
    function getClassifyLabel(classify: string): string {
        return formatters.getUserTypeLabel(classify);
    }
    
    function getRateLabel(rate: string): string {
        return formatters.getUserRateLabel(rate);
    }
    
    // 검색 실행
    function handleSearch() {
        listDataStore.search({
            searchSelect: searchParams.searchSelect,
            searchText: searchParams.searchText,
            startDate: searchParams.startDate,
            endDate: searchParams.endDate
        });
    }
    
    // 검색 초기화
    function handleReset() {
        listDataStore.reset();
    }
    
    // 페이지 크기 변경
    function handlePageSizeChange() {
        listDataStore.changePageSize(pagination.pageSize);
    }
    
    // 페이지 이동
    function handlePageChange(page: number) {
        listDataStore.changePage(page);
    }
    
    // 재시도 함수
    function handleRetry() {
        listDataStore.loadData();
    }
    
    onMount(() => {
        listDataStore.loadData();
    });
    
    onDestroy(() => {
        listDataStore.destroy();
    });
</script>

<LeftMenu />
<ListLayout>
<!-- 검색 영역 -->
<ListSearch 
    bind:searchSelect={searchParams.searchSelect}
    bind:searchText={searchParams.searchText}
    bind:startDate={searchParams.startDate}
    bind:endDate={searchParams.endDate}
    bind:pageSize={pagination.pageSize}
    onSearch={handleSearch}
    onReset={handleReset}
    onPageSizeChange={handlePageSizeChange}
    searchOptions={STORE_LIST_OPTIONS}
    listType={"store"}
/>

    <!-- 로딩 및 에러 상태 -->
    <LogsLoadingSpinner {loading} message="리스트 데이터를 불러오는 중..." />
    <LogsErrorBoundary {error} onRetry={handleRetry} />

    <!-- 테이블 영역 -->
    <section class="borderbox_table">
        <div id="table_wrap" class="table_wrap">
            <table class="table_list" width="100%">
                <caption>가맹점 관리 테이블</caption>
                
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
                        {#each storeLists as store, index (store.id + store.edit_date)}
                            <tr>
                                <td>{pagination.totalCount - ((pagination.currentPage - 1) * pagination.pageSize) - index}</td>
                                <td class="text_left">{store.upper_path}</td>
                                <td>{store.store_name || ''}</td>
                                <td>{store.store_ceo_name || ''}</td>
                                <td>{store["store_wallet.terminal_commission"] || ''} % </td>
                                <td>     
                                    {#if store.login_state === '0'}
                                        <p style="color: #000000;"> 정상 </p>
                                    {:else if store.login_state === '1'}
                                        <p style="color: #be0000;" > 정지 </p>
                                    {:else if store.login_state === '2'}
                                        <p style="color: #646464;" > 탈퇴 </p>
                                    {:else}
                                        <p style="color: #be0000;" > 에러 </p>
                                    {/if}                                        
                                </td> 
                                <td>{store.id || ''}</td>
                                <td>{store.join_date || ''}</td>
                                <td>{store["store_wallet.bank_name"] || ''}</td>
                                <td>{store["store_wallet.account_num"] || ''}</td>
                                <td>{store["store_wallet.account_name"] || ''}</td>
                                <td> 
                                    <a href="{'javascript:void(0)'}" on:click|preventDefault={() => goto(`/edit/store?mid=${store["store_commission_table.store_catid"]}`)}>수정</a><br/>                  <!--정보수정-->
                                </td>   
                            </tr>
                        {/each}
                    {/if}
                </tbody>
            </table>
        </div>
    </section>


        <!-- 페이지네이션 -->
        {#if storeLists.length > 0}
        <ListPagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
        />
        {/if}
</ListLayout>

<style>
    .no_data {
        text-align: center;
        padding: 2rem;
        color: #666;
    }
</style>