<script lang="ts">
    export let passwordValue = '';
    export let confirmPasswordValue = '';
    export let disabled = false;

    // 비밀번호 필드 이름을 동적으로 설정
    export let passwordName = 'password';
    export let confirmPasswordName = 'password_confirm';
</script>

<div class="d-flex">
    <dl class="col-12 col-lg-6">
        <dt>새 비밀번호</dt>
        <dd>
            <div class="form_input">
                <input 
                    type="password" 
                    class="input" 
                    name={passwordName}
                    bind:value={passwordValue}
                    {disabled}
                />
            </div>
        </dd>
    </dl>

    <dl class="col-12 col-lg-6">
        <dt>새 비밀번호 확인</dt>
        <dd>
            <div class="form_input">
                <input 
                    type="password" 
                    class="input" 
                    name={confirmPasswordName}
                    bind:value={confirmPasswordValue}
                    {disabled}
                />
            </div>
        </dd>
    </dl>
</div>