<script lang="ts">
    export let bankName = '';
    export let accountNumber = '';
    export let accountHolder = '';
    export let disabled = true;
</script>

<div class="row formbank_wrap">
    <dl class="col-12 col-md-6 col-lg-4">
        <dt class="dt_width">입금은행명</dt>
        <dd>
            <input 
                type="text" 
                class="input" 
                name="bank_name"
                bind:value={bankName}
                {disabled}
            />
        </dd>
    </dl>

    <dl class="col-12 col-md-6 col-lg-5">
        <dt>계좌번호</dt>
        <dd>
            <div class="form_input">
                <input 
                    type="text" 
                    class="input" 
                    name="account_number"
                    bind:value={accountNumber}
                    {disabled}
                />
            </div>
        </dd>
    </dl>

    <dl class="col-12 col-md-6 col-lg-3">
        <dt class="pl_5">예금주</dt>
        <dd>
            <div class="form_input">
                <input 
                    type="text" 
                    class="input" 
                    name="account_holder"
                    bind:value={accountHolder}
                    {disabled}
                />
            </div>
        </dd>
    </dl>
</div>