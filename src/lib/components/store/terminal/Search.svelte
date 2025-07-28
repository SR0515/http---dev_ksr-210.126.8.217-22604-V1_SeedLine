<script lang="ts">
    import type {Option} from '$lib/constants/searchOptions';
    export let searchSelect = 'T_catId';
    export let searchText = '';
    export let pageSize = 10;
    export let onSearch: () => void;
    export let onReset: () => void;
    export let onPageSizeChange: () => void;
    export let searchOptions: Option[] = [];
</script>

<form  id="searchForm" >
    <div class="row form_search">
        <div class="col-12 mt-3">             
            <div class="">
                <input type="hidden" name="page" id="page"/>
                <div class="">                        
                    <div class="search_box">
                        <select id="search_select" name="search_select"  bind:value={searchSelect} class="select S_select_wh mt_0">
                            {#each searchOptions as option}
                                <option value={option.value}>{option.label}</option>
                            {/each}
                        </select>
                
                        <div class="search_ba">
                            <input 
                                type="search" 
                                class="input mt_0" 
                                id="search_text"
                                name="search_text" 
                                bind:value={searchText}  
                                placeholder="검색어를 직접 입력해주세요." 
                                on:keydown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        onSearch();
                                    }
                                }}
                            />
                            <button 
                                type="button" 
                                class="bt blue_bgbor"
                                on:click={onSearch}
                            >
                                검색
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
        
    <div class="right_btn">
        <ul>             
            <li><button type="button" class="abt reset_bt " on:click={onReset}>초기화</button></li> 
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