<script lang="ts">
    import { onMount } from 'svelte';
    import { page } from '$app/state';
    import { PAGE_SIZE_OPTIONS } from '$lib/constants/searchOptions';
    import { authStore } from '$lib/stores/auth';
    import { calculatePagination } from '$lib/utils/formatters';
    import { partnerList } from '$lib/utils/writeUtils';
    import { closeModal, inserttext } from '$lib/utils/partnerListModal';
    import type { PartnerItem } from '$lib/types/write';

    let partners: PartnerItem[] = [];
    let totalCount = 0;

    export let currentPage = 1;
    export let totalPages = 1;

    export let classify: string;
    export let rate: string;
    export let userId: string;

    export let onPageChange: (page: number) => void;
    $: classify = $authStore.classify;
    $: rate = $authStore.rate;
    $: userId = $authStore.userId;

    $: pagination = calculatePagination(currentPage, totalPages);
    $: startPage = pagination.startPage;
    $: endPage = pagination.endPage;

    export let partnerUpperRate: string = '';
    

    function handlePageChange(page: number) {
        if (page !== currentPage && page >= 1 && page <= totalPages) {
            fetchPartners(page);
            onPageChange(page);
        }
    }

    async function fetchPartners(page: number) {
        try {
            const res = await partnerList(partnerUpperRate,userId, page, 10, rate, classify);
            partners = res.data;
            totalPages = res.pagination.totalPages;
            totalCount = res.pagination.totalCount;
            currentPage = res.pagination.currentPage;
        } catch (error) {
            console.error('파트너 데이터 로딩 실패:', error);
        }
    }

    onMount(() => {
        fetchPartners(currentPage);
    });

</script>


<div class="CK_modal" id="check_upper_modal" >
    <div class="modal-content">
        <span
            class="close_bt"
            id="close_modal"
            role="button"
            tabindex="0"
            on:click={closeModal}
            on:keydown={(e) => { if (e.key === 'Enter' || e.key === ' ') closeModal(); }}
            aria-label="닫기"
        >
            <span class="btn__close" title="닫기"></span>
        </span>
        
        <div id="modalBody" style="margin-top: 1.5rem;">          
             <!-- 보더박스_테이블 시작 -->
             <section class="borderbox_table">                    
                <div id="table_wrap" class="table_wrap">			
                    <table class="table_list upper_member_table" width="100%">
                        <caption>상위업체 검색 테이블</caption>
                    
                        <colgroup>                                                      
                            <col width="5%">        <!--no-->
                            <col width="15%">       <!--등급-->
                            <col width="10%">        <!--업체코드-->
                            <col width="10%">       <!--아이디-->
                            <col width="25%">       <!--업체경로-->
                            <col width="15%">       <!--상호명-->
                            <col width="8%">       <!--대표자명-->
                            <col width="10%">       <!--전화번호-->
                            <col width="5%">        <!--선택-->
                        </colgroup>

                        <thead>
                            <tr>                                                                 
                                <th>No</th>
                                <th scope="col">업체등급</th>
                                <th scope="col">업체코드</th>
                                <th scope="col">아이디</th>
                                <th scope="col">업체경로</th>
                                <th scope="col">상호명</th>
                                <th scope="col">대표자명</th>
                                <th scope="col">전화번호</th>
                                <th scope="col">선택</th>
                            </tr>
                        </thead>

                        <tbody>
                            <!-- {#each partnerData as dist, index}
                            <tr>
                                <td>{totalCount - ((page - 1) * page_size) - index}</td>
                                <td>
                                    {#if dist.rate === "p0"}
                                        관리자
                                    {:else}
                                        {dist.rate}
                                    {/if}
                                </td>
                                <td>{dist.code}</td>
                                <td>{dist.id}</td> 
                                <td>{dist.upper_name}</td>  
                                <td>{dist.name}</td>                        
                                <td>{dist.ceo_name}</td> 
                                <td>{dist.contact}</td> 
                                <td><button class="t_btn" on:click|preventDefault={() => inserttext(dist.upper_name, dist.code, dist.id, dist.rate)}>입력하기</button></td>
                            </tr>    
                            {/each} -->

                             {#each partners as dist, index}
                                <tr>
                                    <td>{totalCount - ((currentPage - 1) * 10) - index}</td>
                                    <td>{dist.rate === 'p0' ? '관리자' : dist.rate}</td>
                                    <td>{dist.code}</td>
                                    <td>{dist.id}</td>
                                    <td>{dist.upper_name}</td>
                                    <td>{dist.name}</td>
                                    <td>{dist.ceo_name}</td>
                                    <td>{dist.contact}</td>
                                    <td>
                                        <button
                                            class="t_btn"
                                            on:click|preventDefault={() => inserttext(dist.upper_name, dist.code, dist.id, dist.rate)}
                                        >
                                        입력하기
                                        </button>
                                    </td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                </div>

            </section>
            <!-- 보더박스_테이블 끝 -->       

           <!-- 페이지네이션 -->   
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
        <!-- 보더박스_페이지 네이션 끝 -->
        </div>
    </div>
</div>
