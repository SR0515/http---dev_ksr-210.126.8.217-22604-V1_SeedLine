<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { authStore, initAuth } from '$lib/stores/auth';
	import { restoreNavigation } from '$lib/stores/navigation';
	import Toast from '$lib/components/Toast.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import '../app.css';

	// 앱 초기화
	onMount(() => {
		// 기존 시스템과 동일한 방식으로 인증 상태 복원
		const isAuthenticated = initAuth();
		
		// 네비게이션 상태 복원
		restoreNavigation();
		
		// 로그인 후 리다이렉트 (원본과 동일한 로직)
		const currentPath = window.location.pathname;
		if (isAuthenticated && (currentPath === '/login' || currentPath === '/')) {
			goto('/dashboard');
		} else if (!isAuthenticated && currentPath !== '/login' && currentPath !== '/') {
			goto('/login');
		}
		
		// 페이지 변경 시 body 클래스 설정 - 사이드바 상태 유지
		function updateBodyClass() {
			if (typeof document !== 'undefined') {
				const currentPath = window.location.pathname;
				if (currentPath === '/login' || currentPath === '/') {
					// 로그인 페이지에서만 클래스 초기화
					document.body.classList.remove('body-pd', 'body-collapsed');
					document.body.classList.add('body_login');
				} else {
					// 로그인이 아닌 페이지에서는 사이드바 상태 유지
					document.body.classList.remove('body_login');
					// 기존 body-pd나 body-collapsed 상태를 유지
				}
			}
		}
		
		// 초기 body 클래스 설정
		updateBodyClass();
		
		// 기존 시스템의 pageChange 이벤트 리스너 (호환성)
		function handlePageChange(event: CustomEvent) {
			console.log('Page change event:', event.detail);
			// 페이지 변경 시 body 클래스도 업데이트
			setTimeout(updateBodyClass, 100);
		}
		
		window.addEventListener('pageChange', handlePageChange as EventListener);
		
		// URL 변경 감지 (브라우저 뒤로가기/앞으로가기)
		window.addEventListener('popstate', updateBodyClass);
		
		return () => {
			window.removeEventListener('pageChange', handlePageChange as EventListener);
			window.removeEventListener('popstate', updateBodyClass);
		};
	});
	
	// SvelteKit 반응형 방식으로 body 클래스 관리 - 사이드바 상태 유지
	$: if (typeof window !== 'undefined' && $page.url.pathname) {
		const currentPath = $page.url.pathname;
		const isLoginPage = currentPath === '/login' || currentPath === '/';
		
		if (isLoginPage) {
			document.body.className = 'body_login';
			document.body.id = '';
		} else {
			// 로그인이 아닌 페이지에서는 기존 사이드바 상태 유지
			// LeftMenu 컴포넌트가 토글 상태를 관리하도록 함
			if (!document.body.classList.contains('body-pd') && !document.body.classList.contains('body-collapsed')) {
				// 사이드바 상태가 설정되지 않은 경우에만 기본값 설정
				const savedState = localStorage.getItem('sidebarExpanded');
				if (savedState !== null) {
					const isExpanded = JSON.parse(savedState);
					if (isExpanded) {
						document.body.classList.add('body-pd');
					} else {
						document.body.classList.add('body-collapsed');
					}
				} else {
					document.body.classList.add('body-pd'); // 기본값
				}
			}
			document.body.id = 'body-pd';
		}
	}

	// SvelteKit 방식의 라우팅 보호
	$: if (typeof window !== 'undefined') {
		const publicRoutes = ['/login', '/'];
		const currentPath = $page.url.pathname;
		
		if (!$authStore.isAuthenticated && !publicRoutes.includes(currentPath)) {
			goto('/login');
		}
	}
</script>

<Toast />

<div class="app">
	<main>
		<slot />
		<Footer />
	</main>
</div>

<style>
	.app {
		height: 100vh;
		display: flex;
		flex-direction: column;
		background-color: #f8f9fa;
		overflow: hidden;
	}
	
	main {
		flex: 1;
		padding: 0;
		overflow-y: auto;
		position: relative;
		display: flex;
		flex-direction: column;
	}
	
	/* slot이 flex-grow로 남은 공간 차지 */
	main :global(> *:not(footer)) {
		flex: 1 0 auto;
	}
	
	/* Footer는 항상 하단에 */
	main :global(footer) {
		flex-shrink: 0;
	}
	
	/* 로그인 페이지에서는 회색 배경 제거 */
	:global(body.body_login) .app {
		background-color: transparent;
	}
	
	/* 기존 시스템과 동일한 전역 스타일 적용 */
	:global(body) {
		margin: 0;
		padding: 0;
		
		background-color: #f8f9fa;
		overflow: hidden; /* body에서 스크롤 방지 */
	}
	
	/* 로그인 페이지 body 배경 */
	:global(body.body_login) {
		background-color: transparent;
	}
	
	:global(*) {
		box-sizing: border-box;
	}
</style>