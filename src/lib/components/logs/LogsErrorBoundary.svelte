<script lang="ts">
    export let error: string | null = null;
    export let onRetry: (() => void) | null = null;
</script>

{#if error}
    <div class="error-boundary">
        <div class="error-content">
            <div class="error-icon">⚠️</div>
            <h3>데이터를 불러오는 중 오류가 발생했습니다</h3>
            <p class="error-message">{error}</p>
            {#if onRetry}
                <button 
                    type="button" 
                    class="retry-button"
                    on:click={onRetry}
                >
                    다시 시도
                </button>
            {/if}
        </div>
    </div>
{/if}

<style>
    .error-boundary {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 300px;
        padding: 2rem;
        background-color: #f8f9fa;
        border-radius: 8px;
        border: 1px solid #e9ecef;
    }

    .error-content {
        text-align: center;
        max-width: 400px;
    }

    .error-icon {
        font-size: 3rem;
        margin-bottom: 1rem;
    }

    .error-content h3 {
        color: #dc3545;
        margin-bottom: 1rem;
        font-size: 1.2rem;
    }

    .error-message {
        color: #6c757d;
        margin-bottom: 1.5rem;
        line-height: 1.5;
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
</style>