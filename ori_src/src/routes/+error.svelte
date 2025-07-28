<script lang="ts">
	import { onMount, onDestroy } from 'svelte';

	onMount(() => {
		// 기존 시스템과 동일한 body 클래스 설정 (로그인 페이지 배경)
		if (typeof document !== 'undefined') {
			document.body.removeAttribute('id');
			document.body.classList.remove('body-pd');
			document.body.classList.add('body_login');
		}
	});

	onDestroy(() => {
		// body 클래스 정리
		if (typeof document !== 'undefined') {
			document.body.setAttribute('id', 'body-pd');
			document.body.classList.add('body-pd');
			document.body.classList.remove('body_login');
		}
	});
</script>

<div class="login_wrap">
	<div class="login_box_wrap">
		<div class="login_box">
			<div class="error-content">
				<h1>404 Error</h1>
			</div>
		</div>
	</div>
</div>

<style>
	.error-content {
		text-align: center;
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 200px;
	}

	.error-content h1 {
		color: #fff;
		font-size: 2rem;
		margin: 0;
		font-weight: 500;
	}
</style>