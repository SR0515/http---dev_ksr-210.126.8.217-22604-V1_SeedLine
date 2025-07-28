<script lang="ts">
  import { navigateTo} from '$lib/utils/menuUtils';
  
  export let classify: string;
  export let rate: string;
  export let openAccordions: Set<string>;
  export let toggleAccordion: (id: string) => void;
  export let leftMenuData: any;
  export let isExpanded: boolean;
  
  $: showStoreMenu = classify !== '2';
  $: isOpen = openAccordions.has('store');
  $: hasNotification = leftMenuData.commissionBalance > 0 || leftMenuData.terminalCount > 0;


</script>


{#if showStoreMenu}
  <div class="custom-menu-item">
    <div 
      class="custom-menu-header nav__link {isOpen ? 'active' : ''}"
      on:click={() => toggleAccordion('store')}
    >
      <img src="/img/icon/storefront-outline.svg" alt="가맹점 관리" class="nav__icon menu_icon" />
      <span class="nav_name">가맹점관리
        {#if hasNotification}
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
            <li>
              <a href="#" on:click|preventDefault={() => navigateTo('/list/store')}>
                가맹점 관리
                {#if leftMenuData.pathNotifyCount > 0}
                  <span class="info_mark level_info_mark"></span>
                {/if}
              </a>
            </li>

            {#if rate === 'p0' || rate === 'p1'}
              <li>
                <a href="#" on:click|preventDefault={() => navigateTo('/store/commission')}>
                  정산 수수료 관리
                  {#if leftMenuData.commissionBalance > 0}
                    <span class="c_count">{leftMenuData.commissionBalance}</span>
                  {/if}
                </a>
              </li>
            {/if}

            {#if classify === '0' || classify === '1'}
              <li>
                <a href="#" on:click|preventDefault={() => navigateTo('/store/expirydate')}>
                  1년 경과 TID
                  {#if leftMenuData.terminalCount > 0}
                    <span class="c_count">{leftMenuData.terminalCount}</span>
                  {/if}
                </a>
              </li>

              <li>
                <a href="#" on:click|preventDefault={() => navigateTo('/store/inactive')}>
                  장기 미사용 TID
                  {#if leftMenuData.inactiveCount > 0}
                    <span class="c_count">{leftMenuData.inactiveCount}</span>
                  {/if}
                </a>
              </li>
            {/if}
          </ul>
      </div>
    {/if}
  </div>
{/if}