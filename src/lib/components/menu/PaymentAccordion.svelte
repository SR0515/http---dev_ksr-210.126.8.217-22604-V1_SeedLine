<script lang="ts">
  import { navigateTo } from '$lib/utils/menuUtils';
  
  export let classify: string;
  export let openAccordions: Set<string>;
  export let toggleAccordion: (id: string) => void;
  export let leftMenuData: any;
  export let isExpanded: boolean;
  
  $: isOpen = openAccordions.has('payment');
</script>

{#if true}
<div class="custom-menu-item">
  <div 
    class="custom-menu-header nav__link {isOpen ? 'active' : ''}"
    on:click={() => toggleAccordion('payment')}
  >
    <img src="/img/icon/newspaper-outline.svg" alt="결제내역 관리" class="nav__icon menu_icon" />
    <span class="nav_name">결제내역 관리
      {#if leftMenuData.C_dupli > 0}
        <span class="info_mark"></span>
      {/if}
    </span>
    <div class="arrow-icon" style="transform: rotate({isOpen ? '180deg' : '0deg'});">
      <img src="/img/dote_select_bg.png" alt="화살표" />
    </div>
  </div>
  
  {#if isOpen && isExpanded}
    <div class="custom-menu-body">
        <ul>
          <li><a href="#" on:click|preventDefault={() => navigateTo('/payment/paymentList')} >결제내역</a></li>
          {#if classify === '0' || classify === '2'}
            <li><a href="#" on:click|preventDefault={() => navigateTo('/payment/salesList')}>매출내역</a></li>
          {:else if classify === '1'}
            <li><a href="#" on:click|preventDefault={() => navigateTo('Patner_Terminal_sales_list')}>매출내역</a></li>
          {/if}

          {#if classify === '0'}
            <li>
              <a href="#" on:click|preventDefault={() => navigateTo('/payment/duplicateList')}>
                중복결제알림
                {#if leftMenuData.C_dupli > 0}
                  <span class="c_count">{leftMenuData.C_dupli}</span>
                {/if}
              </a>
            </li>
          {/if}
        </ul>
    </div>
  {/if}
</div>
{/if}