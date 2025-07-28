<script lang="ts">
    import { authStore } from '$lib/stores/auth';
    
    $: userName = $authStore.userName;
</script>

<svelte:head>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"/>
</svelte:head>


<div id="page_contect" class="">
    <!-- 컨텐트 시작 -->
    <div id="content" class="container">
        <!-- 동적으로 들어올 콘텐츠 자리를 표시하는 마커 slot -->
        <slot />  
    </div>
</div>