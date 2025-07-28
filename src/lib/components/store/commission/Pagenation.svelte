<script lang="ts">
    import { calculatePagination } from '$lib/utils/formatters';
    
    export let currentPage = 1;
    export let totalPages = 1;
    export let onPageChange: (page: number) => void;
    
    $: pagination = calculatePagination(currentPage, totalPages);
    $: startPage = pagination.startPage;
    $: endPage = pagination.endPage;
    
    function handlePageChange(page: number) {
        if (page !== currentPage && page >= 1 && page <= totalPages) {
            onPageChange(page);
        }
    }
</script>

<section class="borderbox_pageing">
    <div class="pageing">
        <div class="page_navgation">
            <!-- 첫 페이지 -->
            <button 
                type="button"
                class="arrow_bt {currentPage === 1 ? 'disabled' : ''}"
                on:click={() => handlePageChange(1)}
                title="첫 페이지"
                disabled={currentPage === 1}
                style="background: none; border: none; text-decoration: none; cursor: {currentPage === 1 ? 'default' : 'pointer'}; opacity: {currentPage === 1 ? '0.5' : '1'};"
            >
                <img 
                    class="arrow_icon chevron-double-left" 
                    src="/img/icon/chevron-double-left.svg" 
                    alt="첫 페이지"
                />
            </button>
            
            <!-- 이전 페이지 -->
            <button 
                type="button"
                class="arrow_bt {currentPage === 1 ? 'disabled' : ''}"
                on:click={() => handlePageChange(currentPage - 1)}
                title="이전 페이지"
                disabled={currentPage === 1}
                style="background: none; border: none; text-decoration: none; cursor: {currentPage === 1 ? 'default' : 'pointer'}; opacity: {currentPage === 1 ? '0.5' : '1'};"
            >
                <img 
                    class="arrow_icon chevron-left" 
                    src="/img/icon/chevron-left.svg" 
                    alt="이전 페이지"
                />
            </button>
            
            <!-- 페이지 번호들 -->
            {#each Array(endPage - startPage + 1) as _, i}
                {@const pageNum = startPage + i}
                <button 
                    type="button"
                    class="{currentPage === pageNum ? 'on' : ''}"
                    on:click={() => handlePageChange(pageNum)}
                    title="{pageNum}페이지"
                    style="background: none; border: 1px solid #ddd; color: {currentPage === pageNum ? '#971523' : '#333'}; text-decoration: none; cursor: pointer; padding: 8px; margin: 0 2px; border-radius: 50%; width: 40px; height: 40px; display: inline-flex; align-items: center; justify-content: center; font-weight: {currentPage === pageNum ? 'bold' : 'normal'};"
                >
                    {pageNum}
                </button>
            {/each}
            
            <!-- 다음 페이지 -->
            <button 
                type="button"
                class="arrow_bt {currentPage === totalPages ? 'disabled' : ''}"
                on:click={() => handlePageChange(currentPage + 1)}
                title="다음 페이지"
                disabled={currentPage === totalPages}
                style="background: none; border: none; text-decoration: none; cursor: {currentPage === totalPages ? 'default' : 'pointer'}; opacity: {currentPage === totalPages ? '0.5' : '1'};"
            >
                <img 
                    class="arrow_icon chevron-right" 
                    src="/img/icon/chevron-right.svg" 
                    alt="다음 페이지"
                />
            </button>
            
            <!-- 마지막 페이지 -->
            <button 
                type="button"
                class="arrow_bt {currentPage === totalPages ? 'disabled' : ''}"
                on:click={() => handlePageChange(totalPages)}
                title="마지막 페이지"
                disabled={currentPage === totalPages}
                style="background: none; border: none; text-decoration: none; cursor: {currentPage === totalPages ? 'default' : 'pointer'}; opacity: {currentPage === totalPages ? '0.5' : '1'};"
            >
                <img 
                    class="arrow_icon chevron-double-right" 
                    src="/img/icon/chevron-double-right.svg" 
                    alt="마지막 페이지"
                />
            </button>
        </div>
    </div>
</section>