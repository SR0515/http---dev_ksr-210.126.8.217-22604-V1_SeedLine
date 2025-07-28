<script lang="ts">
    import { onMount } from 'svelte';
    import { authStore } from '$lib/stores/auth';
    import { checkDuplicate } from '$lib/utils/Duplicate_check'; 
    import { toggleInputVisibility } from '$lib/utils/writeUtils';
    import { on } from 'svelte/events';
    import { getDefaultStoreListData } from '$lib/utils/editUtils'

    export let disabled = false;
    export let userData = getDefaultStoreListData();
    
</script>

    <h3>서비스 설정</h3>        
    <div class="">
        <div class="d-flex">
            <dl class="col-12 col-lg-6 radio_wrap">
                <dt>로그인</dt>
                <dd class="d-flex">
                    <label><input type="radio" name="login_state" id="loginState_0" value="0" bind:group={userData.store_basic.login_state}>정상</label>
                    <label><input type="radio" name="login_state" id="loginState_1" value="1" bind:group={userData.store_basic.login_state}>차단</label>
                    <label><input type="radio" name="login_state" id="loginState_2" value="2" bind:group={userData.store_basic.login_state}>탈퇴</label>
                </dd>
            </dl>
            <dl class="col-12 col-lg-6">
                <dt>사업자번호</dt>
                <dd style="margin-right: 10px;">
                    <div class="form_input"><input type="text" class="input" name="store_business_number"/></div>
                </dd>
            </dl>
        </div>


        <div class="d-flex">
            <dl class="col-12 col-lg-6 radio_wrap">
                <dt>중복결제 알림</dt>
                <dd class="d-flex">
                    <label><input type="radio" name="duplicate_use" id="duplicate_use_0" value="0" bind:group={userData.store_wallet.duplicate_state}>사용</label>
                    <label><input type="radio" name="duplicate_use" id="duplicate_use_1" value="1" bind:group={userData.store_wallet.duplicate_state}>미사용</label>
                </dd>
            </dl>
        </div>             
    </div>