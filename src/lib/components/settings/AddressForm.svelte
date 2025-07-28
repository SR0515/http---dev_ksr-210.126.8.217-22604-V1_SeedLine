<script lang="ts">
    import { onMount } from 'svelte';
    import { initializeAddressSearch } from '$lib/utils/settingsUtils';

    export let addressValue = '';
    export let detailValue = '';
    export let disabled = false;
    export let required = false;

    const addressInputId = 'address';
    const detailInputId = 'address_detail';

    onMount(() => {
        if (!disabled) {
            initializeAddressSearch(addressInputId, detailInputId, (address) => {
                addressValue = address;
            });
        }
    });
</script>

<div class="d-flex">
    <dl class="col-12">
        <dt>사업장 주소</dt>
        <dd class="cd-flexa">
            <div class="form_input">
                <input 
                    type="text" 
                    class="input" 
                    id={addressInputId}
                    name="address"
                    bind:value={addressValue}
                    {disabled}
                    {required}
                />
            </div>
            {#if !disabled}
                <div class="search_address">
                    <div class="address_btn_box">
                        <button type="button" id="{addressInputId}_search">검색</button>
                    </div>
                </div>
            {/if}
        </dd>
    </dl>
</div>

<div class="d-flex">
    <dl class="col-12 mb_20px">
        <dt>상세주소</dt>
        <dd>
            <div class="form_input">
                <input 
                    type="text" 
                    class="input" 
                    id={detailInputId}
                    name="address_detail"
                    bind:value={detailValue}
                    {disabled}
                    {required}
                />
            </div>
        </dd>
    </dl>
</div>