// 기존 시스템과 동일한 접근 제어 로직

// 관리자만 접근 가능
export function adminAccess(): boolean {
	if (typeof window === 'undefined') return false;
	const classify = localStorage.getItem('classify');
	return classify === '0';
}

// 관리자/대행사만 접근 가능 
export function adminDistributorAccess(): boolean {
	if (typeof window === 'undefined') return false;
	const classify = localStorage.getItem('classify');
	const rate = localStorage.getItem('user_rate') || '';
	
	return classify === '0' || (classify === '1' && rate === 'p1');
}

// 관리자/대행사/에이전시까지 접근 가능
export function adminPartnerAccess(): boolean {
	if (typeof window === 'undefined') return false;
	const classify = localStorage.getItem('classify');
	
	return classify === '0' || classify === '1';
}

// 기존 authCheck.js와 동일한 인증 체크
export async function checkAuth(page: string): Promise<boolean> {
	if (typeof window === 'undefined') return false;
	
	const classify = localStorage.getItem('classify');
	const rate = localStorage.getItem('user_rate');
	const userId = localStorage.getItem('user_id');
	
	if (!classify || !rate || !userId) {
		return false;
	}
	
	// 페이지별 권한 체크 (기존 시스템과 동일)
	switch (page) {
		case 'store_list':
		case 'store_write':
		case 'store_edit':
		case 'PartnerList':
		case 'Terminal_pay':
			return adminPartnerAccess();
		case 'admin_setting':
			return adminAccess();
		case '3dpay':
			return adminPartnerAccess();
		case 'S_commission':
			return adminPartnerAccess();
		default:
			return true;
	}
}

// 페이지 리다이렉트 (기존 시스템과 동일한 방식)
export function redirectToLogin(): void {
	if (typeof window === 'undefined') return;
	
	// 기존 시스템과 동일한 방식으로 로그인 페이지로 이동
	const savedPage = sessionStorage.getItem('currentPage');
	if (savedPage) {
		window.dispatchEvent(new CustomEvent('pageChange', { 
			detail: { page: 'Login' } 
		}));
	} else {
		window.location.href = '/login';
	}
}