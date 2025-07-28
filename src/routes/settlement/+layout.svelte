<script lang="ts">
    import LeftMenu from '$lib/components/LeftMenu.svelte';
    import { onMount } from 'svelte';
    import { resetSettlementState } from '$lib/stores/settlement';
    
    // 정산 관련 페이지 진입 시 상태 초기화
    onMount(() => {
        resetSettlementState();
    });
</script>

<LeftMenu />

<div id="page_contect">
    <div id="content" class="container">
        <slot />
    </div>
</div>

<style>
    @import '$lib/styles/settlement.css';
    
    /* 정산 관련 페이지 공통 스타일 */
    .container {
        padding: 20px;
    }
    
    #page_contect {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
    }
    
    #content {
        flex: 1;
    }
</style>