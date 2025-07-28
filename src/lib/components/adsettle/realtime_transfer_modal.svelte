<script>
    import {goto} from "$app/navigation";

    export let close;

    function changeBank() {
        // 은행 변경 로직
        console.log('은행 변경');
    }

    function checkAccount() {
        // 계좌 확인 로직
        console.log('계좌 확인');
    }

    function showConfirmation() {
        // 이체 확인 로직
        console.log('이체 확인');
    }
</script>

<div id="transfer_overlay" style="display: block; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 9999;">
    <div class="transfer-container" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; background:#fff; padding: 30px; border-radius: 10px;width:40%;margin: 0 auto;">
        <h2 class="title_transfer">이체 요청</h2>
    

        <div class="amount-display">
            <span class="amount-title">이체 수수료</span>
            <span class="amount-value" id="transfer_tax">100원</span> 
        </div>

        <div class="amount-display">
            <span class="amount-title">이체 가능 금액</span>
            <span class="amount-value" id="origin_amount">10원</span> 
        </div>
      
        <div class="transfer-amount-section">
            <div class="input-group">
                <label class="input-label amount-input-label" for="">이체 금액</label>
                <div class="input-field-container">
                    <input type="text" id="transferAmount" class="input-field amount-input" maxlength="15" required>
                </div>
            </div>
        </div> 
        
        <div class="account-info-section">
            <h3 class="section-title">계좌 정보</h3>
            
            <input type="hidden" id="ordNo" value="<%=ordNo%>" />
            <input type="hidden" id="buyerId" value="<%=buyerId%>" />
            <input type="hidden" id="commission" value="<%=commission%>" />
            
            <!-- 은행명 입력 -->
            <div class="input-group">
                <label class="input-label" for="">은행명</label>
                <div class="bank-selection">
                    <input type="text" id="bankSearch" placeholder="은행명을 입력하세요." autocomplete="off">
                    <div id="searchResults" class="bank-search-results"></div>
                    <div id="selectedBank" class="selected-bank-display" style="display: none;">
                        <span id="selectedBankText" class="selected-bank-name"></span>
                        <button class="change-bank-btn" on:click={() => changeBank()}>변경</button>
                    </div>
                </div>
                <select id="accountBank" style="display: none;">
                    <!-- <% 
                    ' 은행 코드와 이름을 데이터베이스에서 가져오기
                    If Not bankRs.EOF Then
                        bankRs.MoveFirst
                        While Not bankRs.EOF
                    %>
                        <option value="<%=bankRs("bank_code")%>"><%=bankRs("bank_name")%></option>
                    <% 
                        bankRs.MoveNext
                        Wend
                    End If
                    %> -->
                </select>
            </div>
            
            <!-- 계좌번호 입력 -->
            <div class="input-group">
                <label class="input-label" for="">계좌번호</label>
                <div class="input-field-container">
                    <input type="text" id="accountNumber" maxlength="32" placeholder="숫자만 입력하세요.">
                </div>
            </div>
            
            <!-- 예금주 입력 -->
            <div class="input-group">
                <label class="input-label" for="">예금주</label>
                <div class="input-field-container">
                    <input type="text" id="accountHolder" placeholder="예금주 이름을 입력하세요.">
                </div>
            </div>
            
            <!-- 계좌확인 버튼 -->
            <button type="button" class="verify-account-btn" on:click={() => checkAccount()}>계좌확인</button>
        </div>
    
        <div class="action-buttons btns_wrap">
            <button type="button" class="action-btn confirm-btn" id="confirmBtn" on:click={() => showConfirmation()}>이체</button>
            <button type="button" class="action-btn cancel-btn"  on:click={close}>취소</button>
        </div>
    </div>
</div>