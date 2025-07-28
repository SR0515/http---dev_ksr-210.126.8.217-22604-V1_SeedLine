<script lang="ts">
    import { onMount } from 'svelte';
    import LeftMenu from '$lib/components/LeftMenu.svelte';
    import Layout from '$lib/components/payment/Layout.svelte';
    import Search from '$lib/components/payment/Search.svelte';
    import { PAYMENT_DUPLICATE_OPTIONS } from '$lib/constants/searchOptions';

    // 검색 실행
    function handleSearch() {
        // listData.search({
        //     searchSelect: searchParams.searchSelect,
        //     searchText: searchParams.searchText,
        // });
    }
    
    // 검색 초기화
    function handleReset() {
        // listData.reset();
    }
    
    // 페이지 크기 변경
    function handlePageSizeChange() {
        // listData.changePageSize(pagination.pageSize);
    }
    
    // 페이지 이동
    function handlePageChange(page: number) {
        // listData.changePage(page);
    }
    
    // 재시도 함수
    function handleRetry() {
        // listData.loadData();
    }
</script>

<LeftMenu />
<Layout>
    <Search
        onSearch={handleSearch}
        onReset={handleReset}
        onPageSizeChange={handlePageSizeChange}
        searchOptions={PAYMENT_DUPLICATE_OPTIONS}
    />
</Layout>