<script lang="ts">
    import { authStore } from '$lib/stores/auth';
    import { goto } from '$app/navigation';
    
    $: userName = $authStore.userName;
    
    function goToSettings() {
        goto('/settings/logs');
    }
</script>

<div id="page_contect" class="">
    <!-- 컨텐트 시작 -->
    <div id="content" class="container">
        <slot />
    </div>
</div>