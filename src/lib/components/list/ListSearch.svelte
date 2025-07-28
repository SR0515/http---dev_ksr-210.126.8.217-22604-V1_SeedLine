<script lang="ts">
    import { navigateToPartner } from '$lib/utils/menuUtils';
    import { getTodayDate } from '$lib/utils/formatters';
    import { goto } from '$app/navigation';
    import type { Option } from '$lib/constants/searchOptions';
    import { listPage } from '$lib/utils/listUtils'
    import { onMount } from 'svelte';

    export let WriteRate:string = '';

    export let writePartner: {} = "";
    export let listType = '';
    $: writeType = listPage(listType, writePartner, WriteRate);
    export let searchSelect = '';
    export let searchText = '';
    export let startDate = '';
    export let endDate = '';
    export let pageSize = 10;
    export let onSearch: () => void;
    export let onReset: () => void;
    export let onPageSizeChange: () => void;
    export let searchOptions:  Option[];

    const today = getTodayDate();

</script>
<form id="searchForm">
    <div class="form_search">

        <div class="row mt-3">
            <div class="col-md-12 col-lg-6 ">
            
                <div class="search_box">
                    <ul class="calendar_wrap_list btn_wrap_list">
                        <li class="li_can"><input type="date" class="input" title="일자선택" id="start_date" name="start_date" bind:value={startDate} max={endDate}></li>
                        <li class="ih-lin">~</li>
                        <li class="li_can"><input type="date"  class="input" title="일자선택" id="end_date" name="end_date" bind:value={endDate} min={startDate} max={today}></li>
                    </ul>    
                </div>
            </div>
                        
            <div class="col-md-12 col-lg-6">   
                <div class="row">
                    <div class="col-12">
                        <div class="search_box">
                            <select id="search_select" name="search_select" bind:value={searchSelect} class="select" >
                                {#each searchOptions as option}
                                    <option value={option.value}>{option.label}</option>
                                {/each}
                            </select>
                
                            <div class="search_ba wh70">
                                <input type="search" class="input" id="search_text" name="search_text" bind:value={searchText} placeholder="검색어를 직접 입력해주세요." >
                                <button type="button" class="bt blue_bgbor mt_8px" id="search_btn" on:click={onSearch}>검색</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="right_btn">
        <ul>   
            <!-- {#if classify === "0" || rate === "p1"}        -->
                <li><button type="button" class="abt  signup_bt" on:click|preventDefault={() => goto(writeType)}>등록하기</button></li>
            <!-- {/if} -->
            <li><button type="button" class="abt reset_bt " on:click={onReset} >초기화</button></li> 
            <li><button type="button" class="abt excel_bt" >Excel</button></li> 
            <li> 
                <select name="page_size" class="select select_listnum" bind:value={pageSize}  on:change={onPageSizeChange}>
                    <option value="{10}">10건</option>
                    <option value="{25}">25건</option>
                    <option value="{50}">50건</option>
                    <option value="{100}">100건</option>
                </select>
            </li>           
        </ul>
    </div>
</form>