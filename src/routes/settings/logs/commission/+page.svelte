<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import LogsSearch from '$lib/components/logs/LogsSearch.svelte';
    import LogsPagination from '$lib/components/logs/LogsPagination.svelte';
    import LogsLoadingSpinner from '$lib/components/logs/LogsLoadingSpinner.svelte';
    import LogsErrorBoundary from '$lib/components/logs/LogsErrorBoundary.svelte';
    import { 
        fetchLogData, 
        validateDateRange
    } from '$lib/utils/logsUtils';
    import { formatNumber } from '$lib/utils/formatters';
    import { COMMISSION_SEARCH_OPTIONS } from '$lib/constants/searchOptions';
    import type { CommissionLogData } from '$lib/types/logs';
    
    // 상태 관리
    let loading = false;
    let error: string | null = null;
    let logLists: CommissionLogData[] = [];
    let currentPage = 1;
    let totalPages = 1;
    let totalCount = 0;
    let pageSize = 10;
    
    // 검색 상태
    let searchSelect = 'store_name';
    let searchText = '';
    let startDate = '';
    let endDate = '';
    
    // 포매터 함수들 (재생성 방지)
    const formatters = {
        formatNumber
    };
    
    // 정리 함수들
    let mounted = true;
    
    // 데이터 조회
    async function loadLogData() {
        if (!mounted) return;
        
        if (!validateDateRange(startDate, endDate)) {
            return;
        }
        
        try {
            loading = true;
            error = null;
            
            const result = await fetchLogData('S_commission_log', currentPage, pageSize, {
                searchSelect,
                searchText,
                startDate,
                endDate
            });
            
            if (mounted) {
                logLists = result.data;
                totalCount = result.pagination.totalCount;
                totalPages = Math.ceil(totalCount / pageSize);
            }
        } catch (err) {
            if (mounted) {
                const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
                error = `가맹점 수수료 수정 로그 데이터를 불러오는데 실패했습니다: ${errorMessage}`;
                console.error('로그 데이터 로드 실패:', err);
            }
        } finally {
            if (mounted) {
                loading = false;
            }
        }
    }
    
    // 검색 실행
    function handleSearch() {
        currentPage = 1;
        loadLogData();
    }
    
    // 검색 초기화
    function handleReset() {
        searchText = '';
        searchSelect = 'store_name';
        startDate = '';
        endDate = '';
        currentPage = 1;
        loadLogData();
    }
    
    // 페이지 크기 변경
    function handlePageSizeChange() {
        currentPage = 1;
        loadLogData();
    }
    
    // 페이지 이동
    function handlePageChange(page: number) {
        currentPage = page;
        loadLogData();
    }
    
    // 재시도 함수
    function handleRetry() {
        loadLogData();
    }
    
    onMount(() => {
        loadLogData();
    });
    
    onDestroy(() => {
        mounted = false;
    });
</script>


<!-- 검색 영역 -->
<LogsSearch 
    bind:searchSelect
    bind:searchText
    bind:startDate
    bind:endDate
    bind:pageSize
    onSearch={handleSearch}
    onReset={handleReset}
    onPageSizeChange={handlePageSizeChange}
    searchOptions={COMMISSION_SEARCH_OPTIONS}
    showTypeSelect={false}
/>

<!-- 로딩 및 에러 상태 -->
<LogsLoadingSpinner {loading} message="가맹점 수수료 수정 로그 데이터를 불러오는 중..." />
<LogsErrorBoundary {error} onRetry={handleRetry} />

<!-- 테이블 영역 -->
<section class="borderbox_table">
    <div id="table_wrap" class="table_wrap">
        <table class="table_list" width="100%">
            <caption>가맹점 정산수수료 수정 로그 테이블</caption>
            
            <colgroup>
                <col style="width: 3.67% !important;">
                <col style="width: 6.67% !important;">
                <col style="width: 6.67% !important;">
                <col style="width: 6.67% !important;">
                <col style="width: 8.67% !important;">
                <col style="width: 8.67% !important;">
                <col style="width: 9.67% !important;">
                <col style="width: 9.67% !important;">
                <col style="width: 6.67% !important;">
                <col style="width: 6.67% !important;">
                <col style="width: 6.67% !important;">
                <col style="width: 6.67% !important;">
                <col style="width: 14% !important;">
            </colgroup>
            
            <thead>
                <tr>
                    <th>No</th>
                    <th>가맹점아이디</th>
                    <th>가맹점명</th>
                    <th>TID</th>
                    <th>본사 수수료 변동(%)</th>
                    <th>대행사 수수료 변동(%)</th>
                    <th>에이전시 수수료 변동(%)</th>
                    <th>가맹점 수수료 변동(%)</th>
                    <th>수정 관리자명</th>
                    <th>IP</th>
                    <th>브라우저</th>
                    <th>URL</th>
                    <th>처리날짜</th>
                </tr>
            </thead>
            
            <tbody>
                {#if logLists.length === 0}
                    <tr>
                        <td colspan="13" class="no_data">등록된 데이터가 없습니다.</td>
                    </tr>
                {:else}
                    {#each logLists as log, index}
                        <tr>
                            <td>{totalCount - ((currentPage - 1) * pageSize) - index}</td>
                            <td>{log.store_id || ''}</td>
                            <td>{log.store_name || ''}</td>
                            <td>{log.store_catid || ''}</td>
                            <td>{log.pre_prime_AC || ''}% → <span style="color: #be0000;">{log.to_prime_AC || ''}%</span></td>
                            <td>{log.pre_prime_BC || ''}% → <span style="color: #be0000;">{log.to_prime_BC || ''}%</span></td>
                            <td>{log.pre_prime_CC || ''}% → <span style="color: #be0000;">{log.to_prime_CC || ''}%</span></td>
                            <td>{log.pre_prime_C || ''}% → <span style="color: #be0000;">{log.to_prime_C || ''}%</span></td>
                            <td>{log.editor_name || ''}</td>
                            <td>{log.editor_ip || ''}</td>
                            <td>{log.editor_browser || ''}</td>
                            <td>{log.url || ''}</td>
                            <td>{log.edit_date || ''}</td>
                        </tr>
                    {/each}
                {/if}
            </tbody>
        </table>
    </div>
</section>

<!-- 목록으로 버튼 -->
<!-- <div class="list_box" style="text-align: center; padding: 20px 0;">
    <button 
        class="defer_btn" 
        type="button" 
        on:click={() => window.history.back()}
        style="background: #555; color: white; border: 1px solid #555; padding: 10px 20px; border-radius: 25px; cursor: pointer; font-size: 14px; outline: none; transition: all 0.2s ease;"
        on:mouseenter={(e) => {
            e.target.style.background = '#333';
            e.target.style.borderColor = '#333';
        }}
        on:mouseleave={(e) => {
            e.target.style.background = '#555';
            e.target.style.borderColor = '#555';
        }}
    >
        목록으로
    </button>
</div> -->

<!-- 페이지네이션 -->
<LogsPagination 
    {currentPage}
    {totalPages}
    onPageChange={handlePageChange}
/>

<style>
    .no_data {
        text-align: center;
        padding: 2rem;
        color: #666;
    }
</style>