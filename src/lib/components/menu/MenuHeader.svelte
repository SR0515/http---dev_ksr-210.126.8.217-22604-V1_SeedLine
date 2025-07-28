<script lang="ts">
  import { navigateTo } from '$lib/utils/menuUtils';
  
  export let toggleSidebar: () => void;
  export let rateName: string;
  
  function handleHomeClick() {
    navigateTo('Main');
  }
</script>

<div class="nav__brand">
  <img 
    src="/img/icon/menu-outline.svg" 
    alt="메뉴 버튼" 
    class="nav__toggle menu_icon" 
    on:click={toggleSidebar} 
    on:keydown={toggleSidebar} 
  />
  <a 
    href="#" 
    on:click|preventDefault={handleHomeClick} 
    class="nav__logo"
  >
    {rateName}
  </a>
</div>