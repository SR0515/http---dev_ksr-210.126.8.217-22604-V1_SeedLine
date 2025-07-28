<script lang="ts">
  import { navigateTo, navigateToPartner } from '$lib/utils/menuUtils';
  
  export let classify: string;
  export let rate: string;
  export let openAccordions: Set<string>;
  export let toggleAccordion: (id: string) => void;
  export let partnerData: any[];
  export let leftMenuData: any;
  export let isExpanded: boolean;
  
  $: showPartnerMenu = (rate === "p0" || rate !== "");
  $: isOpen = openAccordions.has('partner');
</script>



{#if showPartnerMenu}
  <div class=" custom-menu-item">
    <div 
      class="partner-menu-header custom-menu-header nav__link {isOpen ? 'active' : ''}"
      on:click={() => toggleAccordion('partner')}
    >
      <img src="/img/icon/cube-outline.svg" alt="파트너 관리" class="nav__icon menu_icon" />
      <span class="nav_name">파트너관리</span>
      <div class="button-container partnerAddBtn">
        {#if classify === '0' && isExpanded}
          <div class="partner_setting_btn">
            <span class="" on:click|stopPropagation|preventDefault={() => navigateTo('/partnerSystem')}>+</span>
          </div>
          {/if}
        <div class="arrow-icon" style="transform: rotate({isOpen ? '180deg' : '0deg'});">
          <img src="/img/dote_select_bg.png" alt="화살표" />
        </div>
      </div>
    </div>
    
    {#if isOpen && isExpanded}
      <div class="custom-menu-body">
        <ul>
          {#if classify === '0' || classify === '1'}
            {#each partnerData as partner}
              <li>
                <a 
                  href="#" 
                  on:click|preventDefault={() => navigateToPartner('/list/partner', { 
                    id: partner.id, 
                    name: partner.partner_name, 
                    rate: partner.rate 
                  })}
                >
                  {partner.partner_name}
                  {#if leftMenuData.notifyRateMap[String(partner.rate)]}
                    <span class="info_mark level_info_mark"></span>
                  {/if}
                </a>
              </li>
            {/each}
          {/if}
        </ul>
      </div>
    {/if}
  </div>
{/if}