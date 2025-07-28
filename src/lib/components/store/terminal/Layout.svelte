<script lang="ts">
    import { page } from '$app/stores';
    import { authStore } from '$lib/stores/auth';
    import { getPageTitle } from '$lib/utils/store/terminalUtils';

    export let title = '';
    
    $: userName = $authStore.userName;

    // 페이지 제목 동적 생성
    $: if (!title) {
        const currentRole = $page.url.pathname.split('/')[2] || '';
        title = getPageTitle(currentRole);
    }

</script>

<div id="page_contect" class="">
    <!-- 컨텐트 시작 -->
    <div id="content" class="container">
            <div class="title_wrap">
                <h5 class="page_title">{title}</h5>
            </div>
        <slot />
    </div>
</div>