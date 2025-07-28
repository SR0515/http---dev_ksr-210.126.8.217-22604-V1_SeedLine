<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { authStore } from '$lib/stores/auth';
	import { checkAuth } from '$lib/utils/accessControl';
	import { showToast } from '$lib/stores/toast';
	import LeftMenu from '$lib/components/LeftMenu.svelte';
	import Toast from '$lib/components/Toast.svelte';
	import PartnerSystem from "../../js/partner_system";


	function handleAdd() {
        PartnerSystem.addLevel();
    }



    onMount(() => {
        PartnerSystem.initializeLevels();
        // PartnerSystem.renderPartners();
        // PartnerSystem.handleKeyPress(); //다시 살려야함
        PartnerSystem.fetchData();
    });

</script>

<LeftMenu/>

<div id="page_contect" class="">
    <div id="content" class="container">
        <section>
            <div class="title_wrap">
                <h5 class="page_title">파트너 관리 수정 - 구조 및 권한 관리</h5>
            </div>
        </section>

        <!-- 파트너 추가 섹션 -->
        <section class="partner-structure">
            <div class="section-header">
                <h3>파트너 추가</h3>
                <button type="button" class="abt patner_add_btn" on:click={handleAdd}>파트너 추가</button>
            </div>
            <div class="structure-grid">
                <!-- 동적으로 생성될 레벨 카드들 -->
                <div id="dynamic-levels"></div>
            </div>
        </section>

        <!-- 파트너 구조 목록 섹션 -->
        <section class="partner-list">
            <h3>파트너 구조 목록</h3>
            <div class="partner-table-wrapper">
                <table class="partner-table">
                    <colgroup>      
                        <col style="width: 5%">               
                        <col style="width: 20%">  
                        <col style="width: 10%"> 
                        <col style="width: 50%"> 
                        <col style="width: 15%"> 
                    </colgroup>

                    <thead>
                        <tr>
                            <th class="col-no">NO</th>
                            <th class="col-name">파트너명</th>
                            <th class="col-permission">권한</th>
                            <th class="col-path">특정 패스</th>
                            <th class="col-action">관리</th>
                        </tr>
                    </thead>
                    <tbody id="partnerTableBody">
                        <!-- 동적으로 생성될 파트너 목록 -->
                    </tbody>
                </table>
            </div>
        </section>

    </div>
</div>

<!-- 파트너 추가/수정 모달 -->
<div id="partnerModal" class="modal">
    <div class="modal-content">
        <div class="modal-header">
            <h3 id="modalTitle">파트너 추가</h3>
            <span class="close" on:click={closeModal()}>&times;</span>
        </div>
        <div class="modal-body">
            <form id="partnerForm">
                <input type="hidden" id="partnerId">
                
                <div class="form-group">
                    <label for="partnerName">파트너명</label>
                    <input type="text" id="partnerName" required>
                </div>

                <div class="form-group">
                    <label for="partnerLevel">레벨</label>
                    <select id="partnerLevel" required on:change={updateParentOptions()}>
                        <!-- 동적으로 생성 -->
                    </select>
                </div>

                <div class="form-group">
                    <label for="parentPartner">상위 파트너</label>
                    <select id="parentPartner">
                        <option value="">없음 (최상위)</option>
                        <!-- 동적으로 생성 -->
                    </select>
                </div>

                <div class="form-group">
                    <label for="contactEmail">이메일</label>
                    <input type="email" id="contactEmail" required>
                </div>

                <div class="form-group">
                    <label for="contactPhone">연락처</label>
                    <input type="tel" id="contactPhone" required>
                </div>

                <div class="form-group">
                    <label for="commissionRate">수수료율 (%)</label>
                    <input type="number" id="commissionRate" min="0" max="100" step="0.1" required>
                </div>

                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" on:click={closeModal()}>취소</button>
                    <button type="submit" class="btn btn-primary">저장</button>
                </div>
            </form>
        </div>
    </div>
</div>

<!-- 권한 설정 모달 -->
<div id="permissionModal" class="modal">
    <div class="modal-content">
        <form id="permissionForm">
            <div class="modal-header">
                <h3>권한 설정</h3>
                <span class="close" on:click={closePermissionModal()}>&times;</span>
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
                            <select id="pathTargetLevel" on:change={updatePathDisplay()}>
                                <option value="">선택 안함</option>
                            </select>
                        </div>
                    
                </div>

                <div class="form-actions">
                    <button type="button" class="btn btn_secondary" on:click={closePermissionModal()}>취소</button>
                    <button type="button" class="btn btn_primary" on:click={savePermissions()}>저장</button>
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
            <span class="close" on:click={closeConfirmModal()}>&times;</span>
        </div>
        <div class="modal-body">
            <p id="confirmMessage"></p>
        </div>
        <div class="form-actions">
            <button type="button" class="btn btn-secondary" on:click={closeConfirmModal()}>취소</button>
            <button type="button" class="btn btn-primary" id="confirmButton">확인</button>
        </div>
    </div>
</div>