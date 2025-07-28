<script lang="ts">
    import { page } from '$app/stores';
    import { getPageTitle } from '$lib/utils/settingsUtils';
    import { authStore } from '$lib/stores/auth';
    import { goto } from '$app/navigation';
    
    export let title = '';
    export let showUserProfile = false;
    export let userInfo: any = {};

    // 반응형으로 사용자 정보 가져오기
    $: rate = $authStore.rate;
    $: userName = $authStore.userName;
    
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
    {#if showUserProfile}
        <section class="contect_w top_contect_w">
            <div class="borderbox_table user_wrap_box">
                <div class="row">
                    <div class="col-12 main_boxwh">
                        <div class="contentbox userw_wrap">
                            <div class="user_info_wrap">
                                <div class="content_left">
                                    <div class="user_img">
                                        <img src="/img/noimage.png" alt="이미지">
                                    </div>
                                    {#if userName}
                                        <h2 class="user_name">{userName}</h2>
                                    {/if}
                                    <span>님, 안녕하세요.</span>
                                </div>
                                {#if rate === "p0"}
                                <div class="">
                                    <button 
                                        type="button" 
                                        class="btn_log"
                                        on:click={() => goto('/settings/logs')}
                                    >
                                        로그조회
                                    </button>
                                </div>
                                {/if}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    {/if}

    <section>
        <h5 style="float:left; margin-right:10px;">정보수정</h5>
        <span style="float:left; margin-right:10px;">-</span>
        <h5>{title}</h5>
    </section>

    <section class="sub_box admin_seeting_wrap">
        <slot />
    </section>
</div>