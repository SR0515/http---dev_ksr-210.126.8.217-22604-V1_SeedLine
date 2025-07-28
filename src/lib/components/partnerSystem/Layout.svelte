<script lang="ts">
    import { onMount } from 'svelte';
    import { fetchData } from '$lib/utils/partner/partnerSystem';

    onMount(() => {
        fetchData();
    });
</script>

<div id="page_contect" class="">
    <!-- 컨텐트 시작 -->
    <div id="content" class="container">
        <section>
            <div class="title_wrap">
                <h5 class="page_title">파트너 관리 수정 - 구조 및 권한 관리</h5>
            </div>
        </section>
        <!-- 동적으로 들어올 콘텐츠 자리를 표시하는 마커 slot -->
        <slot />  
    </div>
</div>