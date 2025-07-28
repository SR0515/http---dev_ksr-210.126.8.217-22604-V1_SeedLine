<script lang="ts">
    import { onMount } from 'svelte';
    import type { MerchantData} from '$lib/types/commission';
    import { formatCommission, saveCommissions, markAsModified, updatePathColor, formatInputValue, setupPathClickEvents} from '$lib/utils/store/commissionUtils';
    
    export let merchant: MerchantData;
    export let index: number;
    export let merchants: MerchantData[];

    const truncateName = (name: string) => name.length > 7 ? name.substring(0, 7) : name;
    const hierarchyLevels = merchant.hierarchy.length - 1;

    const pathRows = merchant.hierarchy.reduce((rows: string[][], level, i) => {
        const rowIdx = Math.floor(i / 4);
        if (!rows[rowIdx]) rows[rowIdx] = [];

        const displayName = truncateName(level.name);
        const isZeroCommission = level.commission === 0 || level.commission === 0.0;
        const isLast = i === merchant.hierarchy.length - 1 && level.name === merchant.name;

        const pathItem = `
            <span class="path-item ${isZeroCommission ? 'zero-commission' : ''}"
                ${isLast ? `data-merchant=\"${merchant.id}\"` : `data-index=\"${i}\"`}
                title="${level.name} : ${formatCommission(level.commission)}%">
                ${displayName}
            </span>
        `;
        if (i % 4 !== 0) rows[rowIdx].push('<span class="path-arrow">▶</span>');
            rows[rowIdx].push(pathItem);
        return rows;
    }, []);

    onMount(() => {
        setupPathClickEvents();
    });
</script>

<div
  class="merchant-card {merchant.status} {merchant.hasCommission ? '' : 'no-commission '}"
  data-merchant-id={merchant.id}
  style="animation-delay: {index * 0.1}s"
>
    <div class="status-bar"></div>
    {#if !merchant.hasCommission}
        <div class="commission-required-banner">
            <i class="fas fa-exclamation-triangle"></i> 
            수수료 설정 필요
        </div>
    {/if}

    <div class="card-top-section">
        <div class="card-top-row">
            <div class="card-meta">
                <span class="card-number">No.{index + 1}</span>
                <span class="merchant-id">ID: {merchant.id}</span>
            </div>

            <button
                class="commission-save-btn {merchant.hasCommission ? '' : 'pulse-animation'} {merchant.status === 'inactive' ? 'disabled' : ''}"
                id="save-{merchant.id}"
                on:click={() => saveCommissions(merchant.id, merchants)}
                title="저장"
                disabled={merchant.status === 'inactive'}
            >
                <i class="fas fa-save"></i>
                <span class="save-text">저장</span>
            </button>
        </div>

        <div class="card-main-row">
            <div style="display: flex; align-items: center;">
                <h3 class="merchant-name">{merchant.name}</h3>
                {#if merchant.status === 'inactive'}
                    <span class="inactive-badge"><i class="fas fa-ban"></i> 비활성</span>
                {/if}

                {#if !merchant.hasCommission}
                    <span class="no-commission-badge"><i class="fas fa-exclamation-triangle"></i> 미설정</span>
                {/if}
            </div>
            <div class="total-commission" id="total-{merchant.id}">
                <i class="fas fa-percentage"></i>
                총 <span class="total-value">{merchant.totalCommission}</span>%
            </div>
        </div>

        <div class="hierarchy-path-container">
            <div class="hierarchy-path">
                {@html pathRows.map(row => `<div class='path-row'>${row.join('')}</div>`).join('')}
            </div>
            <div class="hierarchy-level-count">{hierarchyLevels}단계</div>
        </div>
    </div>

    <div class="commission-wrapper">
        <div class="scroll-indicator left"><i class="fas fa-chevron-left"></i></div>
        <div class="scroll-indicator right"><i class="fas fa-chevron-right"></i></div>

        <div class="commission-section" data-merchant-id={merchant.id}>
            <div class="commission-grid">
                {#each merchant.hierarchy as level, idx (idx)}
                    {#if idx !== merchant.hierarchy.length - 1 || level.name !== merchant.name}
                        <div class="commission-item">
                            <div class="commission-label" title={level.name}>
                                {level.name.length > 7 ? `${level.name.slice(0, 7)}..` : level.name}
                            </div>
                            
                            <div class="commission-value">
                                <input
                                    type="number"
                                    class="commission-input"
                                    id={`comm-${merchant.id}-${idx}`}
                                    value={formatCommission(level.commission)}
                                    step="0.01"
                                    min="0"
                                    max="100"
                                    on:change={() => markAsModified(merchant.id, merchants)}
                                    on:input={() => updatePathColor(merchant.id, idx)}
                                    on:blur={(e) => formatInputValue(e.target as HTMLInputElement)}
                                    disabled={merchant.status === 'inactive'}
                                />
                                <span class="commission-unit">%</span>
                            </div>
                        </div>
                        
                        {#if idx < merchant.hierarchy.length - 1}
                            <span class="commission-arrow">▶</span>
                        {/if}
                    {/if}
                {/each}

                <div class="commission-item">
                    <div class="commission-label">{merchant.name}</div>
                    <div class="commission-value">
                        <input
                            type="number"
                            class="commission-input"
                            id={`merchant-comm-${merchant.id}`}
                            value={formatCommission(merchant.merchantCommission)}
                            step="0.01"
                            min="0"
                            max="100"
                            readonly
                            on:change={() => markAsModified(merchant.id, merchants)}
                            on:blur={(e) => formatInputValue(e.target as HTMLInputElement)}
                            disabled={merchant.status === 'inactive'}
                        />
                        <span class="commission-unit">%</span>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="card-footer">
        <div class="created-date">
            <i class="fas fa-calendar-alt"></i>
            생성: {merchant.createdDate}
        </div>

        <div class="updated-date">
            <i class="fas fa-clock"></i>
            수정: {merchant.lastUpdated}
        </div>
    </div>
</div>
