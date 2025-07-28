<script>
    import { fade } from "svelte/transition";
    import { toast } from '$lib/stores/toast.ts';
    
    let message = "";
    let type = "info"; 
    let visible = false;

    // 자동 반응
    $: ({ message, type, visible } = $toast);
</script>

<style> 
     .toast-mask {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background-color: rgba(0, 0, 0, 0.5) !important; 
        backdrop-filter: blur(5px); 
        z-index: 9998; 
        opacity: 1;
        transition: opacity 0.5s ease-in-out;
    }

    .toast {
        position: fixed;
        z-index: 9999;
        top: 50px;
        left: 50%;
        transform: translateX(-50%);
        background-color: #333;
        color: white;
        padding: 12px 20px;
        border-radius: 6px;
        opacity: 0;
        transition: opacity 0.5s ease-in-out;
        border:0;
        text-align: center;
        max-width: 300px;
        word-wrap: break-word;
    }
    
    /* 모바일 환경에서 토스트 위치 조정 */
    @media (max-width: 991px) {
        .toast {
            top: 30px;
            left: 50%;
            transform: translateX(-50%);
            max-width: 280px;
            padding: 10px 15px;
            font-size: 14px;
        }
    }
    
    @media (max-width: 480px) {
        .toast {
            top: 20px;
            left: 10px;
            right: 10px;
            max-width: none;
            width: calc(100vw - 20px);
            transform: none;
        }
    }

    .toast.show, .toast-mask.show {opacity: 1;}

    /* 토스트 색상 */
    .success { background-color: #4CAF50; }
    .error { background-color: #f44336; }
    .warning { background-color: #ff9800; }
    .info { background-color: #045eb8; }
</style>

{#if $toast.visible}
  <div class="toast-mask" transition:fade />
  <div class="toast { $toast.type } show" transition:fade>
    { $toast.message }
  </div>
{/if}