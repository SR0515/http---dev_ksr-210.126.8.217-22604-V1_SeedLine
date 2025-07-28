<script lang="ts">
  import { onMount } from "svelte";
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { authStore } from '$lib/stores/auth';
  import { showToast } from '$lib/stores/toast';
  import { partnerData, fetchPartners } from '$lib/stores/partner';
  import { leftMenuData } from '$lib/stores/leftMenu';
  import { browser } from '$app/environment';

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
  $: myInfo = classify === '0' ? 'Admin_setting_edit' 
            : classify === '1' ? 'Partner_setting_edit' 
            : 'Store_setting_edit';
  
  $: rate_name = classify === '0' ? '관리자' 
               : classify === '1' ? '파트너' 
               : '가맹점';

  // 현재 경로에 따른 아코디언 자동 열기 (한 번에 하나만)
  $: {
    const newOpenAccordions = new Set<string>();
    
    if (currentPath.includes('/partner') || currentPath.includes('/agency') || currentPath.includes('/distributor')) {
      newOpenAccordions.add('partner');
    } else if (currentPath.includes('/store') || currentPath.includes('/terminal') || currentPath.includes('/test')) {
      newOpenAccordions.add('store');
    } else if (currentPath.includes('/terminal-pay') || currentPath.includes('/duplicate')) {
      newOpenAccordions.add('payment');
    } else if (currentPath.includes('/settlement') || currentPath.includes('/transfer')) {
      newOpenAccordions.add('payment2');
    } else if (currentPath.includes('/keyin') || currentPath.includes('/pay')) {
      newOpenAccordions.add('payment3');
    }
    
    openAccordions = newOpenAccordions;
  }

  // 라우팅 맵
  const routeMap: Record<string, string> = {
    'main': '/dashboard',
    'Main': '/dashboard',
    'StoreList': '/store/list',
    'StoreCommssion': '/store/commission',
    'StoreWrite': '/store/write',
    'StoreEdit': '/store/edit',
    'Terminal_expirydate_list': '/terminal/expiry',
    'Terminal_inactive_list': '/terminal/inactive',
    'Distributor_list': '/distributor/list',
    'Distributor_write': '/distributor/write',
    'Distributor_edit': '/distributor/edit',
    'Agency_list': '/agency/list',
    'Partner_write': '/partner/write',
    'Agency_edit': '/agency/edit',
    'Terminal_pay': '/terminal/pay',
    'Receipt': '/receipt',
    'Terminal_sales_list': '/terminal/sales',
    'Patner_Terminal_sales_list': '/partner/terminal/sales',
    'Realtime_terminal_pay': '/realtime/terminal/pay',
    'Duplicate_payment_list': '/duplicate/payment',
    'S_settlement_list': '/settlement/store',
    'P_settlement_list': '/settlement/partner',
    'A_transfer_list': '/transfer/admin',
    'Admin_setting_edit': '/setting/admin',
    'Partner_setting_edit': '/setting/partner',
    'Store_setting_edit': '/setting/store',
    'Keyin': '/keyin',
    'Keyin_FailList': '/keyin/fail',
    'Pay_3d': '/pay/3d',
    'Partner_list': '/partner/list',
    'Test_Commission': '/test/commission',
    'Partner_system': '/partner/partner_system',
    'APS_login_log': '/log/APS_login_log',
    'APS_edit_Log': '/log/APS_edit_Log',
    'S_commission_edit_log_list': '/log/S_commission_edit_log_list',
    'S_settlement_log_list': '/log/S_settlement_log_list',
  };

  // 사이드바 토글
  function toggleSidebar() {
    isExpanded = !isExpanded;
    if (browser) {
      localStorage.setItem('sidebarExpanded', JSON.stringify(isExpanded));
      updateBodyClass();
      
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
        localStorage.setItem('sidebarExpanded', JSON.stringify(isExpanded));
        updateBodyClass();
      }
    }

    // 아코디언 토글 - 한 번에 하나만 열리도록
    const newOpenAccordions = new Set<string>();
    if (!openAccordions.has(accordionId)) {
      newOpenAccordions.add(accordionId);
    }
    openAccordions = newOpenAccordions;
  }

  // body 클래스 업데이트
  function updateBodyClass() {
    if (browser) {
      if (isExpanded) {
        document.body.classList.remove('body-collapsed');
        document.body.classList.add('body-pd');
      } else {
        document.body.classList.remove('body-pd');
        document.body.classList.add('body-collapsed');
      }
    }
  }

  // 네비게이션
  function navigateTo(route: string, params: Record<string, any> = {}) {
    const targetRoute = routeMap[route] || route;
    goto(targetRoute);
  }

  // 파트너 네비게이션
  function navigateToPartner(route: string, params: Record<string, any> = {}) {
    const targetRoute = routeMap[route] || route;
    const searchParams = new URLSearchParams(params);
    goto(`${targetRoute}?${searchParams.toString()}`);
  }

  // 로그아웃
  function handleLogout() {
    if (browser) {
      localStorage.removeItem('user_id');
      localStorage.removeItem('user_rate');
      localStorage.removeItem('user_name');
      localStorage.removeItem('classify');
      sessionStorage.removeItem('currentPage');
      localStorage.removeItem('currentPage');
      
      document.cookie = 'SLtoken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      document.cookie = '3dSession=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      
      showToast("로그아웃 되었습니다.", "info");

      setTimeout(() => {
        window.location.replace('/');
      }, 1100);
    }
  }

  // 메뉴 데이터 로드
  async function loadMenuData() {
    if (!$authStore.isAuthenticated) return;

    try {
      const code = browser ? localStorage.getItem("code") || '' : '';
      const params = new URLSearchParams({
        classify: classify,
        rate: rate,
        userId: userId ?? '',
        partnerCode: code,
      });

      const response = await fetch('/api/LeftMenu?' + params.toString());
      const json = await response.json();

      if (json.success) {
        leftMenuData.set({
          C_dupli: json.C_dupli,
          terminalCount: json.terminalCount,
          inactiveCount: json.inactiveCount,
          realtimeState: json.realtimeState,
          t_realtimeState: json.t_realtimeState,
          commissionBalance: json.commissionBalance,
          notifyRateMap: json.notifyRateMap,
          pathNotifyCount: json.pathNotifyCount,
        });
      }
    } catch (err) {
      console.error('메뉴 데이터 로드 실패:', err);
    }
  }

  // 컴포넌트 마운트 시 초기화
  onMount(() => {
    if (browser) {
      // 화면 크기에 따른 기본값 설정
      const isMobile = window.innerWidth <= 991;
      
      // 사이드바 상태 복원
      const savedState = localStorage.getItem('sidebarExpanded');
      if (savedState !== null) {
        isExpanded = JSON.parse(savedState);
      } else {
        // 저장된 상태가 없으면 화면 크기에 따라 기본값 설정
        isExpanded = !isMobile; // 모바일에서는 false(슬림), 데스크톱에서는 true(확장)
      }
      
      updateBodyClass();

      // 메뉴 데이터 로드
      if ($authStore.isAuthenticated) {
        loadMenuData();
        fetchPartners();
      }
      
      // 화면 크기 변경 감지
      const handleResize = () => {
        const isMobile = window.innerWidth <= 991;
        // 모바일로 변경될 때만 자동으로 슬림 상태로 변경
        if (isMobile && isExpanded) {
          isExpanded = false;
          localStorage.setItem('sidebarExpanded', JSON.stringify(isExpanded));
          updateBodyClass();
          openAccordions = new Set(); // 모바일에서는 아코디언도 닫기
        }
      };
      
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
      <div class="nav__brand">
        <img 
          src="/img/icon/menu-outline.svg" 
          alt="메뉴 버튼" 
          class="nav__toggle menu_icon" 
          on:click={toggleSidebar} 
          on:keydown={toggleSidebar} 
        />
        <a 
          href="#" 
          on:click|preventDefault={() => navigateTo('Main')} 
          class="nav__logo"
        >
          Afixic {rate_name}
        </a>
      </div>

      <div class="moblie_menu">
        <!-- 홈으로 -->
        <a 
          href="#" 
          on:click|preventDefault={() => {
            navigateTo('Main');
            openAccordions = new Set(); // 홈으로 클릭 시 모든 아코디언 닫기
          }} 
          class="nav__link"
        >
          <img src="/img/icon/home-outline.svg" alt="홈 아이콘" class="nav__icon menu_icon" />
          <span class="nav_name">홈으로</span>
        </a>

        <div class="nav__list">
          <div class="accordion" id="accordionExample">
            
            <!-- 파트너관리 -->
            {#if rate === "p0" || rate !== ""}
              <div class="accordion-item">
                <h2 class="accordion-header">
                  <button
                    class="accordion-button {openAccordions.has('partner') ? 'active_menu' : 'collapsed'}"
                    style="--arrow-rotation: {openAccordions.has('partner') ? '180deg' : '0deg'}"
                    type="button"
                    on:click={() => toggleAccordion('partner')}
                  >
                    <img src="/img/icon/cube-outline.svg" alt="파트너 관리" class="menu_icon mg_r" />
                    파트너관리
                    {#if classify === '0'}
                      <a href="#" on:click|preventDefault={() => navigateTo('Partner_system')}>
                        <span class="partner_setting_btn">+</span>
                      </a>
                    {/if}
                  </button>
                </h2>
                
                {#if openAccordions.has('partner')}
                  <div class="accordion-collapse show">
                    <div class="accordion-body">
                      <ul>
                        {#if classify === '0' || classify === '1'}
                          {#each $partnerData as partner}
                            <li>
                              <a 
                                href="#" 
                                on:click|preventDefault={() => navigateToPartner('Partner_list', { 
                                  id: partner.id, 
                                  name: partner.partner_name, 
                                  rate: partner.rate 
                                })}
                              >
                                {partner.partner_name}
                                {#if $leftMenuData.notifyRateMap[String(partner.rate)]}
                                  <span class="info_mark level_info_mark"></span>
                                {/if}
                              </a>
                            </li>
                          {/each}
                        {/if}
                      </ul>
                    </div>
                  </div>
                {/if}
              </div>
            {/if}

            <!-- 가맹점관리 -->
            {#if classify !== '2'}
              <div class="accordion-item">
                <h2 class="accordion-header">
                  <button
                    class="accordion-button {openAccordions.has('store') ? 'active_menu' : 'collapsed'}"
                    style="--arrow-rotation: {openAccordions.has('store') ? '180deg' : '0deg'}"
                    type="button"
                    on:click={() => toggleAccordion('store')}
                  >
                    <img src="/img/icon/storefront-outline.svg" alt="가맹점 관리" class="menu_icon mg_r" />
                    가맹점관리
                    {#if $leftMenuData.commissionBalance > 0 || $leftMenuData.terminalCount > 0}
                      <span class="info_mark"></span>
                    {/if}
                  </button>
                </h2>
                
                {#if openAccordions.has('store')}
                  <div class="accordion-collapse show">
                    <div class="accordion-body">
                      <ul>
                        <li>
                          <a href="#" on:click|preventDefault={() => navigateTo('StoreList')}>
                            가맹점 관리
                            {#if $leftMenuData.pathNotifyCount > 0}
                              <span class="info_mark level_info_mark"></span>
                            {/if}
                          </a>
                        </li>

                        {#if rate === 'p0' || rate === 'p1'}
                          <li>
                            <a href="#" on:click|preventDefault={() => navigateTo('Test_Commission')}>
                              정산 수수료 관리
                              {#if $leftMenuData.commissionBalance > 0}
                                <span class="c_count">{$leftMenuData.commissionBalance}</span>
                              {/if}
                            </a>
                          </li>
                        {/if}

                        {#if classify === '0' || classify === '1'}
                          <li>
                            <a href="#" on:click|preventDefault={() => navigateTo('Terminal_expirydate_list')}>
                              1년 경과 TID
                              {#if $leftMenuData.terminalCount > 0}
                                <span class="c_count">{$leftMenuData.terminalCount}</span>
                              {/if}
                            </a>
                          </li>

                          <li>
                            <a href="#" on:click|preventDefault={() => navigateTo('Terminal_inactive_list')}>
                              장기 미사용 TID
                              {#if $leftMenuData.inactiveCount > 0}
                                <span class="c_count">{$leftMenuData.inactiveCount}</span>
                              {/if}
                            </a>
                          </li>
                        {/if}
                      </ul>
                    </div>
                  </div>
                {/if}
              </div>
            {/if}

            <!-- 결제내역관리 -->
            <div class="accordion-item">
              <h2 class="accordion-header">
                <button
                  class="accordion-button {openAccordions.has('payment') ? 'active_menu' : 'collapsed'}"
                  style="--arrow-rotation: {openAccordions.has('payment') ? '180deg' : '0deg'}"
                  type="button"
                  on:click={() => toggleAccordion('payment')}
                >
                  <img src="/img/icon/newspaper-outline.svg" alt="결제내역 관리" class="menu_icon mg_r" />
                  결제내역 관리
                  {#if $leftMenuData.C_dupli > 0}
                    <span class="info_mark"></span>
                  {/if}
                </button>
              </h2>
              
              {#if openAccordions.has('payment')}
                <div class="accordion-collapse show">
                  <div class="accordion-body">
                    <ul>
                      <li><a href="#" on:click|preventDefault={() => navigateTo('Terminal_pay')}>결제내역</a></li>
                      {#if classify === '0' || classify === '2'}
                        <li><a href="#" on:click|preventDefault={() => navigateTo('Terminal_sales_list')}>매출내역</a></li>
                      {:else if classify === '1'}
                        <li><a href="#" on:click|preventDefault={() => navigateTo('Patner_Terminal_sales_list')}>매출내역</a></li>
                      {/if}

                      {#if classify === '0'}
                        <li>
                          <a href="#" on:click|preventDefault={() => navigateTo('Duplicate_payment_list')}>
                            중복결제알림
                            {#if $leftMenuData.C_dupli > 0}
                              <span class="c_count">{$leftMenuData.C_dupli}</span>
                            {/if}
                          </a>
                        </li>
                      {/if}
                    </ul>
                  </div>
                </div>
              {/if}
            </div>

            <!-- 정산관리 -->
            <div class="accordion-item">
              <h2 class="accordion-header">
                <button
                  class="accordion-button {openAccordions.has('payment2') ? 'active_menu' : 'collapsed'}"
                  style="--arrow-rotation: {openAccordions.has('payment2') ? '180deg' : '0deg'}"
                  type="button"
                  on:click={() => toggleAccordion('payment2')}
                >
                  <img src="/img/icon/receipt-outline.svg" alt="정산관리" class="menu_icon mg_r" />
                  정산관리
                </button>
              </h2>
              
              {#if openAccordions.has('payment2')}
                <div class="accordion-collapse show">
                  <div class="accordion-body">
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
                </div>
              {/if}
            </div>

            <!-- 결제관리 (가맹점만) -->
            {#if classify === '2'}
              <div class="accordion-item">
                <h2 class="accordion-header">
                  <button
                    class="accordion-button {openAccordions.has('payment3') ? 'active_menu' : 'collapsed'}"
                    style="--arrow-rotation: {openAccordions.has('payment3') ? '180deg' : '0deg'}"
                    type="button"
                    on:click={() => toggleAccordion('payment3')}
                  >
                    <img src="/img/icon/credit-card.svg" class="menu_icon mg_r" alt="결제 아이콘" />
                    결제관리
                  </button>
                </h2>

                {#if openAccordions.has('payment3')}
                  <div class="accordion-collapse show">
                    <div class="accordion-body">
                      <ul>
                        <li><a href="#" on:click|preventDefault={() => navigateTo('Keyin')}>수기결제</a></li>
                        <li><a href="#" on:click|preventDefault={() => navigateTo('Pay_3d')}>인증결제</a></li>
                        <li><a href="#" on:click|preventDefault={() => navigateTo('Keyin_FailList')}>결제실패내역</a></li>
                      </ul>
                    </div>
                  </div>
                {/if}
              </div>
            {/if}

            <!-- 정보수정 -->
            <a 
              href="#" 
              on:click|preventDefault={() => {
                navigateTo(myInfo);
                openAccordions = new Set(); // 정보수정 클릭 시 모든 아코디언 닫기
              }} 
              class="nav__link"
            >
              <img src="/img/icon/toggle-outline.svg" alt="정보수정" class="nav__icon menu_icon" />
              <span class="nav_name">정보수정</span>
            </a>
          </div>
        </div>

        <!-- 로그아웃 버튼 -->
        <a href="#" on:click|preventDefault={handleLogout} class="nav__link">
          <img src="/img/icon/log-out-outline.svg" alt="로그아웃 아이콘" class="nav__icon" />
          <span class="nav_name">로그아웃</span>
        </a>
      </div>
    </div>
  </nav>
</div>