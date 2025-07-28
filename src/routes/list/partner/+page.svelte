<script lang="ts">
    import { writable } from 'svelte/store';
    import { onMount, onDestroy } from 'svelte';
    import { page } from '$app/stores';
    import ListLayout from '$lib/components/list/ListLayout.svelte';
    import ListSearch from '$lib/components/list/ListSearch.svelte';
    import ListPagination from '$lib/components/list/ListPagination.svelte';
    import LeftMenu from '$lib/components/LeftMenu.svelte';
    import LogsLoadingSpinner from '$lib/components/logs/LogsLoadingSpinner.svelte'; //로딩중
    import LogsErrorBoundary from '$lib/components/logs/LogsErrorBoundary.svelte';
    import { getTypeLabel, getUserTypeLabel, getUserRateLabel } from '$lib/utils/formatters';
    import { PARTNER_LIST_OPTIONS } from '$lib/constants/searchOptions';
    import { useListData } from '$lib/hooks/useListData';
    import type { PartnerListData } from '$lib/types/partner';
    import { goto } from '$app/navigation';

    $: writePartner = $page.url.searchParams ?? '';

    const rateStore = writable('');

    let rate: string = '';
    let id: string;
    let name: string;
    
    // 커스텀 훅 사용
    const listDataPartner = useListData( rateStore, 'id','partner');

    // 리액티브 스토어 구독
    $: ({ loading, error, data: partnerLists, pagination, searchParams, upper_rate } = $listDataPartner);

    $: WriteRate = upper_rate || '';
    
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
        listDataPartner.search({
            searchSelect: searchParams.searchSelect,
            searchText: searchParams.searchText,
            startDate: searchParams.startDate,
            endDate: searchParams.endDate
        });
    }
    
    // 검색 초기화
    function handleReset() {
        listDataPartner.reset();
    }
    
    // 페이지 크기 변경
    function handlePageSizeChange() {
        listDataPartner.changePageSize(pagination.pageSize);
    }
    
    // 페이지 이동
    function handlePageChange(page: number) {
        listDataPartner.changePage(page);
    }
    
    // 재시도 함수
    function handleRetry() {
        listDataPartner.loadData();
    }
    
    onMount(() => {
        const params = $page.url.searchParams;
        rateStore.set(params.get('rate') ?? '');
        id = params.get('id') ?? '';
        name = params.get('name') ?? '';
        listDataPartner.loadData();
    });


    onDestroy(() => {
        listDataPartner.destroy();
    });

    let prevRate = '';


    $: {
        const newRate = $page.url.searchParams.get('rate') ?? '';
        if (newRate !== prevRate) {
            rateStore.set(newRate);
            listDataPartner.changePage(1);
            listDataPartner.loadData(); // ✅ rate 바뀌면 다시 로드
            prevRate = newRate;
        }
    }
</script>

<LeftMenu />
<ListLayout>
<!-- 검색 영역 -->
<ListSearch 
    bind:writePartner={writePartner}
    bind:searchSelect={searchParams.searchSelect}
    bind:searchText={searchParams.searchText}
    bind:startDate={searchParams.startDate}
    bind:endDate={searchParams.endDate}
    bind:pageSize={pagination.pageSize}
    WriteRate={WriteRate}
    onSearch={handleSearch}
    onReset={handleReset}
    onPageSizeChange={handlePageSizeChange}
    searchOptions={PARTNER_LIST_OPTIONS}
    listType={"partner"}
/>

<!-- 로딩 및 에러 상태 -->
<LogsLoadingSpinner {loading} message="리스트 데이터를 불러오는 중..." />
<LogsErrorBoundary {error} onRetry={handleRetry} />

<!-- 테이블 영역 -->
<section class="borderbox_table">
    <div id="table_wrap" class="table_wrap">
        <table class="table_list" width="100%">
            <caption>파트너 관리 테이블</caption>
            
            <colgroup>           
                    <col style="width: 5% !important;"> <!-- 인덱스 -->                  
                    <col style="width: 23% !important;"> <!-- 업체경로 -->
                    <col style="width: 10% !important;"> <!-- 업체명 -->
                    <col style="width: 8% !important;"> <!-- 대표명 -->
                    <col style="width: 10% !important;"> <!-- 대표 연락처 -->
                    <col style="width: 6% !important;"> <!-- 계약상태 -->
                    <col style="width: 10% !important;"> <!-- 아이디 -->
                    <col style="width: 10% !important;"> <!-- 등록일자 -->   
                    <col style="width: 10% !important;"> <!-- 수정일자 -->    
                    <col style="width: 8% !important;"> <!-- 정보 -->       
            </colgroup>
            
            <thead>
                <tr>  
                    <th>No</th>
                    <th>업체경로</th>
                    <th>업체명</th>
                    <th>대표명</th>
                    <th>연락처</th>
                    <th>계약상태</th>
                    <th>아이디</th>
                    <th>등록일자</th>
                    <th>수정일자</th>
                    <th>정보</th>
                </tr> 
            </thead>
            
            <tbody>
                    {#if partnerLists.length === 0}
                            <tr>
                                <td colspan="10" class="no_data">등록된 데이터가 없습니다.</td>
                            </tr>
                        {:else}
                            {#each partnerLists as dist, index}
                                <tr>
                                    <td>{pagination.totalCount - ((pagination.currentPage - 1) * pagination.pageSize) - index}</td>
                                    <td class="text_left"> {dist.upper_name}</td>
                                    <td>{dist.name}</td>
                                    <td>{dist.ceo_name}</td>
                                    <td>{dist.contact}</td>
                                    <td>
                                        {#if dist.login_state === '0'}
                                        <p style="color: #000000;">정상</p>
                                        {:else if dist.login_state === '1'}
                                        <p style="color: #be0000;">정지</p>
                                        {:else if dist.login_state === '2'}
                                        <p style="color: #646464;">탈퇴</p>
                                        {:else}
                                        <p style="color: #be0000;">에러</p>
                                        {/if}
                                    </td>
                                    <td>{dist.id}</td>
                                    <td>{dist.join_date?.split('T')[0]}</td>
                                    <td>{dist.edit_date?dist.edit_date.split('T')[0] : ''}</td>
                                    <td><a href="{'javascript:void(0)'}" on:click|preventDefault={() => goto(`/edit/partner?code=${dist.code}&${writePartner}&partnerUpperRate=${WriteRate}`)}>수정</a><br/>
                                    </td>
                                </tr>
                            {/each}
                    {/if}
            </tbody>
        </table>
    </div>
</section>

    <!-- 페이지네이션 -->
    {#if partnerLists.length > 0}
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