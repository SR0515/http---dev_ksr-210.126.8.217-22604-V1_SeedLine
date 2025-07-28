<script lang="ts">
  import { navigateTo, handleLogout } from '$lib/utils/menuUtils';
  import { page } from '$app/stores';
  
  export let myInfo: string;
  export let closeAccordions: () => void;
  export let isExpanded: boolean;
  
  // 현재 페이지가 정보수정 페이지인지 확인 (로그 페이지도 settings 하위로 이동)
  // 슬림 모드에서는 포커스 비활성화
  $: isSettingsPage = $page.url.pathname.includes('/settings/') && isExpanded;
  
  function handleSettingsClick() {
    navigateTo(myInfo);
    closeAccordions();
  }
  
  function handleHover(e: Event) {
    if (!isExpanded) {
      const target = e.target as HTMLElement;
      target.style.backgroundColor = 'transparent';
      target.style.background = 'transparent';
    }
  }
</script>

<!-- 정보수정 -->
<a 
  href="#" 
  on:click|preventDefault={handleSettingsClick} 
  class="nav__link {isSettingsPage ? 'active' : ''}"
  style="text-decoration: none !important; {isSettingsPage ? 'background-color: #971523 !important; color: white !important;' : ''}"
  on:mouseenter={handleHover}
  on:mouseleave={handleHover}
>
  <img src="/img/icon/toggle-outline.svg" alt="정보수정" class="nav__icon menu_icon" />
  <span class="nav_name">정보수정</span>
</a>

<!-- 로그아웃 버튼 -->
<a 
  href="#" 
  on:click|preventDefault={handleLogout} 
  class="nav__link"
  style="{!isExpanded ? 'background-color: transparent !important; background: transparent !important; text-decoration: none !important;' : 'text-decoration: none !important;'}"
  on:mouseenter={handleHover}
  on:mouseleave={handleHover}
>
  <img src="/img/icon/log-out-outline.svg" alt="로그아웃 아이콘" class="nav__icon" />
  <span class="nav_name">로그아웃</span>
</a>