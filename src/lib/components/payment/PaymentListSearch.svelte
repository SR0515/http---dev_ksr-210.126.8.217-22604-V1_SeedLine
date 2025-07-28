<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { PAYMENT_PG_OPTIONS, PAYMENT_SEARCH_OPTIONS, PAYMENT_CANCEL_OPTIONS } from '$lib/constants/searchOptions';
    import { getTodayDate } from '$lib/utils/formatters';
    import { handleCapture } from '$lib/utils/payment/paymentUtils';

    export let startDate = '';
    export let endDate = '';
    export let pgSelect = '';
    export let searchSelect = '';
    export let cancelSelect = '';
    export let searchText = '';
    export let pageSize = 10;
    export let onSearch: () => void;
    export let onReset: () => void;
    export let onPageSizeChange: () => void;

    const today = getTodayDate();

    onMount(() => {
        if (!startDate) startDate = today;
        if (!endDate) endDate = today;
    });
</script>

<form  id="searchForm">
    <div class=" form_search">
        <div class="row mt-3">                     
            <input type="hidden" name="page" id="page"/>
            <div class="col-md-12 col-lg-7">
                <div class="search_box">
                    <ul class="calendar_wrap_list btn_wrap_list">
                        <li class="li_can"><input type="date" class="input" title="일자선택" id="start_date" name="start_date" bind:value={startDate} max={endDate}></li>                            
                        <li class="ih-lin">~</li>
                        <li class="li_can"><input type="date"  class="input" title="일자선택" id="end_date" name="end_date" bind:value={endDate} min={startDate} max={today}></li>
                    </ul>    
                </div>
            </div>

            <div class="col-md-12 col-lg-5">
                <div class="search_box_rwor">
                    <div class="search_box_rwor">
                        <select name="pg_select" class="select" bind:value={pgSelect} id="pg_select" >
                            {#each PAYMENT_PG_OPTIONS as option}
                                <option value={option.value}>{option.label}</option>
                            {/each}
                        </select>

                        <select name="search_select" class="select" bind:value={searchSelect} id="search_select" >
                            {#each PAYMENT_SEARCH_OPTIONS as option}
                                <option value={option.value}>{option.label}</option>
                            {/each}
                        </select>    
                    </div>                 
                </div>
            </div>
                                    
            <div class="col-12">
                <div class="search_box_rwo1">
                    <select name="cancel_select" class="select" bind:value={cancelSelect}  id="cancel_select">
                        {#each PAYMENT_CANCEL_OPTIONS as option}
                            <option value={option.value}>{option.label}</option>
                        {/each}
                    </select>

                    <div class="search_ba wh70">
                        <input type="search" class="input" id="search_text" name="search_text" bind:value={searchText} placeholder="검색어를 직접 입력해주세요." >
                        <button type="button" class="bt blue_bgbor" on:click={onSearch}>검색</button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="right_btn">
        <ul>      
            <li><button type="button" id="captureButton" on:click={handleCapture} style="margin-bottom: 0;">캡쳐</button> </li>       
            <li><button type="button" class="abt reset_bt" on:click={onReset}>초기화</button></li> 
            <li><button type="button" class="abt excel_bt">Excel</button></li> 
            <li> 
                <select name="page_size" class="select select_listnum" bind:value={pageSize} on:change={onPageSizeChange}>
                    <option value="{10}">10건</option>
                    <option value="{25}">25건</option>
                    <option value="{50}">50건</option>
                    <option value="{100}">100건</option>
                </select>
            </li>           
        </ul>
    </div>
</form>