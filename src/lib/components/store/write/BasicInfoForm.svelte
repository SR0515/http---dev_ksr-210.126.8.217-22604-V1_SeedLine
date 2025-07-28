<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { authStore } from '$lib/stores/auth';
    import { setupAddressSearch } from '$lib/utils/addressUtils';
    import Select from 'svelte-select';
    import { bankOptions } from '$lib/types/bank';
    import { checkDuplicate } from '$lib/utils/Duplicate_check'; 
    import { onMount  } from 'svelte';
    import type {StoreListData} from '$lib/types/store'
    import { getDefaultStoreListData } from '$lib/utils/editUtils'
   

    const dispatch = createEventDispatcher();
    function onClickPartnerCheck() {
        console.log('디스패치 실행됨');
        dispatch('showModal');
    }

    export let upperInfos: any = {};
    export let pageType = '';

    export let disabledValue = false;

    //패스워드 name, value
    export let passwordValue = '';
    export let confirmPasswordValue = '';
    export let passwordName = '';
    export let confirmPasswordName = '';

    //주소검색
    export let addressName = '';
    export let detailName = '';
    export let addressBtn = '';

    export let disabled = false;
    export let selectedBank: { value: string; label: string } | null = null;


    // 반응형으로 사용자 정보 가져오기
    $: rate = $authStore.rate;
    $: userName = $authStore.userName;
    $: classify = $authStore.classify;

    setupAddressSearch(addressBtn,addressName,detailName)
</script>

<div class="agency_form border-bottom">        
    <div class="d-flex">
        <dl class="col-12 col-lg-6">
            <dt>상위 파트너</dt>
            <dd>
                <div class="form_input">
                    {#if classify === "0" || classify === "1"}
                        <input type="text" class="input" id="upper_path" name="upper_path" readonly/>
                        <input type="hidden" class="input" id="upper_code" name="upper_code"/>
                    {/if}
                      
                        <input type="hidden" class="input" id="upper_rate" bind:value={rate} name="upper_rate"/>
                </div>
            </dd>
        </dl>

        <dl class="col-12 col-lg-6">
            <dt>상위 파트너 아이디</dt>
            <dd class="upper_code_box">
                <div class="form_input">
                    {#if classify === "0" || classify === "1"}
                        <input type="text" class="input" name="upper_id" id="upper_id" placeholder="상위파트너아이디" style="outline: none;" readonly required/>
                        <button class="" id="checke_upper" type="button" on:click|preventDefault={onClickPartnerCheck}>파트너 확인</button>
                    {:else}
                        <input type="text" class="input" name="upper_id" id="upper_id" placeholder="상위파트너아이디" style="outline: none;" bind:value={upperInfos.id} readonly required/>
                    {/if}                          
                </div>
            </dd>                              
        </dl>
    </div>

    <div class="d-flex">
        <dl class="col-12 col-lg-6">
            <dt>전화번호</dt>
            <dd class="upper_code_box">
                <div class="form_input">
                    <input type="text" id="user_id" class="input" name="store_id" required/>
                    {#if pageType == "Write"}
                    <button class="" type="button" id="idCheckBtn" on:click|preventDefault={() =>checkDuplicate('user_id')}>중복확인</button>
                    {/if}
                </div>
            </dd>
        </dl>
    </div>

    <div class="d-flex">
        <dl class="col-12 col-lg-6">
            <dt>비밀번호</dt>
            <dd>
                <div class="form_input"><input type="password" class="input" bind:value={passwordValue} id="store_pass" name={passwordName} required {disabled}/></div>
            </dd>
        </dl>

        <dl class="col-12 col-lg-6">
            <dt>비밀번호 확인</dt>
            <dd>
                <div class="form_input"><input type="password" class="input" bind:value={confirmPasswordValue} id="store_pass_check" name={confirmPasswordName} required {disabled}/></div>
            </dd>
        </dl>
    </div>

    <div class="d-flex">        
        <dl class="col-12 col-lg-6">
            <dt>대표자명</dt>
            <dd>
                <div class="form_input"><input type="text" class="input" name="store_ceo_name" required/>
                </div>
            </dd>
        </dl>
        <dl class="col-12 col-lg-6">
            <dt>상호명</dt>
            <dd>
                <div class="form_input"><input type="text" class="input" name="store_name" required/>
                </div>
            </dd>
        </dl>
    </div>

    <div class="row formbank_wrap">        
        <dl class="col-12 col-md-6 col-lg-4">
            <dt class="dt_width">입금은행명</dt>
            <dd style="display: flex;"> 
                <Select items={bankOptions} required bind:value={selectedBank} placeholder="은행 검색" clearable={false}/>
                <input type="hidden" name="bank_select" value={selectedBank?.value || ''} />
            </dd>
        </dl>     
    
        <dl class="col-12 col-md-6 col-lg-5">
            <dt>계좌번호</dt>
            <dd>
                <div class="form_input">
                    <input type="text" class="input" name="account_num" required/>
                </div>
            </dd>
        </dl>

        <dl class="col-12 col-md-6 col-lg-3">
            <dt class="pl_5 text-center">예금주</dt>
            <dd>
                <div class="form_input">
                    <input type="text" class="input" name="account_name" required/>
                </div>
            </dd>
        </dl>
    </div>

    <div class="d-flex">
        <dl class="col-12">
            <dt>사업장 주소</dt>
            <dd class="cd-flexa">
                <div class="form_input"><input type="text" readonly class="input" id={addressName} name="address" />
                </div>
                <div class=" search_address">
                    <div class="address_btn_box">
                    <button type="button" id="{addressBtn}">검색</button>
                    </div>
                </div>
            </dd>                 
        </dl>            
    </div>

    <div class="d-flex">                 
        <dl class="col-12 mb_20px">
            <dt>상세주소</dt>
            <dd>
                <div class="form_input"><input type="text"  class="input" name={detailName} /></div>
            </dd>
        </dl>
    </div>

    {#if classify == "0"}
        <dl class="mb_20px">
            <dt class="dt_width">메모</dt>
            <dd class="">
                <div class="textarea_margin">
                    <textarea name="memo"></textarea>
                </div>
            </dd>
        </dl>
    {/if}
</div>
