<script lang="ts">
  import { navigateTo } from '$lib/utils/menuUtils';
  
  export let classify: string;
  export let rate: string;
  export let openAccordions: Set<string>;
  export let toggleAccordion: (id: string) => void;
  export let isExpanded: boolean;
  
  $: isOpen = openAccordions.has('payment2');
</script>

<style>
  /* 커스텀 메뉴 구조 */
  .custom-menu-item { margin-bottom: 1rem; }
  .custom-menu-header {
    display: grid; grid-template-columns: 24px 1fr 24px; align-items: center; column-gap: 0.75rem;
    padding: 0.75rem; color: var(--white-color) !important; border-radius: 0.5rem; transition: 0.3s; cursor: pointer; margin: 0; text-decoration: none !important;
    white-space: nowrap; min-width: 0; max-width: 100%; width: 100%; box-sizing: border-box; overflow: hidden;
  }
  .custom-menu-header:hover { background-color: var(--first-color); text-decoration: none !important; max-width: 100%; width: 100%; box-sizing: border-box; overflow: hidden; }
  .custom-menu-header.active { background-color: var(--first-color); border-radius: 0.5rem 0.5rem 0 0 !important; }
  .custom-menu-body { background-color: var(--first-color); border-radius: 0 0 0.5rem 0.5rem !important; margin: 0; padding: 0; }
  .custom-menu-body ul { margin: 0; padding: 0; list-style: none; }
  .custom-menu-body ul li { padding: 0.35rem 1.5rem; border: none; list-style: none; display: block; width: 100%; }
  .custom-menu-body ul li a { font-size: 0.85rem; color: #fff !important; text-decoration: none !important; display: block; width: 100%; position: relative; line-height: 1.4; padding: 5px 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .arrow-icon { width: 24px; height: 24px; transition: transform 0.2s ease; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .arrow-icon img { width: 24px !important; height: 24px !important; display: block !important; opacity: 1 !important; visibility: visible !important; }
  .nav_name { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0; }
  :global(.l-navbar:not(.expander)) .custom-menu-header:hover { background-color: transparent !important; }
</style>



{#if true}
<div class="custom-menu-item">
  <div 
    class="custom-menu-header nav__link {isOpen ? 'active' : ''}"
    on:click={() => toggleAccordion('payment2')}
  >
    <img src="/img/icon/receipt-outline.svg" alt="정산관리" class="nav__icon menu_icon" />
    <span class="nav_name">정산관리</span>
    <div class="arrow-icon" style="transform: rotate({isOpen ? '180deg' : '0deg'});">
      <img src="/img/dote_select_bg.png" alt="화살표" />
    </div>
  </div>
  
  {#if isOpen && isExpanded}
    <div class="custom-menu-body">
        <ul>
          <li><a href="#" on:click|preventDefault={() => navigateTo('S_settlement_list')}>가맹점 정산</a></li>
          {#if classify === "0" || rate === "p1"}
            <li><a href="#" on:click|preventDefault={() => navigateTo('P_settlement_list')}>파트너 정산</a></li>
          {/if}
          {#if classify === "0"}
            <li><a href="#" on:click|preventDefault={() => navigateTo('A_transfer_list')}>이체 내역</a></li>
          {/if}
        </ul>
    </div>
  {/if}
</div>
{/if}