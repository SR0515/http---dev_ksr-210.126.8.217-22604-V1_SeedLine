<script lang="ts">
    import { goto } from '$app/navigation';
    
    export let currentTab: string = 'LoginLog';
    
    function navigateToTab(tabName: string) {
        switch(tabName) {
            case 'LoginLog':
                goto('/settings/logs');
                break;
            case 'EditLog':
                goto('/settings/logs/edit');
                break;
            case 'S_commission_log':
                goto('/settings/logs/commission');
                break;
            case 'S_settlement_log':
                goto('/settings/logs/settlement');
                break;
        }
    }
    
    function handleKeyDown(event: KeyboardEvent, tabName: string) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            navigateToTab(tabName);
        }
    }
</script>

<div class="tab_menu" role="tablist" aria-label="로그 타입 선택">
    <ul>
        <li class="{currentTab === 'LoginLog' ? 'on' : ''}" on:click={() => navigateToTab('LoginLog')} on:keydown={(e) => handleKeyDown(e, 'LoginLog')} style="cursor: pointer;" tabindex="0" role="tab" aria-selected={currentTab === 'LoginLog'} aria-label="로그인 로그 탭">
            로그인
        </li>
        <li class="{currentTab === 'EditLog' ? 'on' : ''}" on:click={() => navigateToTab('EditLog')} on:keydown={(e) => handleKeyDown(e, 'EditLog')} style="cursor: pointer;" tabindex="0" role="tab" aria-selected={currentTab === 'EditLog'} aria-label="정보수정 로그 탭">
            정보수정
        </li>
        <li class="{currentTab === 'S_commission_log' ? 'on' : ''}" on:click={() => navigateToTab('S_commission_log')} on:keydown={(e) => handleKeyDown(e, 'S_commission_log')} style="cursor: pointer;" tabindex="0" role="tab" aria-selected={currentTab === 'S_commission_log'} aria-label="가맹점 정산수수료 수정 로그 탭">
            가맹점 정산수수료 수정
        </li>
        <li class="{currentTab === 'S_settlement_log' ? 'on' : ''}" on:click={() => navigateToTab('S_settlement_log')} on:keydown={(e) => handleKeyDown(e, 'S_settlement_log')} style="cursor: pointer;" tabindex="0" role="tab" aria-selected={currentTab === 'S_settlement_log'} aria-label="가맹점 정산처리 로그 탭">
            가맹점 정산처리
        </li>
    </ul>
</div>