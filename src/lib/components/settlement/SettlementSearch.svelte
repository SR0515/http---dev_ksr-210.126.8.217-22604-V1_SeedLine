<script lang="ts">
    import { getTodayDate } from '$lib/utils/formatters';
    import type { SettlementSearchData } from '$lib/types/settlement';
    import type { SettlementSearchConfig } from '$lib/types/settlement';

    export let config: SettlementSearchConfig;
    export let searchData: SettlementSearchData = {
        startDate: '',
        endDate: '',
        searchSelect: '',
        searchText: '',
        pageSize: 10
    };
    export let onSearch: (data: SettlementSearchData) => void;
    export let onReset: () => void;
    export let onPageSizeChange: (size: number) => void;
    
    const today = getTodayDate();
    
    // 검색 데이터 초기화
    let {
        startDate = '',
        endDate = '',
        searchSelect = config.searchOptions?.[0]?.value || '',
        searchText = '',
        pageSize = 10
    } = searchData;

    // 반응형 변수
    $: searchData = {
        startDate,
        endDate,
        searchSelect,
        searchText,
        pageSize
    };

    function handleSearch() {
        onSearch(searchData);
    }

    function handleReset() {
        startDate = '';
        endDate = '';
        searchSelect = config.searchOptions?.[0]?.value || '';
        searchText = '';
        pageSize = 10;
        onReset();
    }

    function handlePageSizeChange() {
        onPageSizeChange(pageSize);
    }
</script>

<form class="settlement-form">
    <div class="form_search settlement-form-search">
        <div class="row mt-3 settlement-row">
            <input type="hidden" name="page" />
            <input type="hidden" name="startDate" value={startDate} />
            <input type="hidden" name="endDate" value={endDate} />
            <input type="hidden" name="searchSelect" value={searchSelect} />
            <input type="hidden" name="searchText" value={searchText} />
            <input type="hidden" name="pageSize" value={pageSize} />
            
            <!-- 날짜 검색 (모든 타입에서 공통) -->
            <div class="col-12 {config.type === 'transfer' ? 'col-lg-6' : ''} settlement-col">
                <div class="search_box settlement-search-box {config.type !== 'transfer' ? 'left_search' : ''}">
                    <ul class="calendar_wrap_list btn_wrap_list">
                        <li class="li_can">
                            <input 
                                type="date" 
                                class="input settlement-date-input" 
                                title="일자선택" 
                                bind:value={startDate} 
                                max={endDate || today}
                            />
                        </li>
                        <li class="ih-lin">~</li>
                        <li class="li_can">
                            <input 
                                type="date" 
                                class="input settlement-date-input" 
                                title="일자선택" 
                                bind:value={endDate} 
                                min={startDate}
                                max={today}
                            />
                        </li>
                        
                        <!-- 단순 검색 타입 (store, partner)의 경우 검색 버튼도 여기에 -->
                        {#if config.type === 'simple'}
                            <li class="btn_list_b">
                                <button 
                                    type="button" 
                                    class="bt blue_bgbor settlement-search-btn" 
                                    on:click={handleSearch}
                                >
                                    검색
                                </button>
                            </li>
                        {/if}
                    </ul>
                    
                    <!-- 단순 검색 타입의 경우 검색 버튼을 ul 밖에 -->
                    {#if config.type === 'simple'}
                        <div class="btn_list_b">
                            <button 
                                type="button" 
                                class="bt blue_bgbor settlement-search-btn" 
                                on:click={handleSearch}
                            >
                                검색
                            </button>
                        </div>
                    {/if}
                </div>
            </div>

            <!-- 복합 검색 (transfer 타입) -->
            {#if config.type === 'transfer' && config.searchOptions}
                <div class="col-12 col-lg-6 settlement-col">
                    <div class="row">
                        <div class="col-12">
                            <div class="search_box settlement-search-box">
                                <select 
                                    bind:value={searchSelect} 
                                    class="select settlement-select"
                                >
                                    <option value="">전체</option>
                                    {#each config.searchOptions as option}
                                        <option value={option.value}>{option.label}</option>
                                    {/each}
                                </select>
                
                                <div class="search_ba settlement-search-container">
                                    <input 
                                        type="search" 
                                        class="input settlement-search-input" 
                                        bind:value={searchText} 
                                        placeholder="검색어를 직접 입력해주세요."
                                    />
                                    <button 
                                        type="button" 
                                        class="bt blue_bgbor mt_8px settlement-search-btn" 
                                        on:click={handleSearch}
                                    >
                                        검색
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            {/if}
        </div>
    </div>

    <!-- 우측 버튼 -->
    <div class="right_btn settlement-right-btn">
        <ul>
            <li>
                <button 
                    type="button" 
                    class="abt reset_bt settlement-reset-btn" 
                    on:click={handleReset}
                    alt="초기화" 
                    title="초기화"
                >
                    초기화
                </button>
            </li>
            <li>
                <select 
                    bind:value={pageSize} 
                    class="select select_listnum settlement-select-listnum" 
                    on:change={handlePageSizeChange}
                >
                    <option value={10}>10건</option>
                    <option value={25}>25건</option>
                    <option value={50}>50건</option>
                    <option value={100}>100건</option>
                </select>
            </li>
        </ul>
    </div>
</form>

<style>
    @import '$lib/styles/settlement.css';
</style>