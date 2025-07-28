import { writable } from 'svelte/store';

// 기존 pageStore.js와 동일한 페이지 상태 관리
export interface NavigationState {
	currentPage: string;
	pageParams: Record<string, any>;
}

export const navigationStore = writable<NavigationState>({
	currentPage: 'Dashboard',
	pageParams: {}
});

// 기존 navigateTo.js와 동일한 네비게이션 함수
export function navigateTo(page: string, params: Record<string, any> = {}): void {
	if (typeof window === 'undefined') return;

	// 세션 스토리지에 현재 페이지 저장 (기존 시스템과 동일)
	sessionStorage.setItem('currentPage', page);
	sessionStorage.setItem('pageParams', JSON.stringify(params));

	// Store 업데이트
	navigationStore.set({
		currentPage: page,
		pageParams: params
	});

	// 기존 시스템과 동일한 pageChange 이벤트 발생
	window.dispatchEvent(new CustomEvent('pageChange', {
		detail: { page, ...params }
	}));
}

// 페이지 복원 (기존 시스템과 동일)
export function restoreNavigation(): void {
	if (typeof window === 'undefined') return;

	const savedPage = sessionStorage.getItem('currentPage');
	const savedParams = sessionStorage.getItem('pageParams');

	if (savedPage) {
		const params = savedParams ? JSON.parse(savedParams) : {};
		navigationStore.set({
			currentPage: savedPage,
			pageParams: params
		});
	}
}