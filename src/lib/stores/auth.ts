import { writable, type Writable } from 'svelte/store';

// 기존 시스템과 동일한 인증 상태 구조
export interface AuthState {
	isAuthenticated: boolean;
	classify: string;  // '0' = 관리자, '1' = 파트너, '2' = 가맹점
	rate: string;      // 파트너 등급 (p0-p12)
	userId: string;
	userName: string;
	userCode?: string;
}

// 전역 인증 상태 store
export const authStore: Writable<AuthState> = writable({
	isAuthenticated: false,
	classify: '',
	rate: '',
	userId: '',
	userName: '',
	userCode: ''
});

// 기존 시스템과 동일한 localStorage 키 사용
export function initAuth(): boolean {
	if (typeof window === 'undefined') return false;
	
	const classify = localStorage.getItem('classify');
	const rate = localStorage.getItem('user_rate');
	const userId = localStorage.getItem('user_id');
	const userName = localStorage.getItem('user_name');
	const userCode = localStorage.getItem('user_code');

	if (classify && userId && userName) {
		authStore.set({
			isAuthenticated: true,
			classify,
			rate: rate || '',
			userId,
			userName: userName || '',
			userCode: userCode || ''
		});
		return true;
	}
	return false;
}

// 로그인 처리 (기존 시스템과 동일한 방식)
export function setAuth(authData: {
	classify: string;
	rate: string;
	userId: string;
	userName: string;
	userCode?: string;
}): void {
	if (typeof window === 'undefined') return;

	// localStorage에 저장 (기존 시스템과 동일한 키)
	localStorage.setItem('classify', authData.classify);
	localStorage.setItem('user_rate', authData.rate);
	localStorage.setItem('user_id', authData.userId);
	localStorage.setItem('user_name', authData.userName);
	if (authData.userCode) {
		localStorage.setItem('user_code', authData.userCode);
	}

	// Store 업데이트
	authStore.set({
		isAuthenticated: true,
		...authData
	});
}

// 로그아웃 처리 (기존 시스템과 동일한 방식)
export function logout(): void {
	if (typeof window === 'undefined') return;

	// localStorage 정리 (기존 시스템과 동일한 키)
	localStorage.removeItem('classify');
	localStorage.removeItem('user_rate');
	localStorage.removeItem('user_id');
	localStorage.removeItem('user_name');
	localStorage.removeItem('user_code');
	sessionStorage.removeItem('currentPage');
	localStorage.removeItem('currentPage');

	// Store 초기화
	authStore.set({
		isAuthenticated: false,
		classify: '',
		rate: '',
		userId: '',
		userName: '',
		userCode: ''
	});
}

// LeftMenu에서 사용하는 clearAuth alias
export const clearAuth = logout;