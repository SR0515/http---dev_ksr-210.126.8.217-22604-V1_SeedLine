<script lang="ts">
    import { onMount, tick } from 'svelte';
    import { authStore } from '$lib/stores/auth';
    import { checkDuplicate} from '$lib/utils/Duplicate_check'; 
    import { toggleInputVisibility } from '$lib/utils/writeUtils';
    import { on } from 'svelte/events';
    import type {StoreListData} from '$lib/types/store'
    import { getDefaultStoreListData} from '$lib/utils/editUtils'

    $: classify = $authStore.classify;

    export let settlement_commission = 0; 
    export let disabled = false;
    export let userData = getDefaultStoreListData();

    $: if ( userData ) {
        tick().then(() => {
        toggleInputVisibility();
        });
    }
</script>

    <div class="info_text">
        <h3>사업자정보</h3>
        <span class="">*사업자 회원만 해당</span>
    </div>
    <div class="agency_form border-bottom">        
        <div class="d-flex">
            <dl class="col-12 col-lg-6">
                <dt>사업자번호</dt>
                <dd>
                    <div class="form_input"><input type="text" class="input" name="business_number" value=""/></div>
                </dd>
            </dl>
    
            <dl class="col-12 col-lg-6">
                <dt>법인번호</dt>
                <dd>
                    <div class="form_input"><input type="text" class="input" name="corporate_number" value="" /></div>
                </dd>
            </dl>
        </div>
    
        <div class="d-flex">
            <dl class="col-12 col-lg-6">
                <dt>업태</dt>
                <dd>
                    <div class="form_input"><input type="text" class="input" name="business_condition" value="" /></div>
                </dd>
            </dl>
            <dl class="col-12 col-lg-6">
                <dt>종목</dt>
                <dd>
                    <div class="form_input"><input type="text" class="input" name="business_subject" value=""/></div>
                </dd>
            </dl>
        </div>
    </div>