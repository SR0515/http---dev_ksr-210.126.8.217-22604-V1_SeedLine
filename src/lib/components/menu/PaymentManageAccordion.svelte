<script lang="ts">
  import { navigateTo } from '$lib/utils/menuUtils';
  
  export let classify: string;
  export let openAccordions: Set<string>;
  export let toggleAccordion: (id: string) => void;
  export let isExpanded: boolean;
  
  $: showPaymentManage = classify === '2';
  $: isOpen = openAccordions.has('payment3');
</script>

{#if showPaymentManage}
<div class="custom-menu-item">
  <div 
    class="custom-menu-header nav__link {isOpen ? 'active' : ''}"
    on:click={() => toggleAccordion('payment3')}
  >
    <img src="/img/icon/credit-card.svg" alt="결제관리" class="nav__icon menu_icon" />
    <span class="nav_name">결제관리</span>
    <div class="arrow-icon" style="transform: rotate({isOpen ? '180deg' : '0deg'});">
      <img src="/img/dote_select_bg.png" alt="화살표" />
    </div>
  </div>
  
  {#if isOpen && isExpanded}
    <div class="custom-menu-body">
        <ul>
          <li><a href="#" on:click|preventDefault={() => navigateTo('Keyin')}>수기결제</a></li>
          <li><a href="#" on:click|preventDefault={() => navigateTo('Pay_3d')}>인증결제</a></li>
          <li><a href="#" on:click|preventDefault={() => navigateTo('Keyin_FailList')}>결제실패내역</a></li>
        </ul>
    </div>
  {/if}
</div>
{/if}