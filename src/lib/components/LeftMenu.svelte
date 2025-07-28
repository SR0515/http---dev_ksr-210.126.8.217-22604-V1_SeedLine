<script lang="ts">
  import { onMount } from "svelte";
  import { page } from '$app/stores';
  import { authStore } from '$lib/stores/auth';
  import { partnerData, fetchPartners } from '$lib/stores/partner';
  import { leftMenuData } from '$lib/stores/leftMenu';
  import { browser } from '$app/environment';
  import { MENU_CONFIG, getUserInfo, getAccordionByPath } from '$lib/config/leftMenu.config';
  import { updateBodyClass, loadMenuData, initializeSidebar, createResizeHandler, navigateTo } from '$lib/utils/menuUtils';
  
  // 컴포넌트 imports
  import MenuHeader from './menu/MenuHeader.svelte';
  import PartnerAccordion from './menu/PartnerAccordion.svelte';
  import StoreAccordion from './menu/StoreAccordion.svelte';
  import PaymentAccordion from './menu/PaymentAccordion.svelte';
  import SettlementAccordion from './menu/SettlementAccordion.svelte';
  import PaymentManageAccordion from './menu/PaymentManageAccordion.svelte';
  import UserSection from './menu/UserSection.svelte';

  // 반응형 상태 - 모바일에서는 기본적으로 슬림 상태
  let isExpanded = false; // 모바일 우선으로 기본값 변경
  let openAccordions = new Set<string>(); // 열린 아코디언들을 추적
  
  // 스토어에서 반응형으로 데이터 가져오기
  $: classify = $authStore.classify;
  $: rate = $authStore.rate;
  $: userId = $authStore.userId;
  $: userName = $authStore.userName;
  $: currentPath = $page.url.pathname;
  
  // 사용자 정보 반응형 계산
  $: userInfo = getUserInfo(classify);
  $: myInfo = userInfo.route;
  $: rate_name = `Afixic ${userInfo.name}`;

  // 현재 경로에 따른 아코디언 자동 열기 (한 번에 하나만)
  $: {
    const accordionId = getAccordionByPath(currentPath);
    const newOpenAccordions = new Set<string>();
    if (accordionId) {
      newOpenAccordions.add(accordionId);
    }
    openAccordions = newOpenAccordions;
  }

  // 사이드바 토글
  function toggleSidebar() {
    isExpanded = !isExpanded;
    if (browser) {
      localStorage.setItem(MENU_CONFIG.STORAGE_KEYS.sidebarExpanded, JSON.stringify(isExpanded));
      updateBodyClass(isExpanded);
      
      // 사이드바가 닫힐 때 모든 아코디언 닫기
      if (!isExpanded) {
        openAccordions = new Set();
      }
    }
  }

  // 아코디언 토글 (한 번에 하나만 열리도록)
  function toggleAccordion(accordionId: string) {
    // 사이드바가 닫혀있으면 먼저 열기
    if (!isExpanded) {
      isExpanded = true;
      if (browser) {
        localStorage.setItem(MENU_CONFIG.STORAGE_KEYS.sidebarExpanded, JSON.stringify(isExpanded));
        updateBodyClass(isExpanded);
      }
    }

    // 아코디언 토글 - 한 번에 하나만 열리도록
    const newOpenAccordions = new Set<string>();
    if (!openAccordions.has(accordionId)) {
      newOpenAccordions.add(accordionId);
    }
    openAccordions = newOpenAccordions;
  }

  // 모든 아코디언 닫기
  function closeAccordions() {
    openAccordions = new Set();
  }

  // 컴포넌트 마운트 시 초기화
  onMount(() => {
    if (browser) {
      // 사이드바 초기화
      isExpanded = initializeSidebar();

      // 메뉴 데이터 로드
      if ($authStore.isAuthenticated) {
        loadMenuData();
        fetchPartners();
      }
      
      // 화면 크기 변경 감지
      const handleResize = createResizeHandler(
        isExpanded,
        (value) => { isExpanded = value; },
        () => { openAccordions = new Set(); }
      );
      
      window.addEventListener('resize', handleResize);
      
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }

  });

  // 인증 상태 변화 감지
  $: if ($authStore.isAuthenticated && browser) {
    loadMenuData();
    fetchPartners();
  }
</script>

<style>
  @import '$lib/styles/leftmenu.css';
</style>

<!-- 메뉴바 -->
<div class="l-navbar {isExpanded ? 'expander' : ''}" id="navbar">
  <nav class="nav">
    <div>
      <MenuHeader {toggleSidebar} rateName={rate_name} />

      <div class="moblie_menu">
        <!-- 홈으로 -->
        <a 
          href="#" 
          on:click|preventDefault={() => {
            navigateTo('Main');
            closeAccordions();
          }} 
          class="nav__link"
          style="{!isExpanded ? 'background-color: transparent !important; background: transparent !important; text-decoration: none !important;' : 'text-decoration: none !important;'}"
          on:mouseenter={(e) => {
            if (!isExpanded) {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.background = 'transparent';
            }
          }}
          on:mouseleave={(e) => {
            if (!isExpanded) {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.background = 'transparent';
            }
          }}
        >
          <img src="/img/icon/home-outline.svg" alt="홈 아이콘" class="nav__icon menu_icon" />
          <span class="nav_name">홈으로</span>
        </a>

        <div class="nav__list">
          <div class="accordion" id="accordionExample">
            
            <PartnerAccordion 
              {classify} 
              {rate} 
              {openAccordions} 
              {toggleAccordion} 
              {isExpanded}
              partnerData={$partnerData} 
              leftMenuData={$leftMenuData} 
            />

            <StoreAccordion 
              {classify} 
              {rate} 
              {openAccordions} 
              {toggleAccordion} 
              {isExpanded}
              leftMenuData={$leftMenuData} 
            />

            <PaymentAccordion 
              {classify} 
              {openAccordions} 
              {toggleAccordion} 
              {isExpanded}
              leftMenuData={$leftMenuData} 
            />

            <SettlementAccordion 
              {classify} 
              {rate} 
              {openAccordions} 
              {toggleAccordion} 
              {isExpanded}
            />

            <PaymentManageAccordion 
              {classify} 
              {openAccordions} 
              {toggleAccordion} 
              {isExpanded}
            />

            <UserSection {myInfo} {closeAccordions} {isExpanded} />
          </div>
        </div>
      </div>
    </div>
  </nav>
</div>