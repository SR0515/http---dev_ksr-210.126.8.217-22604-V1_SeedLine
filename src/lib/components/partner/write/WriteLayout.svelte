<script lang="ts">
    import { page } from '$app/stores';
    import { getPageTitle } from '$lib/utils/writeUtils';
    import { authStore } from '$lib/stores/auth';
    import { goto } from '$app/navigation';

    export let pageType = '';
    export let title = '';

    let pageTitle:string = '';
    // 반응형으로 사용자 정보 가져오기
    $: rate = $authStore.rate;
    $: userName = $authStore.userName;
    $: classify = $authStore.classify;

    $: if (pageType === "Write"){
        pageTitle = "정보등록"
    }else if(pageType === "Edit"){
        pageTitle = "정보수정"
    }

    // 페이지 제목 동적 생성
    $: if (!title) {
        const currentRole = $page.url.pathname.split('/')[2] || '';
        title = getPageTitle(currentRole, rate);
    }

    function handleCancel() {
        goto('/dashboard');
    }
</script>
<div id="page_contect" class="">
        <section>
            <h5 style="float:left; margin-right:10px;" > {pageTitle}</h5> 
            <span style="float:left; margin-right:10px;" > - </span>
            <h5>{title}</h5>
        </section>
    <section class="sub_box"> 
        <slot />
    </section>
</div>