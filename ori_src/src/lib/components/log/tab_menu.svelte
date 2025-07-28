<script lang="ts">
    import { onMount } from "svelte";
    import { goto } from '$app/navigation';

    let logTab = '';
    async function navigateToLog(menu: string) {
        logTab = menu;
		await goto(`/log/${menu}`);
	}

    onMount(async () => {
        
    });
</script>

<div class="tab_menu">
    <ul>
    <li class:on={logTab === 'APS_login_log'}>
        <a href="{'javascript:void(0)'}" on:click={() => navigateToLog('APS_login_log')}>로그인</a>
    </li>
    <li class:on={logTab === 'APS_edit_log'}>
        <a href="{'javascript:void(0)'}" on:click={() => navigateToLog('APS_edit_log')}>정보수정</a>
    </li>
        <li class:on={logTab === 'S_commission_edit_log_list'}>
        <a href="{'javascript:void(0)'}" on:click={() => navigateToLog('S_commission_edit_log_list')}>가맹점 정산수수료 수정</a>
    </li>
        <li class:on={logTab === 'S_settlement_log_list'}>
        <a href="{'javascript:void(0)'}" on:click={() => navigateToLog('S_settlement_log_list')}>가맹점 정산처리</a>
    </li>
    </ul>

</div>
