<script lang="ts">
    import { onMount, tick } from 'svelte';
    import { authStore } from '$lib/stores/auth';
    import { checkDuplicate} from '$lib/utils/Duplicate_check'; 
    import { toggleInputVisibility } from '$lib/utils/writeUtils';
    import { on } from 'svelte/events';
    import type {StoreListData} from '$lib/types/store'
    import { getDefaultStoreListData} from '$lib/utils/editUtils'

    $: classify = $authStore.classify;

    export let userData;

    export let settlement_commission = 0; 
    export let disabled = false;

   export let originData: {
            catId: string;
            payKey: string;
            catTId: string;
    } = {
    catId: '',
    payKey: '',
    catTId: ''
    };
    export let onChangeCatId: ((val: string) => void) | undefined;
    export let onChangePaykey: ((val: string) => void) | undefined;
    export let onChangeTCatId: ((val: string) => void) | undefined;

    export let catIdDate = ''
    
    console.log("userData.store_wallet.T_catId_date",userData.store_wallet.T_catId_date)

    $: if ( userData && userData.store_basic.keyin_state !== "" && userData.store_basic.terminal_state !== "" && userData.store_basic["3Dpay_state"] !== "") {
        tick().then(() => {
        toggleInputVisibility();
        });
    }
    onMount(() => {
        onChangeCatId?.(originData.catId ?? '');
        onChangePaykey?.(originData.payKey ?? '');
        onChangeTCatId?.(originData.catTId ?? '');
    });
   


</script>

<h3> 결제수단 설정 </h3>
<div class="agency_form border-bottom">
    <div class="agency_form tidform_wrap pay_form_dwn">
        <div class="d-flex tidform_wrap_d pay_form_dwn">
            <div class="col-12">
                <div class="d-flex tidform_wrap_d">
                    <div class="col-12 col-md-6 col-lg-4">
                        <dl class="radio_wrap">
                            <dt>인증결제</dt>
                            <dd class="d-flex">
                                <label><input type="radio" name="DDDpay_state" id="DDDpayState_0" value="0" bind:group={userData.store_basic["3Dpay_state"]} on:change={toggleInputVisibility}>사용</label>
                                <label><input type="radio" name="DDDpay_state" id="DDDpayState_1" value="1" bind:group={userData.store_basic["3Dpay_state"]} on:change={toggleInputVisibility}>미사용</label>
                            </dd>
                        </dl>
                    </div>
                </div>
            </div>
        </div>
        <div class="d-flex tidform_wrap_d">
            <div class="col-12 col-md-12 col-lg-3">
                <div class="row">
                    <div class="col-12 col-md-6 col-lg-12">
                        <dl class="radio_wrap">
                            <dt>수기결제</dt>
                            <dd class="d-flex">
                                <label><input type="radio" name="keyin_state" id="keyinState_0" value="0" bind:group={userData.store_basic.keyin_state} on:change={toggleInputVisibility}>사용</label>
                                <label><input type="radio" name="keyin_state" id="keyinState_1" value="1" bind:group={userData.store_basic.keyin_state} on:change={toggleInputVisibility} >미사용</label>
                            </dd>
                        </dl>

                    </div>
                </div>
            </div>   

            <div class="col-12 col-md-12 col-lg-9">
                <div class="row store_edit_row" id="store_edit_row">

                    <div class="col-12 col-md-2 col-lg-2">
                        <dl class="mb-0">
                            <dt id="realtime_check_input" style="">
                                <input type="checkbox" name="realtime_check" value="1" checked={userData.store_wallet.ki_realtime_state === "1"} id="realtime_check"/>
                            </dt>
                            <dd class="d-flex realtime_check_title">실시간 정산</dd>
                        </dl>
                    </div>

                    <div class="col-12 col-md-5 col-lg-5">
                        <dl class="mb-0">
                            <dt class="width_w " id="kitidtitle">수기결제 MID</dt>
                            <dd class="d-flex form_input">                    
                                <input type="text" style="background: #fff;" id="keyin_Tid" bind:value={userData.store_wallet.ki_catId} class="input cat_id" name="keyin_tid" maxlength="15" on:input={()=>onChangeCatId(userData.store_wallet.ki_catId, originData )}>
                                <button class="" type="button" id="kitidCheckBtn" on:click|preventDefault={() =>checkDuplicate('keyinTid')}>중복확인</button>
                            </dd>
                        </dl>
                    </div>

                    <div class="col-12 col-md-5 col-lg-5">
                        <dl class="flex_d" style="margin-bottom: 0;">
                            <dt class="width_w t_center" id="kipaykeytitle">수기 결제키</dt>
                            <dd class="d-flex form_input">
                                <input type="text" style="background: #fff;" class="input key_input_t" id="keyin_paykey" name="keyin_paykey" bind:value={userData.store_wallet.ki_paykey} on:input={() => onChangePaykey(userData.store_wallet.ki_paykey)}/> 
                                <button class="" type="button" id="kipaykeyCheckBtn" on:click|preventDefault={() => checkDuplicate('keyin_paykey')}>중복확인</button>                                        
                            </dd>
                        </dl>
                    </div>
                </div>
            </div> 

        </div>
        
        <div class="d-flex tidform_wrap_d pay_form_dwn">
            <div class="col-12">
                <div class="d-flex tidform_wrap_d">
                    <div class="col-12 col-md-6 col-lg-3">
                        <dl class="radio_wrap">
                            <dt>단말기</dt>
                            <dd class="d-flex">
                                <label><input type="radio" name="terminal_state" id="terminalState_0" value="0" bind:group={userData.store_basic.terminal_state} on:change={toggleInputVisibility}>사용</label>
                                <label><input type="radio" name="terminal_state" id="terminalState_1" value="1" bind:group={userData.store_basic.terminal_state} on:change={toggleInputVisibility}>미사용</label>
                            </dd>
                        </dl>
                    </div>


                <div class="col-12 col-md-6 col-lg-9">

                    <div class="row store_edit_row" id="tertidtitle">

                        <div class="col-12 col-md-2 col-lg-2">
                            <dl class="mb-0">
                                <dt id="realtime_check_input" style="">
                                    <input type="checkbox" name="T_realtime_check" value="1" checked={userData.store_wallet.T_realtime_state === "1"} id="T_realtime_check"/>
                                </dt>
                                <dd class="d-flex realtime_check_title">실시간 정산</dd>
                            </dl>
                        </div>

                        <div class="col-12 col-md-6 col-lg-5">
                            <dl class="mb-0">
                                <dt class="width_w ">단말기 MID</dt>
                                <dd class="d-flex form_input">                    
                                    <input type="text" id="terminal_Tid" style="background: #fff;" bind:value={userData.store_wallet.T_catId} class="input cat_id" name="terminal_Tid" maxlength="15" on:input={() => onChangeTCatId(userData.store_wallet.T_catId)}>       
                                    <button class="" type="button" id="tidCheckBtn" on:click|preventDefault={() => checkDuplicate('terminalTid')}>중복확인</button>                                                   
                                </dd>
                            </dl>
                        </div>

                    </div>
                </div>
            </div>
        </div>

                <div class="col-12 col-md-6 col-lg-6"></div>
                </div>

            <div class="d-flex tidform_wrap_d">
                <div class="col-12 col-md-12 col-lg-6">
                    <div class="row">

                        <div class="col-12 col-md-6 col-lg-3" id="commissionWrapper" >
                        <dl class="">
                            <dt class="width_w">수수료</dt>
                            <dd class="cd_dlex2">
                                <!-- <input type="text" class="input pay_stored" on:keyup={() => terminalCheck()} id="terminal_commission" name="terminal_commission" value=""/> % -->
                                 <input type="text" class="input pay_stored" id="terminal_commission" name="terminal_commission" bind:value={userData.store_wallet.terminal_commission}/> %
                            </dd>
                        </dl>
                        {#if classify == "1"}
                        <p class="red_t commission_notice">현재본사의 수수료는 <span id="commission_percent">{settlement_commission}</span>% 입니다.</p>
                        {/if}
                        </div>
                    </div>
                </div>
            </div>
    </div>
</div>

    <div id="terminal_setWrapper">
        <h3> 단말기 설정</h3>
            <div class="d-flex">
                <dl class="col-12 col-lg-6">
                    <dt>단말기 등록일자</dt>
                    <dd style="margin-right: 10px;">
                        <div class="form_input"><input type="date" class="input" id="T_catId_date" bind:value={catIdDate} name="T_catId_date"/></div>
                    </dd>
                </dl>
            </div>
            
            <div class="d-flex">
                <dl class="col-12 col-lg-6 radio_wrap">
                    <dt>단말기 통신비</dt>
                    <dd class="d-flex">
                        <label><input type="radio" name="terminal_charge" id="terminalcharge_0" value="0" bind:group={userData.store_wallet.terminal_charge} on:change={toggleInputVisibility}>에이전시</label>
                        <label><input type="radio" name="terminal_charge" id="terminalcharge_1" value="1" bind:group={userData.store_wallet.terminal_charge} on:change={toggleInputVisibility}>가맹점</label>
                    </dd>
                </dl>
                <dl class="col-12 col-lg-6">
                    <dt>단말기 통신비<br> 금액 (월)</dt>
                    <dd style="margin-right: 10px;">
                        <div class="form_input"><input type="text" class="input" id="terminal_price" bind:value={userData.store_wallet.terminal_price} name="terminal_price" /></div>
                    </dd>
                </dl>
            </div>

            <div class="d-flex">
                <dl class="col-12 col-lg-6 radio_wrap">
                    <dt>단말기 유/무선</dt>
                    <dd class="d-flex">
                        <label><input type="radio" name="terminal_wireless" id="terminalwireless_0" value="0" bind:group={userData.store_wallet.terminal_wireless} on:change={toggleInputVisibility}>유선</label>
                        <label><input type="radio" name="terminal_wireless" id="terminalwireless_1" value="1" bind:group={userData.store_wallet.terminal_wireless} on:change={toggleInputVisibility}>무선</label>
                    </dd>
                </dl>
                <dl class="col-12 col-lg-6 radio_wrap">
                    <dt>현금영수증</dt>
                    <dd class="d-flex">
                        <label><input type="radio" name="cash_receipts" id="cashReceipts_0" value="0" bind:group={userData.store_wallet.cash_receipts} on:change={toggleInputVisibility}>없음</label>
                        <label><input type="radio" name="cash_receipts" id="cashReceipts_1" value="1" bind:group={userData.store_wallet.cash_receipts} on:change={toggleInputVisibility}>있음</label>
                    </dd>
                </dl>
            </div>
    </div>    