<script>
    import { page } from '$app/stores';
    import { onMount } from 'svelte';
    
    let currentYear = 2025;
    let isMobile = false;
    
    // 현재 페이지가 로그인 페이지인지 확인
    $: isLoginPage = $page.url.pathname === '/login' || $page.url.pathname === '/';
    
    onMount(() => {
        // 모바일인지 확인
        const checkMobile = () => {
            isMobile = window.innerWidth <= 991;
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        
        return () => {
            window.removeEventListener('resize', checkMobile);
        };
    });
    
    // 모바일에서 로그인 페이지가 아니면 Footer 숨기기
    $: shouldShowFooter = !isMobile || isLoginPage;
</script>

{#if shouldShowFooter}
<footer class:login-footer={isLoginPage}>
  <p>COPYRIGHT © {currentYear} SeedLine ALL RIGHTS RESERVED</p>
</footer>
{/if}

<style>
  footer {
    text-align: center;
    padding: 15px 0;
    background-color: #f8f9fa;
    border-top: 1px solid #e9ecef;
  }
  
  /* 로그인 페이지 Footer */
  footer.login-footer {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: transparent;
    border-top: none;
    padding: 10px 0;
  }
  
  p {
    margin: 0;
    color: #6c757d;
    font-size: 11px;
  }
  
  /* 로그인 페이지에서의 텍스트 색상 */
  footer.login-footer p {
    color: rgba(255, 255, 255, 0.6);
  }
    /* 로그인 페이지 Footer - 화면이 작을 때 */
  @media (max-height: 500px) {
    :global(.body_login) footer {
      display: none;
    }
  }
</style>