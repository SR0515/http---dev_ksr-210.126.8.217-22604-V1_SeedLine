<script lang="ts">
    import { onMount } from 'svelte';
    import { authStore } from '$lib/stores/auth';
    import { checkDuplicate } from '$lib/utils/Duplicate_check'; 
    import { toggleInputVisibility } from '$lib/utils/writeUtils';
    import { on } from 'svelte/events';
    import { getDefaultPartnerListData } from '$lib/utils/editUtils'

    export let disabled = false;
    export let userData = getDefaultPartnerListData();
    
</script>

    <h3>서비스 설정</h3>
            <div class="agency_form ">
                <div class="d-flex">
                    <dl class="col-12 col-lg-6 radio_wrap">
                        <dt>계약상태</dt>
                        <dd class="d-flex">
                            <label><input type="radio" name="login_state" value="0" id="loginState_0" bind:group={userData.partnerList.login_state}>허용</label>
                            <label><input type="radio" name="login_state" value="1" id="loginState_1" bind:group={userData.partnerList.login_state}>차단</label>
                            <label><input type="radio" name="login_state" value="2" id="loginState_2" bind:group={userData.partnerList.login_state}>대기</label>
                        </dd>
                    </dl>
                </div> 
            </div>