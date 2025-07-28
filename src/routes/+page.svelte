<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { authStore } from '$lib/stores/auth';

	let isLoading = true;

	onMount(() => {
		// 기존 시스템과 동일한 인증 체크 로직
		setTimeout(() => {
			if ($authStore.isAuthenticated) {
				// 인증된 사용자 - 대시보드로 이동
				goto('/dashboard');
			} else {
				// 미인증 사용자 - 로그인 페이지로 이동
				goto('/login');
			}
			isLoading = false;
		}, 100);
	});
</script>

{#if isLoading}
	<div class="loading-container">
		<div class="loading-content">
			<h1>SEEDLINE V1</h1>
			<p>SvelteKit Edition</p>
			<div class="loading-spinner"></div>
		</div>
	</div>
{/if}

<style>
	.loading-container {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100vh;
		background: linear-gradient(135deg, #a72525 0%, #8b1e1e 100%);
		color: white;
	}
	
	.loading-content {
		text-align: center;
		animation: fadeIn 0.8s ease-in;
	}
	
	h1 {
		font-size: 3rem;
		font-weight: 300;
		margin-bottom: 0.5rem;
		letter-spacing: 2px;
	}
	
	p {
		font-size: 1.2rem;
		opacity: 0.8;
		margin-bottom: 2rem;
	}
	
	.loading-spinner {
		width: 40px;
		height: 40px;
		border: 3px solid rgba(255, 255, 255, 0.3);
		border-top: 3px solid white;
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin: 0 auto;
	}
	
	@keyframes fadeIn {
		from { opacity: 0; transform: translateY(20px); }
		to { opacity: 1; transform: translateY(0); }
	}
	
	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}
</style>
