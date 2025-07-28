<script lang="ts">
    export let loading = false;
    export let message = "데이터를 불러오는 중...";
</script>

{#if loading}
    <div class="loading-container">
        <div class="loading-spinner">
            <div class="spinner"></div>
            <p class="loading-message">{message}</p>
        </div>
    </div>
{/if}

<style>
    .loading-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 200px;
        padding: 2rem;
        background-color: rgba(255, 255, 255, 0.9);
        border-radius: 8px;
    }

    .loading-spinner {
        text-align: center;
    }

    .spinner {
        width: 40px;
        height: 40px;
        border: 4px solid #f3f3f3;
        border-top: 4px solid #971523;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 1rem;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    .loading-message {
        color: #6c757d;
        font-size: 0.9rem;
        margin: 0;
    }
</style>