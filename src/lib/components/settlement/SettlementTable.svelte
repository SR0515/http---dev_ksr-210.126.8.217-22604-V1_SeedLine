<script lang="ts">
    import type { SettlementTableConfig, SettlementTableData } from '$lib/types/settlement';

    export let config: SettlementTableConfig;
    export let data: SettlementTableData[] = [];
    export let onRowClick: (item: SettlementTableData) => void = () => {};
    export let loading: boolean = false;
</script>

<section class="borderbox_table">
    <div class="table_wrap settlement-table-container" class:settlement-loading={loading}>
        <div class="settlement-table-viewport">
            <table class="table_list {config.cssClass || ''}" width="100%">
                <caption>{config.caption}</caption>

                <!-- 동적 colgroup -->
                <colgroup>
                    {#each config.columns as column}
                        <col style="width: {column.width} !important;">
                    {/each}
                </colgroup>

                <!-- 동적 thead -->
                <thead>
                    {#each config.headers as headerRow, rowIndex}
                        <tr>
                            {#each headerRow as header}
                                <th 
                                    scope="col" 
                                    rowspan={header.rowspan || 1}
                                    colspan={header.colspan || 1}
                                    class={header.cssClass || ''}
                                >
                                    {#if header.type === 'checkbox'}
                                        <input type="checkbox" id="Allcheck" />
                                    {:else}
                                        {header.label}
                                    {/if}
                                </th>
                            {/each}
                        </tr>
                    {/each}
                </thead>

                <!-- 동적 tbody -->
                <tbody>
                    {#each data as item, index}
                        <tr>
                            {#each config.columns as column}
                                <td 
                                    class="{column.cssClass || ''} {column.clickable ? 'name_click' : ''}"
                                    data-mso-number-format={column.excelFormat || ''}
                                >
                                    {#if column.type === 'checkbox'}
                                        <input class="checkbox" type="checkbox" />
                                    {:else if column.type === 'link'}
                                        <strong 
                                            on:click={() => onRowClick(item)}
                                            on:keydown={(e) => e.key === 'Enter' && onRowClick(item)}
                                            role="button"
                                            tabindex="0"
                                        >
                                            {item[column.key] || ''}
                                        </strong>
                                    {:else if column.type === 'status'}
                                        {#if item[column.key] === "0"}
                                            <span class="before_btn">정산 예정</span>
                                        {:else if item[column.key] === "1"}
                                            <span class="before_btn green_t">정산 완료</span>
                                        {:else if item[column.key] === "2"}
                                            <span class="before_btn red_t">정산 보류</span>
                                        {/if}
                                    {:else if column.type === 'highlight'}
                                        <span class="red_t">{item[column.key] || ''}</span>
                                    {:else if column.type === 'number'}
                                        {item[column.key] || ''}
                                    {:else if column.type === 'index'}
                                        {index + 1}
                                    {:else}
                                        {item[column.key] || ''}
                                    {/if}
                                </td>
                            {/each}
                        </tr>
                    {/each}
                    
                    <!-- 데이터가 없을 때 -->
                    {#if data.length === 0}
                        <tr>
                            <td colspan={config.columns.length} class="text-center">
                                검색 결과가 없습니다.
                            </td>
                        </tr>
                    {/if}
                </tbody>
            </table>
        </div>
    </div>
</section>

<style>
    @import '$lib/styles/settlement.css';
    
    .text-center {
        text-align: center;
        padding: 20px;
        color: #666;
    }
    
    .name_click strong {
        cursor: pointer;
        color: #007bff;
        text-decoration: underline;
    }
    
    .name_click strong:hover {
        color: #0056b3;
    }
</style>