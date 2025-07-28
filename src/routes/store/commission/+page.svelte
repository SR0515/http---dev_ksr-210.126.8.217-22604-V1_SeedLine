<script lang="ts">
    import { onMount,onDestroy } from 'svelte';
    import { getStoreCommissionData, mapDataToMerchant } from '$lib/utils/store/commissionUtils';
    import type { MerchantData , CommissionSearchParams } from '$lib/types/commission';

    import { showToast } from '$lib/stores/toast';
    import { authStore } from '$lib/stores/auth';

    import LogsLoadingSpinner from '$lib/components/logs/LogsLoadingSpinner.svelte'; //로딩중
    import LogsErrorBoundary from '$lib/components/logs/LogsErrorBoundary.svelte';
    import LeftMenu from '$lib/components/LeftMenu.svelte';
    import Layout from '$lib/components/store/commission/Layout.svelte';
    import Search from '$lib/components/store/commission/Search.svelte';
    import CardWrapper from '$lib/components/store/commission/CardWrapper.svelte';
    import Pagenation from '$lib/components/store/commission/Pagenation.svelte';
    import { useCommissionData } from '$lib/hooks/useCommissionData';
    import { STORE_COMMISSION_OPTIONS } from '$lib/constants/searchOptions';

    let merchants: MerchantData[] = [];

    // 커스텀 훅 사용
    const CommissionDataStore = useCommissionData('store_name');

    // 리액티브 스토어 구독
    $: ({ loading, error, data: Lists, pagination, searchParams } = $CommissionDataStore);

    $: if (Lists) {
        merchants = Lists
        .map((item, index) => mapDataToMerchant(item, index))
        .filter((m) => m && m.status && Array.isArray(m.hierarchy));
    }

    // 검색 실행
    function handleSearch() {
        CommissionDataStore.search({
            searchSelect: searchParams.searchSelect,
            searchText: searchParams.searchText,
        });
    }

    // 검색 초기화
    function handleReset() {
        CommissionDataStore.reset();
    }

    // 페이지 크기 변경
    function handlePageSizeChange() {
        CommissionDataStore.changePageSize(pagination.pageSize);
    }
    
    // 페이지 이동
    function handlePageChange(page: number) {
        CommissionDataStore.changePage(page);
    }

    // 재시도 함수
    function handleRetry() {
        CommissionDataStore.loadData();
    }

    onMount(async () => {
        CommissionDataStore.loadData(); 
    });

    onDestroy(() => {
        CommissionDataStore.destroy();
    });
</script>

<LeftMenu />

<!-- 로딩 및 에러 상태 -->
<LogsLoadingSpinner {loading} message="데이터를 불러오는 중..." />
<LogsErrorBoundary {error} onRetry={handleRetry} />

<Layout>
    <Search 
        bind:searchSelect={searchParams.searchSelect}
        bind:searchText={searchParams.searchText}
        bind:pageSize={pagination.pageSize}
        onSearch={handleSearch}
        onReset={handleReset}
        onPageSizeChange={handlePageSizeChange}
        searchOptions={STORE_COMMISSION_OPTIONS}
    />

    <CardWrapper {merchants} />

    <!-- 페이지네이션 -->
    {#if Lists.length > 0}
        <Pagenation
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
        />
    {/if}
</Layout>
