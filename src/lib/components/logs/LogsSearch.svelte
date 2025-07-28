<script lang="ts">
    import { getTodayDate } from '$lib/utils/formatters';
    
    export let searchSelect = 'id';
    export let searchText = '';
    export let typeSelect = '';
    export let startDate = '';
    export let endDate = '';
    export let pageSize = 10;
    export let onSearch: () => void;
    export let onReset: () => void;
    export let onPageSizeChange: () => void;
    export let searchOptions = [
        { value: 'id', label: 'ID' },
        { value: 'name', label: '사용자명' },
        { value: 'ip', label: 'IP' }
    ];
    export let showTypeSelect = true;
    
    const today = getTodayDate();
</script>

<form id="searchForm">
    <div class="form_search">
        <div class="row mt-3">
            <!-- 날짜 선택 -->
            <div class="col-12 col-md-12 col-lg-4">
                <div class="search_box">
                    <ul class="calendar_wrap_list btn_wrap_list">
                        <li class="li_can">
                            <input 
                                type="date" 
                                class="input" 
                                bind:value={startDate} 
                                max={endDate || today}
                                title="시작일 선택"
                            />
                        </li>
                        <li class="ih-lin">~</li>
                        <li class="li_can">
                            <input 
                                type="date" 
                                class="input" 
                                bind:value={endDate} 
                                min={startDate}
                                max={today}
                                title="종료일 선택"
                            />
                        </li>
                    </ul>    
                </div>
            </div>
            
            <!-- 검색 옵션 -->
            <div class="col-12 col-md-12 col-lg-8">
                <div class="row">
                    <!-- 검색 조건 -->
                    <div class="col-6 col-md-4 col-lg-3">
                        <div class="search_box">
                            <select bind:value={searchSelect} class="select mt_8px mr_10" style="width: 100%; min-width: 150px; padding: 8px 30px 8px 8px; border: 1px solid #ddd; border-radius: 4px; background: white url('data:image/svg+xml;charset=US-ASCII,<svg xmlns=&quot;http://www.w3.org/2000/svg&quot; width=&quot;16&quot; height=&quot;16&quot; viewBox=&quot;0 0 16 16&quot;><path fill=&quot;%23333&quot; d=&quot;M8 10l4-4H4z&quot;/></svg>') no-repeat right 8px center; background-size: 16px; appearance: none; -webkit-appearance: none; -moz-appearance: none; position: relative; z-index: 1;">
                                {#each searchOptions as option}
                                    <option value={option.value}>{option.label}</option>
                                {/each}
                            </select>
                        </div>
                    </div>
                    
                    <!-- 타입 선택 -->
                    {#if showTypeSelect}
                        <div class="col-6 col-md-4 col-lg-3">
                            <div class="search_box">
                                <select bind:value={typeSelect} class="select mt_8px mr_10" style="width: 100%; min-width: 150px; padding: 8px 30px 8px 8px; border: 1px solid #ddd; border-radius: 4px; background: white url('data:image/svg+xml;charset=US-ASCII,<svg xmlns=&quot;http://www.w3.org/2000/svg&quot; width=&quot;16&quot; height=&quot;16&quot; viewBox=&quot;0 0 16 16&quot;><path fill=&quot;%23333&quot; d=&quot;M8 10l4-4H4z&quot;/></svg>') no-repeat right 8px center; background-size: 16px; appearance: none; -webkit-appearance: none; -moz-appearance: none; position: relative; z-index: 1;">
                                    <option value="">전체</option>
                                    <option value="0">관리자</option>
                                    <option value="1">파트너</option>
                                    <option value="2">가맹점</option>
                                </select>
                            </div>
                        </div>
                    {/if}
                    
                    <!-- 검색 입력 -->
                    <div class="col-12 col-md-4 col-lg-{showTypeSelect ? '6' : '9'}">
                        <div class="search_box">
                            <div class="search_ba wh70" style="display: flex; gap: 8px;">
                                <input 
                                    type="search" 
                                    class="input mt_8px" 
                                    bind:value={searchText} 
                                    placeholder="검색어를 직접 입력해주세요."
                                    style="flex: 1; padding: 8px; border: 1px solid #ddd; border-radius: 4px;"
                                    on:keydown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            onSearch();
                                        }
                                    }}
                                />
                                <button 
                                    type="button" 
                                    class="bt blue_bgbor mt_8px" 
                                    on:click={onSearch}
                                    style="padding: 8px 16px; background: #000; color: white; border: 1px solid #000; border-radius: 25px; cursor: pointer; white-space: nowrap;"
                                >
                                    검색
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <!-- 초기화 및 페이지 크기 선택 -->
    <div class="right_btn">
        <ul>
            <li>
                <button 
                    type="button" 
                    class="abt reset_bt" 
                    on:click={onReset}
                    style="text-decoration: none; color: white; border: 1px solid #555; background: #555; cursor: pointer; padding: 0.5rem 1rem; border-radius: 25px;"
                >
                    초기화
                </button>
            </li>
            <li>
                <select bind:value={pageSize} class="select select_listnum" on:change={onPageSizeChange} style="width: 100%; min-width: 80px; padding: 8px 30px 8px 8px; border: 1px solid #ddd; border-radius: 4px; background: white url('data:image/svg+xml;charset=US-ASCII,<svg xmlns=&quot;http://www.w3.org/2000/svg&quot; width=&quot;16&quot; height=&quot;16&quot; viewBox=&quot;0 0 16 16&quot;><path fill=&quot;%23333&quot; d=&quot;M8 10l4-4H4z&quot;/></svg>') no-repeat right 8px center; background-size: 16px; appearance: none; -webkit-appearance: none; -moz-appearance: none; position: relative; z-index: 1;">
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
    /* 드롭다운 짤림 현상 해결 */
    .form_search, .right_btn {
        overflow: visible !important;
    }
    
    .search_box {
        position: relative;
        z-index: 10;
        overflow: visible !important;
    }
    
    .search_box select {
        position: relative;
        z-index: 20;
        overflow: visible !important;
    }
    
    /* 부모 컨테이너들의 overflow 오버라이드 */
    #searchForm {
        overflow: visible !important;
    }
    
    .row {
        overflow: visible !important;
    }
    
    .col-12, .col-md-12, .col-lg-4, .col-lg-8, .col-6, .col-md-4, .col-lg-3, .col-lg-6 {
        overflow: visible !important;
    }
    
    /* 셀렉트 드롭다운 옵션 스타일링 */
    select option {
        padding: 8px 12px;
        border: 1px solid #ddd;
        background: white;
        color: #333;
        min-height: 40px;
    }
    
    select option:hover {
        background: #f8f9fa;
    }
    
    select option:checked {
        background: #4e73df;
        color: white;
    }
    
    /* 날짜 입력 필드 스타일링 */
    input[type="date"] {
        position: relative;
        z-index: 5;
        overflow: visible !important;
    }
    
    input[type="date"]::-webkit-calendar-picker-indicator {
        position: relative;
        z-index: 10;
        cursor: pointer;
    }
    
    /* 셀렉트 박스 드롭다운 레이어 확장 */
    select {
        box-sizing: border-box;
    }
    
    select:focus {
        z-index: 100 !important;
        position: relative;
    }
</style>