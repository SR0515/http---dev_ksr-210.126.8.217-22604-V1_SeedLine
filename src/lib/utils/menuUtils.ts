import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { showToast } from '$lib/stores/toast';
import { leftMenuData } from '$lib/stores/leftMenu';
// import { fetchPartners } from '$lib/stores/partner';
import { authStore } from '$lib/stores/auth';
import { get } from 'svelte/store';
import { MENU_CONFIG, MENU_ROUTES } from '$lib/config/leftMenu.config';

// body 클래스 업데이트
export const updateBodyClass = (isExpanded: boolean) => {
  if (browser) {
    if (isExpanded) {
      document.body.classList.remove('body-collapsed');
      document.body.classList.add('body-pd');
    } else {
      document.body.classList.remove('body-pd');
      document.body.classList.add('body-collapsed');
    }
  }
};

// 메뉴 데이터 로드
export const loadMenuData = async () => {
  const auth = get(authStore);
  if (!auth.isAuthenticated) return;

  try {
    const code = browser ? localStorage.getItem("user_code") || '' : '';
    const params = new URLSearchParams({
      classify: auth.classify,
      rate: auth.rate,
      userId: auth.userId ?? '',
      partner_code: code,
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
};

// 로그아웃 처리
export const handleLogout = () => {
  if (browser) {
    // 사용자 정보 제거
    MENU_CONFIG.STORAGE_KEYS.userInfo.forEach(key => {
      localStorage.removeItem(key);
    });
    
    // 세션 정보 제거
    MENU_CONFIG.STORAGE_KEYS.session.forEach(key => {
      sessionStorage.removeItem(key);
      localStorage.removeItem(key);
    });
    
    // 쿠키 제거
    MENU_CONFIG.STORAGE_KEYS.cookies.forEach(cookieName => {
      document.cookie = `${cookieName}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
    });
    
    showToast("로그아웃 되었습니다.", "info");

    setTimeout(() => {
      window.location.replace('/');
    }, MENU_CONFIG.TIMEOUTS.logout);
  }
};

// 사이드바 초기화
export const initializeSidebar = () => {
  if (browser) {
    // 화면 크기에 따른 기본값 설정
    const isMobile = window.innerWidth <= MENU_CONFIG.SCREEN_SIZES.mobile;
    
    // 사이드바 상태 복원
    const savedState = localStorage.getItem(MENU_CONFIG.STORAGE_KEYS.sidebarExpanded);
    let isExpanded = false;
    
    if (savedState !== null) {
      isExpanded = JSON.parse(savedState);
    } else {
      // 저장된 상태가 없으면 화면 크기에 따라 기본값 설정
      isExpanded = !isMobile; // 모바일에서는 false(슬림), 데스크톱에서는 true(확장)
    }
    
    updateBodyClass(isExpanded);
    return isExpanded;
  }
  return false;
};

// 화면 크기 변경 핸들러 생성
export const createResizeHandler = (
  isExpanded: boolean, 
  updateExpanded: (value: boolean) => void,
  closeAccordions: () => void
) => {
  return () => {
    const isMobile = window.innerWidth <= MENU_CONFIG.SCREEN_SIZES.mobile;
    // 모바일로 변경될 때만 자동으로 슬림 상태로 변경
    if (isMobile && isExpanded) {
      updateExpanded(false);
      localStorage.setItem(MENU_CONFIG.STORAGE_KEYS.sidebarExpanded, JSON.stringify(false));
      updateBodyClass(false);
      closeAccordions(); // 모바일에서는 아코디언도 닫기
    }
  };
};

// 네비게이션 함수
export const navigateTo = (route: string, params: Record<string, any> = {}) => {
  // 설정 페이지 라우트 처리
  if (route.startsWith('/settings/')) {
    goto(route);
    return;
  }
  
  const targetRoute = MENU_ROUTES[route as keyof typeof MENU_ROUTES] || route;
  goto(targetRoute);
};

// 파트너 네비게이션 함수
export const navigateToPartner = (route: string, params: Record<string, any> = {}) => {
  const targetRoute = MENU_ROUTES[route as keyof typeof MENU_ROUTES] || route;
  const searchParams = new URLSearchParams(params);
  goto(`${targetRoute}?${searchParams.toString()}`);
};