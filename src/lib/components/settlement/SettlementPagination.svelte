<script lang="ts">
    import type { PaginationData } from '$lib/types/settlement';
    import { debounce } from '$lib/utils/settlement';

    export let pagination: PaginationData;
    export let onPageChange: (page: number) => void;
    export let maxVisiblePages: number = 10;

    // 디바운스된 페이지 변경 함수
    const debouncedPageChange = debounce(onPageChange, 100);

    // 현재 페이지 그룹의 시작과 끝 계산
    $: currentGroup = Math.floor((pagination.currentPage - 1) / maxVisiblePages);
    $: startPage = currentGroup * maxVisiblePages + 1;
    $: endPage = Math.min(startPage + maxVisiblePages - 1, pagination.totalPages);
    $: visiblePages = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);

    // 이전/다음 그룹으로 이동 가능 여부
    $: canGoPrevGroup = startPage > 1;
    $: canGoNextGroup = endPage < pagination.totalPages;

    function handlePageClick(page: number) {
        if (page !== pagination.currentPage && page >= 1 && page <= pagination.totalPages) {
            debouncedPageChange(page);
        }
    }

    function handleFirstPage() {
        handlePageClick(1);
    }

    function handleLastPage() {
        handlePageClick(pagination.totalPages);
    }

    function handlePrevGroup() {
        if (canGoPrevGroup) {
            handlePageClick(startPage - 1);
        }
    }

    function handleNextGroup() {
        if (canGoNextGroup) {
            handlePageClick(endPage + 1);
        }
    }
</script>

<section class="borderbox_pageing">
    <div class="pageing">
        <div class="page_navgation">
            <!-- 첫 페이지 이동 -->
            {#if pagination.currentPage > 1}
                <button
                    type="button"
                    class="settlement-btn on arrow_bt"
                    on:click={handleFirstPage}
                    aria-label="첫 페이지"
                >
                    <img 
                        class="arrow_icon chevron-double-left" 
                        src="/img/icon/chevron-double-left.svg" 
                        alt="첫 페이지"
                    >
                </button>
            {/if}

            <!-- 이전 그룹 이동 -->
            {#if canGoPrevGroup}
                <button
                    type="button"
                    class="settlement-btn on arrow_bt"
                    on:click={handlePrevGroup}
                    aria-label="이전 그룹"
                >
                    <img 
                        class="arrow_icon chevron-left" 
                        src="/img/icon/chevron-left.svg" 
                        alt="이전 그룹"
                    >
                </button>
            {/if}

            <!-- 페이지 번호 -->
            {#each visiblePages as pageNum}
                <button
                    type="button"
                    class="settlement-btn {pagination.currentPage === pageNum ? 'on' : ''}"
                    on:click={() => handlePageClick(pageNum)}
                    aria-label="페이지 {pageNum}"
                    aria-current={pagination.currentPage === pageNum ? 'page' : undefined}
                >
                    {pageNum}
                </button>
            {/each}

            <!-- 다음 그룹 이동 -->
            {#if canGoNextGroup}
                <button
                    type="button"
                    class="settlement-btn on arrow_bt"
                    on:click={handleNextGroup}
                    aria-label="다음 그룹"
                >
                    <img 
                        class="arrow_icon chevron-right" 
                        src="/img/icon/chevron-right.svg" 
                        alt="다음 그룹"
                    >
                </button>
            {/if}

            <!-- 마지막 페이지 이동 -->
            {#if pagination.currentPage < pagination.totalPages}
                <button
                    type="button"
                    class="settlement-btn on arrow_bt"
                    on:click={handleLastPage}
                    aria-label="마지막 페이지"
                >
                    <img 
                        class="arrow_icon chevron-double-right" 
                        src="/img/icon/chevron-double-right.svg" 
                        alt="마지막 페이지"
                    >
                </button>
            {/if}
        </div>
    </div>
</section>

<style>
    @import '$lib/styles/settlement.css';
    
    .page_navgation {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 5px;
        flex-wrap: wrap;
    }
    
    .page_navgation button {
        border: none;
        background: none;
        padding: 8px 12px;
        cursor: pointer;
        text-decoration: none;
        color: #333;
        border-radius: 4px;
        transition: all 0.2s ease;
        min-width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .page_navgation button:hover {
        background-color: #f8f9fa;
    }
    
    .page_navgation button.on {
        background-color: #007bff;
        color: white;
    }
    
    .page_navgation button.on:hover {
        background-color: #0056b3;
    }
    
    .page_navgation button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
    
    .arrow_icon {
        width: 16px;
        height: 16px;
    }
    
    /* 반응형 */
    @media (max-width: 768px) {
        .page_navgation {
            gap: 3px;
        }
        
        .page_navgation button {
            min-width: 32px;
            height: 32px;
            padding: 4px 8px;
            font-size: 14px;
        }
    }
</style>