<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { goto } from '$app/navigation';
	import { authStore, setAuth } from '$lib/stores/auth';
	import { showToast } from '$lib/stores/toast';
	import Toast from '$lib/components/Toast.svelte';
	import '$lib/styles/login.css';

	let user_id = '';
	let user_pass = '';
	let loading = false;
	let clientIP = '';

	onMount(async () => {
		if ($authStore.isAuthenticated) {
			goto('/dashboard');
			return;
		}

		// SvelteKit 방식: reactive하게 body 클래스 관리
		try {
			const response = await fetch('https://api.ipify.org?format=json');
			const data = await response.json();
			clientIP = data.ip;
		} catch (err) {
			console.error('IP 조회 실패:', err);
		}
	});

	async function handleLogin(event: Event) {
		event.preventDefault();
		
		if (!user_id) {
			showToast('아이디를 입력해주세요.', 'error');
			return;
		}

		if (!user_pass) {
			showToast('비밀번호를 입력해주세요.', 'error');
			return;
		}

		loading = true;
		
		try {
			const response = await fetch('/api/seedline/loginOk', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ 
					user_id,
					user_pass,
					ip: clientIP
				})
			});

			const data = await response.json();
			console.log('서버 응답 데이터:', data);

			if (!response.ok || data?.success !== true) {
				showToast(data?.message || '로그인에 실패했습니다.', 'error');
				return;
			}

			const sessionData = data.sessionData;
			
			localStorage.setItem('user_id', sessionData.ID);
			localStorage.setItem('user_name', sessionData.name || '');
			localStorage.setItem('user_rate', sessionData.rate || '');
			localStorage.setItem('user_code', sessionData.usercode || '');
			
			if (sessionData.rate === 'p0') {
				localStorage.setItem('classify', '0');
			} else if (sessionData.rate !== 'p0' && sessionData.rate !== '') {
				localStorage.setItem('classify', '1');
			} else if (sessionData.rate !== 'p0' && sessionData.rate === '') {
				localStorage.setItem('classify', '2');
			}
			
			localStorage.setItem('sessionData', JSON.stringify(sessionData));

			// 쿠키 설정 (원본과 동일)
			document.cookie = `SLtoken=${sessionData.SLtoken}; path=/; max-age=43200; secure=false; samesite=strict`;

			// 원본과 동일한 방식: 페이지 새로고침
			window.location.reload();

		} catch (err) {
			console.error('로그인 중 오류 발생:', err);
			const errorMessage = err instanceof Error ? err.message : String(err);
			if (errorMessage.includes('ETIMEDOUT') || errorMessage.includes('timeout')) {
				showToast('서버 연결 시간이 초과되었습니다. 네트워크 상태를 확인해주세요.', 'error');
			} else {
				showToast('네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.', 'error');
			}
		} finally {
			loading = false;
		}
	}
</script>

<Toast />

<div class="login_container">
	<div class="login_wrap">
		<div class="login_box_wrap">
			<div class="login_box">
				<form on:submit={handleLogin} class="login_input_wrap" method="post">
					<input type="hidden" name="current_agent" id="current_agent" />
					<h2 class="login_text">로그인</h2>
					<p>본서비스는 허가받은 업체만<br>이용가능한 서비스입니다.</p>
					<ul class="login_input">
						<li class="id_inputt li_t">
							<input 
								type="text" 
								name="user_id" 
								id="user_id"
								bind:value={user_id}
								class="form-control"
								placeholder="아이디를 입력해주세요." 
								disabled={loading}
							/>
							<svg enable-background="new 0 0 32 32" height="23" viewBox="0 0 32 32" width="23" xmlns="http://www.w3.org/2000/svg">
								<g id="Layer_1">
									<g fill="#aaa">
										<path fill="#aaa"
											d="m27.9795 8h-7.4717l.3594-2.873c.0674-.5381-.1006-1.0801-.459-1.4868-.3594-.4068-.8769-.6402-1.4199-.6402h-5.9766c-.543 0-1.0605.2334-1.4199.6401-.3584.4067-.5264.9487-.459 1.4873l.3594 2.8726h-7.4717c-1.665 0-3.0205 1.355-3.0205 3.02v14.96c0 1.665 1.3555 3.02 3.0205 3.02h23.959c1.665 0 3.0205-1.355 3.0205-3.02v-14.96c0-1.665-1.3555-3.02-3.0205-3.02zm-9.1123-3-.75 6h-4.2344l-.75-6zm10.1328 20.98c0 .5625-.458 1.02-1.0205 1.02h-23.959c-.5625 0-1.0205-.4575-1.0205-1.02v-14.96c0-.5625.458-1.02 1.0205-1.02h7.7219l.1678 1.3413c.1171.9458.9248 1.6587 1.8779 1.6587h4.4238c.9531 0 1.7607-.7129 1.8779-1.6582l.1679-1.3418h7.7218c.5625 0 1.0205.4575 1.0205 1.02z" />
										<path fill="#aaa" d="m26 16h-20c-.5527 0-1 .4478-1 1s.4473 1 1 1h20c.5527 0 1-.4478 1-1s-.4473-1-1-1z" />
										<path fill="#aaa" d="m16 21h-10c-.5527 0-1 .4478-1 1s.4473 1 1 1h10c.5527 0 1-.4478 1-1s-.4473-1-1-1z" />
									</g>
								</g>
							</svg>                        
						</li>

						<li class="mt-3 pass_inputt li_t">
							<input 
								type="password" 
								id="user_pass"
								name="user_pass"
								bind:value={user_pass}
								class="form-control" 
								placeholder="비밀번호를 입력해주세요."  
								disabled={loading}
							/>
							<svg id="Layer_1" enable-background="new 0 0 34 34"  viewBox="0 0 34 34" width="25" height="25" xmlns="http://www.w3.org/2000/svg">
								<g><path fill="#aaa" d="m17 1c-5 0-9 4-9 9v4c-1.7 0-3 1.3-3 3v13c0 1.7 1.3 3 3 3h18c1.7 0 3-1.3 3-3v-13c0-1.7-1.3-3-3-3v-4c0-5-4-9-9-9zm10 16v13c0 .6-.4 1-1 1h-18c-.6 0-1-.4-1-1v-13c0-.6.4-1 1-1h1 16 1c.6 0 1 .4 1 1zm-17-3v-4c0-3.9 3.1-7 7-7s7 3.1 7 7v4z"/>
									<path fill="#aaa" d="m17 19c-1.7 0-3 1.3-3 3 0 1.3.8 2.4 2 2.8v2.2c0 .6.4 1 1 1s1-.4 1-1v-2.2c1.2-.4 2-1.5 2-2.8 0-1.7-1.3-3-3-3zm0 4c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1z"/></g>
							</svg>
						</li>
					</ul>

					<div class="login_btn">
						<button type="submit" class="btn btn-primary login-submit-btn" disabled={loading}>
							{loading ? '로그인 중...' : '로그인'}
						</button>
					</div>
				</form>             
			</div>        
		</div>
	</div>
</div>

<style>
	.login_container {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100vh;
		display: flex;
		justify-content: center;
		align-items: center;
		background: #eaeef2 url('/img/login_bg.png') no-repeat center center;
		background-size: cover;
		overflow: hidden;
		/* Footer 영향 방지 */
		z-index: 1;
		/* 최소 높이 보장 */
		min-height: 500px;
	}
	
	/* 불필요한 중첩 구조 제거, 직접 중앙 정렬 */
	.login_wrap {
		width: 100%;
		max-width: 500px;
		padding: 0 20px;
		/* Footer와 겹치지 않도록 여백 확보 */
		margin-bottom: 60px;
	}
	
	/* Footer가 있어도 영향받지 않도록 */
	:global(.body_login) {
		overflow: hidden;
	}
	
	:global(.body_login footer) {
		z-index: 2; /* login_container보다 위에 */
	}
	
	/* 화면이 작을 때 Footer 숨기기 */
	@media (max-height: 600px) {
		:global(.body_login footer) {
			display: none;
		}
		
		.login_container {
			padding: 20px;
		}
		
		.login_wrap {
			margin-bottom: 0; /* Footer 없으니 여백도 제거 */
		}
	}
	
	@media (max-width: 640px) {
		.login_container {
			padding: 20px;
		}
	}
</style>

{#if loading}
	<div class="alert_mask" id="alert_mask"></div>
	<div class="alert_popup qr_ok_popup loading_popup">
		<div class="qr_wrap">
			<div class="qrok_title">
				<div class="loader"></div>
				<h5>처리중 입니다.<br>잠시만 기다려주세요.</h5>
			</div>
		</div>
	</div>
{/if}