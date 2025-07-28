// LeftMenu 설정 데이터

// 라우팅 맵 - 구현된 페이지만
export const MENU_ROUTES = {
  main: '/dashboard',
  Main: '/dashboard',
  // 정산관리 페이지들
  S_settlement_list: '/settlement/store',
  P_settlement_list: '/settlement/partner',
  A_transfer_list: '/settlement/transfer'
} as const;

// 화면 크기 및 기본 설정
export const MENU_CONFIG = {
  SCREEN_SIZES: {
    mobile: 991
  },
  TIMEOUTS: {
    logout: 1100
  },
  STORAGE_KEYS: {
    sidebarExpanded: 'sidebarExpanded',
    userInfo: ['user_id', 'user_rate', 'user_name', 'classify'] as const,
    session: ['currentPage'] as const,
    cookies: ['SLtoken', '3dSession'] as const
  }
} as const;

// 사용자 정보 매핑
export const getUserInfo = (classify: string) => {
  const infoMap = {
    '0': { route: '/settings/admin', name: '관리자' },
    '1': { route: '/settings/partner', name: '파트너' },
    '2': { route: '/settings/store', name: '가맹점' }
  };
  return infoMap[classify as keyof typeof infoMap] || infoMap['2'];
};

// 현재 경로에 따른 아코디언 매핑
export const getAccordionByPath = (currentPath: string): string => {
  // 정보수정 페이지는 아코디언을 열지 않음 (로그 페이지도 settings 하위로 이동)
  if (currentPath.includes('/settings/')) {
    return '';
  }

    // 정산관리 관련 페이지들 (settlement을 가장 먼저 체크 - 우선순위 높음)
  if (currentPath.startsWith('/settlement/')) {
    return 'payment2';
  }
  
  // 파트너관리 관련 페이지
  if (currentPath.includes('/partner') || currentPath.includes('/agency') || currentPath.includes('/distributor')) {
    return 'partner';
  } 
  // 가맹점관리 관련 페이지
  else if (currentPath.includes('/store') || currentPath.includes('/terminal') || currentPath.includes('/test')) {
    return 'store';
  } 
  // 결제관리 관련 페이지들
  else if (currentPath.includes('/terminal-pay') || currentPath.includes('/duplicate') || currentPath.includes('/payment')) {
    return 'payment';
  } else if (currentPath.includes('/keyin') || currentPath.includes('/pay')) {
    return 'payment3';
  }
  return '';
};