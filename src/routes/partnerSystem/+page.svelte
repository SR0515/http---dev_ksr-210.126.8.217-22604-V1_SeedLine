<script lang="ts">
    import { writable } from 'svelte/store';
    import { onMount, onDestroy } from 'svelte';
    import { goto } from '$app/navigation';
    import { get } from 'svelte/store';
    import { authStore } from '$lib/stores/auth';
    import { showToast } from '$lib/stores/toast';
    import LogsLoadingSpinner from '$lib/components/logs/LogsLoadingSpinner.svelte'; //로딩중
    import LogsErrorBoundary from '$lib/components/logs/LogsErrorBoundary.svelte';
    import LeftMenu from '$lib/components/LeftMenu.svelte';
    import Layout from '$lib/components/partnerSystem/Layout.svelte';
    import PartnerStructure from '$lib/components/partnerSystem/PartnerStructure.svelte';
    import PartnerList from '$lib/components/partnerSystem/PartnerList.svelte';
    import Modal from '$lib/components/partnerSystem/Modal.svelte';
</script>

<LeftMenu />
<Layout>
    <PartnerStructure />
    <PartnerList />
    <Modal />
</Layout>