<script lang="ts">
    import { onMount, afterUpdate } from 'svelte';
    import MerchantCard from './MerchantCard.svelte';
    import type { MerchantData } from '$lib/types/commission';
    import { setupCardHoverEffects, validateCommissions } from '$lib/utils/store/commissionUtils';

    export let merchants: MerchantData[] = [];

    afterUpdate(() => {
        setTimeout(setupCardHoverEffects, 200);
        // merchants 데이터가 변경된 후 DOM 업데이트가 끝나고 실행됨
        setTimeout(() => {
            merchants.forEach((m) => validateCommissions(m.id, merchants));
        }, 100); 
    });
</script>

<section class="card_section">
    <div class="container">
        <div class="card-grid" id="cardGrid">
            {#each merchants as merchant, index (merchant.id)}
                <MerchantCard {merchant} {index} {merchants}/>
            {/each}        
        </div>
    </div>
</section>