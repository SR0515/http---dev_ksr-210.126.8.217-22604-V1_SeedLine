<script lang="ts">
    import { closePermissionModal, savePermissions, closeConfirmModal} from '$lib/utils/partner/partnerSystem';
</script>

<!-- 권한 설정 모달 -->
<div id="permissionModal" class="modal">
    <div class="modal-content">
        <form id="permissionForm">
            <div class="modal-header">
                <h3>권한 설정</h3>
                <span
                    class="close"
                    role="button"
                    tabindex="0"
                    aria-label="닫기"
                    on:click={closePermissionModal}
                    on:keydown={closePermissionModal}
                >
                    &times;
                </span>
            </div>
            <div class="modal-body">
                <input type="hidden" id="permissionLevelId">
                <div class="permission-form">
                    <div class="form-group partner_name_wrap">
                        <span>파트너명 :</span>
                        <div class="partner-name-display" id="permissionPartnerName"></div>
                    </div>
                                
                    <div class="permission-checkboxes">
                        <label class="checkbox-label">
                            <input type="checkbox" id="perm_view"> 하위 파트너 정보 조회
                        </label>
                        <label class="checkbox-label">
                            <input type="checkbox" id="perm_edit"> 하위 파트너 정보 수정
                        </label>
                        <label class="checkbox-label">
                            <input type="checkbox" id="perm_commission"> 수수료 설정
                        </label>
                    </div>
                    
                    <div class="form-group select_pass" >
                        <span>특정 패스 설정</span>
                        <select id="pathTargetLevel">
                            <option value="">선택안함</option>
                        </select>
                    </div>
                    
                </div>

                <div class="form-actions">
                    <button type="button" class="btn btn_secondary" on:click={() => closePermissionModal()}>취소</button>
                    <button type="button" class="btn btn_primary"  on:click={() => savePermissions()}>저장</button>
                </div>
            </div>
        </form>
    </div>
</div>


<!-- 확인 모달 -->
<div id="confirmModal" class="modal">
    <div class="modal-content modal-confirm">
        <div class="modal-header">
            <h3 id="confirmTitle">삭제 확인</h3>
             <span
                class="close"
                role="button"
                tabindex="0"
                aria-label="닫기"
                on:click={closeConfirmModal}
                on:keydown={closeConfirmModal}
            >
                &times;
            </span>
        </div>
        <div class="modal-body">
            <p id="confirmMessage"></p>
        </div>
        <div class="form-actions">
            <button type="button" class="btn btn-secondary" on:click={() => closeConfirmModal()}>취소</button>
            <button type="button" class="btn btn-primary" id="confirmButton">확인</button>
        </div>
    </div>
</div>