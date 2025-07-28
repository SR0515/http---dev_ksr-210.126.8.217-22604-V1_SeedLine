<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { fade } from 'svelte/transition';
    
    const dispatch = createEventDispatcher();
    
    export let loading = false;
    export let error: string | null = null;
    export let data: any[] = [];
    export let caption: string = '';
    export let emptyMessage: string = '등록된 데이터가 없습니다.';
    export let columnCount: number = 1;
    
    function handleRetry() {
        dispatch('retry');
    }
</script>

<section class="borderbox_table">
    <div id="table_wrap" class="table_wrap">
        <table class="table_list" width="100%">
            <caption>{caption}</caption>
            
            <slot name="colgroup"></slot>
            <slot name="thead"></slot>
            
            <tbody>
                {#if loading}
                    <tr transition:fade>
                        <td colspan={columnCount} class="loading-cell">
                            <div class="loading-content">
                                <div class="loading-spinner"></div>
                                <span>데이터를 불러오는 중...</span>
                            </div>
                        </td>
                    </tr>
                {:else if error}
                    <tr transition:fade>
                        <td colspan={columnCount} class="error-cell">
                            <div class="error-content">
                                <div class="error-icon">⚠️</div>
                                <span class="error-message">{error}</span>
                                <button 
                                    type="button" 
                                    class="retry-button"
                                    on:click={handleRetry}
                                >
                                    다시 시도
                                </button>
                            </div>
                        </td>
                    </tr>
                {:else if data.length === 0}
                    <tr transition:fade>
                        <td colspan={columnCount} class="no-data">
                            {emptyMessage}
                        </td>
                    </tr>
                {:else}
                    <slot name="tbody" {data}></slot>
                {/if}
            </tbody>
        </table>
    </div>
</section>

<style>
    .loading-cell,
    .error-cell,
    .no-data {
        text-align: center;
        padding: 2rem;
    }
    
    .loading-content {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 1rem;
        color: #6c757d;
    }
    
    .loading-spinner {
        width: 20px;
        height: 20px;
        border: 2px solid #f3f3f3;
        border-top: 2px solid #007bff;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    .error-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
    }
    
    .error-icon {
        font-size: 2rem;
    }
    
    .error-message {
        color: #dc3545;
        font-size: 0.9rem;
    }
    
    .retry-button {
        background-color: #007bff;
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.9rem;
        transition: background-color 0.2s;
    }
    
    .retry-button:hover {
        background-color: #0056b3;
    }
    
    .retry-button:focus {
        outline: none;
        box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
    }
    
    .no-data {
        color: #666;
        font-style: italic;
    }
</style>