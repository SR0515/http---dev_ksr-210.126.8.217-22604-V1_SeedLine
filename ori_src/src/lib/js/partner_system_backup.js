
import { writable } from "svelte/store";
import { showToast } from '$lib/stores/toast';
import {fetchPartners} from "../stores/partner";
// import {affectedChildren} from "../js/partnerStore.js";
import { leftMenuData } from '$lib/stores/leftMenu';


let partnerLevels = [];

let partners = [];
let permissions = {};
let specialPaths = {}; // 특정 패스 설정 저장
let totalCount;

// 초기화
document.addEventListener('DOMContentLoaded', function() {
    initializeLevels();
    loadPartners();
});

// API로 데이터 가져오기
async function fetchData() {
    try {
        const response = await fetch('/api/partner/PartnerSetting');
        const json = await response.json();

        if (json.success) {
            totalCount = json.totalCount;
            setPartnerLevels(json.data);
            renderLevels(); // 상단에 있는 파트너 리스트
            renderPartners(); //파트너 리스트
        } else {
            console.error('서버 오류:', json.message);
        }
        console.log('받은 데이터:', json);
    } catch (err) {
        console.error('API 호출 중 오류 발생:', err);
    }
}

function setPartnerLevels(data) {
     partnerLevels = data.map((item, index) => ({
        id: item.idx, // 또는 index + 1 로 바꿔도 됨
        name: item.partner_name,
        order: index + 1,
        rate: item.rate,
        path: item.partner_path,
        commission_permission: item.commission_permission === "1",
        edit_permission: item.edit_permission === "1",
        view_permission: item.view_permission === "1"
    }));

    // 기본 permissions도 함께 구성
    partnerLevels.forEach(level => {
        permissions[level.id] = {
            view: level.view_permission,
            edit: level.edit_permission,
            commission: level.commission_permission
        };
    });
}

async function fetchLeftMenuData() {
    try {
        const params = new URLSearchParams({
            classify: localStorage.getItem("classify"),
            rate: localStorage.getItem("user_rate"),
            userId: localStorage.getItem("user_id") ?? '',
            partnerCode:  localStorage.getItem("code") ?? '',
        });

        const response = await fetch('/api/LeftMenu?' + params.toString());
        const json = await response.json();

        if (json.success) {
            leftMenuData.set({
                C_dupli: json.C_dupli,
                terminalCount: json.terminalCount,
                inactiveCount: json.inactiveCount,
                realtimeState: json.realtimeState,
                t_realtimeState: json.t_realtimeState,
                commissionBalance: json.commissionBalance,
                notifyRateMap: json.notifyRateMap,
                pathNotifyCount: json.pathNotifyCount,
            });
        } else {
            console.error("LeftMenu 불러오기 실패:", json.message);
        }
    } catch (error) {
        console.error("LeftMenu fetch 오류:", error);
    }
}


// 레벨 관리 함수들
function initializeLevels() {
    // 기본적으로 권한 초기화
    permissions[1] = {
        view: true,
        edit: true,
        commission: true
    };
    
   if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            renderLevels();
            updateLevelFilters();
        });
    } else {
        renderLevels();
        updateLevelFilters();
    }
}

function renderLevels() {
    const container = document.getElementById('dynamic-levels');

    if (!container) {
        console.warn('dynamic-levels 요소를 찾을 수 없습니다.');
        return;
    }

    container.innerHTML = '';
    
    partnerLevels.forEach((level, index) => {
        const levelCard = createLevelCard(level, index);
        container.appendChild(levelCard);
    });
}

function createLevelCard(level, index) {
    const div = document.createElement('div');
    div.className = 'level-card';
    div.dataset.level = level.order; // 화면상의 순서 (index+1)
    div.dataset.levelId = level.id;  // 실제 DB idx

    div.innerHTML = `
        <div class="level-header" id="header-${level.id}">
            <span class="level-number">${index + 1}</span>
            <span class="level-name" id="name-${level.id}" onclick="editLevelName(${level.id})">${level.name}</span>
        </div>
        ${level.order > 1 ? `<button class="delete-btn" onclick="deleteLevel(${level.id})">×</button>` : ''}
    `;

    return div;
}

async function addLevel() {
    const nextId = partnerLevels.length + 1;

    if (nextId > 12) {
        showToast('최대 12개까지 레벨을 추가할 수 있습니다.', 'error');
        return;
    }

    const newName = `레벨 ${nextId}`;
    
    try {
        const response = await fetch('/api/partner/PartnerSetting/write', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                newNum: nextId,
                newName: newName,
                adminId : localStorage.getItem("user_id")
            }),
        });

        const result = await response.json();

        if (response.ok && result.success) {
            const newLevel = {
                id: nextId,
                name: newName,
                order: nextId
            };

            // partnerLevels.push(newLevel);
            fetchData();
            fetchPartners();

            // 기본 권한 설정
            permissions[nextId] = {
                view: false,
                edit: false,
                commission: false
            };

            renderLevels();
            updateLevelFilters();
            renderPartners();

            showToast('파트너 레벨이 추가되었습니다.', 'info');
        } else {
            showToast(result.message || '파트너 레벨 추가에 실패했습니다.', 'error');
            
        }
    } catch (error) {
        console.error('파트너 레벨 추가 오류:', error);
        showToast('서버와 통신 중 오류가 발생했습니다.', 'error');
    }
}

function editLevelName(levelId) {
    const level = partnerLevels.find(l => l.id === levelId);
    const index = partnerLevels.findIndex(l => l.id === levelId) + 1; //인덱스값 구하기

    if (!level) return;
    
    const nameSpan = document.getElementById(`name-${levelId}`);
    const header = document.getElementById(`header-${levelId}`);
    const card = header.closest('.level-card');
    
    // 이미 편집 중이면 무시
    if (nameSpan && nameSpan.classList && nameSpan.classList.contains('editing')) return;
    
    // 카드에 editing 클래스 추가
    card.classList.add('editing');
    
    const currentName = level.name;
    
    // 편집 모드로 전환
    header.innerHTML = `
        <span class="level-number">${index}</span>
        <input type="text" class="level-name editing" id="edit-${levelId}" value="${currentName}" 
               onkeydown="handleKeyPress(event, ${levelId})">
        <button class="save-btn" onclick="saveLevelName(${levelId})">저장</button>
    `;
    console.log("index",index)
    
    // 입력 필드에 포커스
    const input = document.getElementById(`edit-${levelId}`);
    input.focus();
    input.select();
}

function handleKeyPress(event, levelId) {
    if (event?.key === 'Enter') {
        saveLevelName(levelId);
    } else if (event?.key === 'Escape') {
        cancelEdit(levelId);
    }
}

async function saveLevelName(levelId) {
    const input = document.getElementById(`edit-${levelId}`);
    const newName = input.value.trim();

    try {
        const response = await fetch(`/api/partner/PartnerSetting/test/edit/${levelId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ partner_name: newName }) 
        });

        const result = await response.json();

        if (response.ok && result.success) {
            // 1. 기존 파트너명 저장
            const level = partnerLevels.find(l => l.id === levelId);
            if (!level) return;
            const oldName = level.name;

            // 2. 이름 바꾸기
            level.name = newName;

            // 3. partnerLevels 내 모든 path 업데이트
            partnerLevels.forEach(p => {
                if (p.path && p.path.includes(oldName)) {
                    p.path = p.path.replaceAll(oldName, newName);
                }
            });
            
            updateLevelFilters();
            renderPartners();
            showToast('파트너명이 변경되었습니다.', 'info');
            fetchData();
            fetchPartners();
            
        } else {
            showToast(result.message || '수정에 실패했습니다.', 'error');
        }
    } catch (error) {
        console.error('파트너명 수정 오류:', error);
        showToast('서버와 통신 중 오류가 발생했습니다.', 'error');
    }
    
    // 카드를 원래 상태로 복원
    const header = document.getElementById(`header-${levelId}`);
    const card = header.closest('.level-card');
    
    // editing 클래스 제거
    card.classList.remove('editing');
    
    if (header) {
        header.innerHTML = `
            <span class="level-number">${levelId}</span>
            <span class="level-name" id="name-${levelId}" onclick="editLevelName(${levelId})">${newName}</span>
        `;
    }
}

function cancelEdit(levelId) {
    const level = partnerLevels.find(l => l.id === levelId);
    const header = document.getElementById(`header-${levelId}`);
    
    if (header && level) {
        const card = header.closest('.level-card');
        
        // editing 클래스 제거
        card.classList.remove('editing');
        
        header.innerHTML = `
            <span class="level-number">${levelId}</span>
            <span class="level-name" id="name-${levelId}" onclick="editLevelName(${levelId})">${level.name}</span>
        `;
    }
}

function showConfirm(message, onConfirm) {
    const modal = document.getElementById('confirmModal');
    const messageEl = document.getElementById('confirmMessage');
    const confirmBtn = document.getElementById('confirmButton');

    // 메시지 설정
    messageEl.textContent = message;

    // 이전 이벤트 제거를 위해 confirm 버튼 복제
    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);

    // 확인 버튼 클릭 시 콜백 실행 + 모달 닫기
    newConfirmBtn.addEventListener('click', () => {
        onConfirm();
        closeConfirmModal();
    });

    // 모달 보여주기
    modal.classList.add('show');
}

function closeConfirmModal() {
    const modal = document.getElementById('confirmModal');
    modal.classList.remove('show');
}

function deleteLevel(levelId) {
    showConfirm('파트너를 삭제하시겠습니까?', async () => {
        try {
            const response = await fetch(`/api/partner/PartnerSetting/delete/${levelId}`, {
                method: 'DELETE'
            });
            const result = await response.json();
            if (result.success) {
                partnerLevels = partnerLevels.filter(l => l.id !== levelId);
                partnerLevels = partnerLevels.map((level, index) => ({
                    ...level,
                    order: index + 1
                }));
                // permissions 재정렬도 수정 필요할 수 있음
                const newPermissions = {};
                partnerLevels.forEach(level => {
                    if (permissions[level.order]) {
                        newPermissions[level.id] = permissions[level.order];
                    }
                });
                permissions = newPermissions;

                renderLevels();
                updateLevelFilters();
                renderPartners();

                showToast('레벨이 삭제되었습니다.', 'info');
                fetchData();
                fetchPartners();
            } else {
                showToast(result.message || '삭제 실패', 'error');
            }
        } catch (error) {
            console.error('삭제 에러:', error);
            showToast('서버 오류가 발생했습니다.', 'error');
        }
    });
}


// 파트너 관리 함수들
function loadPartners() {
    // 샘플 데이터 - 각 레벨별로 데이터 생성
    partners = partnerLevels.map(level => ({
        id: level.idx,
        name: level.partner_name,
        levelId: level.rate,
        path: level.partner_path,
        status: 'active'
    }));
    
    renderPartners();
}

function renderPartners() {
    const tbody = document.getElementById('partnerTableBody');
    if (!tbody) {
        console.warn('partnerTableBody 요소를 찾을 수 없습니다.');
        return;
    }

    tbody.innerHTML = '';
    
    const filteredPartners = filterPartners();
    
    filteredPartners.forEach(partner => {
        const row = createPartnerRow(partner);
        tbody.appendChild(row);
    });
}

// 특정 패스의 전체 경로 가져오기
function getFullPath(levelId) {
    const path = [];
    let currentId = levelId;
    
    // 현재 레벨부터 시작해서 상위로 올라가며 경로 구성
    while (currentId && currentId > 0) {
        const level = partnerLevels.find(l => l.id === currentId);
        if (!level) break;
        
        path.unshift(level.name); // 배열 앞에 추가
        
        // 특정 패스가 설정되어 있으면 해당 레벨로, 아니면 바로 위 레벨로
        const pathInfo = specialPaths[currentId];
        if (pathInfo && pathInfo.targetLevel) {
            currentId = pathInfo.targetLevel;
        } else {
            currentId = currentId - 1;
        }
    }
    
    return path;
}

function createPartnerRow(partner) {
    const tr = document.createElement('tr');
    const level = partnerLevels.find(l => l.id === partner.levelId);
    const perms = permissions[partner.levelId] || {};
    const badges = [];

    if (perms.view) badges.push('<span class="permission-badge active">조회</span>');
    if (perms.edit) badges.push('<span class="permission-badge active">수정</span>');
    if (perms.commission) badges.push('<span class="permission-badge active">수수료</span>');

    // 권한 배지 생성
    const permissionBadges = `
        <div class="permission-badges">
            ${badges.join(', ')}
        </div>
    `;
    
    // 특정 패스 표시 (전체 경로)
    const pathInfo = specialPaths[partner.levelId] || {};
    let pathDisplay = `<span class="path-display">${partner.path || '-'}</span>`;
    
    if (pathInfo.targetLevel) {
        const fullPath = getFullPath(partner.levelId);
        if (fullPath.length > 1) {
            pathDisplay = `<span class="path-display">${fullPath.join(' > ')}</span>`;
        }
    }
    
    tr.innerHTML = `
        <td class="col-no"><span class="level-number">${partner.order}</span></td>
        <td class="col-name">${partner.name}</td>
        <td class="col-permission">${permissionBadges}</td>
        <td class="col-path text_left">${pathDisplay}</td>
        <td class="col-action">
            <div class="action-buttons">
                <button class="action-btn edit-btn" onclick="openPermissionModal(${partner.levelId})">수정</button>
            </div>
        </td>
    `;
    
    return tr;
}

function filterPartners() {
    // 파트너 목록을 레벨 목록으로 변경
    const levelPartners = partnerLevels.map((level, index) => ({
        id: level.id,
        order : index + 1,
        name: level.name,
        levelId: level.id,
        path: level.path,
        status: 'active'
    }));
    
    return levelPartners;
}

// 권한 모달 관리
function openPermissionModal(levelId) {
    const level = partnerLevels.find(l => l.id === levelId);
    if (!level) return;
    
    document.getElementById('permissionLevelId').value = levelId;
    document.getElementById('permissionPartnerName').textContent = level.name;
    
    // 현재 권한 설정 로드
    const perms = permissions[levelId] || {};
    document.getElementById('perm_view').checked = perms.view || false;
    document.getElementById('perm_edit').checked = perms.edit || false;
    document.getElementById('perm_commission').checked = perms.commission || false;
    
    // 특정 패스 설정 로드
    loadPathOptions(levelId);
    
    document.getElementById('permissionModal').classList.add('show');
}

function loadPathOptions(currentLevelId) {
    const targetSelect = document.getElementById('pathTargetLevel');
    
    // 초기화
    targetSelect.innerHTML = '<option value="">선택 안함</option>';
    
    // 현재 레벨보다 낮은 레벨들만 옵션으로 추가 (상위 레벨들)
    partnerLevels.forEach(level => {
        if (level.id < currentLevelId) {
            targetSelect.innerHTML += `<option value="${level.id}">${level.name}</option>`;
        }
    });
    
    // 기존 설정 로드
    const pathInfo = specialPaths[currentLevelId];
    if (pathInfo && pathInfo.targetLevel) {
        targetSelect.value = pathInfo.targetLevel;
    }
}

function updatePathDisplay() {
    // 필요 시 미리보기 기능 추가 가능
}

function closePermissionModal() {
    document.getElementById('permissionModal').classList.remove('show');
}


//수정 모달창 저장
async function savePermissions() {
    const levelId = parseInt(document.getElementById('permissionLevelId').value); //수정하려는 아이디
    
    permissions[levelId] = {
        view: document.getElementById('perm_view').checked,
        edit: document.getElementById('perm_edit').checked,
        commission: document.getElementById('perm_commission').checked
    };
    
    // 특정 패스 저장
    const targetLevel = document.getElementById('pathTargetLevel').value; //특정 path 셀렉트박스 id

    try{
        const adminId = localStorage.getItem("user_id")
        const EditLevelId = levelId
        const permissionData = {
            view_permission : document.getElementById('perm_view').checked || "0",
            edit_permission : document.getElementById('perm_edit').checked || "0",
            commission_permission : document.getElementById('perm_commission').checked || "0"
        }
        const upperLevelId = targetLevel === "" ? null : Number(targetLevel);
        const payload = {
            adminId,
            EditLevelId,
            permissionData,
            upperLevelId
        }
        const response = await fetch('/api/partner/PartnerSetting/editInfo',{
            method : 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(payload)
        });
        console.log("payload",payload)
        
        const result = await response.json();
            if (result.success) {
               if (result.affectedChildren && result.affectedChildren.length > 0) {
                    affectedChildren.set(result.affectedChildren); // ✅ store + localStorage 저장됨
                }
                console.log("result",result)

                showToast(result.message,"info")

                await fetchLeftMenuData(); 

                setTimeout(() => {
                fetchData();
            }, 1500); 
            } else {
                console.error('서버 응답 오류:', result);
                alert(`오류: ${result.message}\n에러: ${result.error}`);
            }

    }catch(error){
            console.error('수정 중 오류 발생:', error);
            console.log("수정 중 오류 발생:", error);
            alert('서버 오류 발생');
    }
    
    // if (targetLevel) {
    //     specialPaths[levelId] = {
    //         targetLevel: parseInt(targetLevel)
    //     };
    // } else {
    //     delete specialPaths[levelId];
    // }
    
    showToast('권한이 저장되었습니다.', 'info');
    fetchData();
    // renderPartners(); // 테이블 업데이트
    closePermissionModal();
}

// 기존 모달 관리 (파트너 추가/수정용 - 현재는 사용하지 않음)
function closeModal() {
    document.getElementById('partnerModal').classList.remove('show');
}

// 필터 업데이트 - 더 이상 필요 없음
function updateLevelFilters() {
    // 필터가 제거되었으므로 비워둡
}

// export 한 객체로 묶기
export default {
    fetchData,
    setPartnerLevels,
    initializeLevels,
    renderLevels,
    createLevelCard,
    addLevel,
    editLevelName,
    handleKeyPress,
    saveLevelName,
    cancelEdit,
    deleteLevel,
    loadPartners,
    renderPartners,
    getFullPath,
    createPartnerRow,
    filterPartners,
    openPermissionModal,
    loadPathOptions,
    updatePathDisplay,
    closePermissionModal,
    savePermissions,
    closeModal,
    updateLevelFilters,
    showConfirm,
    closeConfirmModal,
    partnerLevels
};

// 전역 함수로 등록
window.openPermissionModal = openPermissionModal;
window.closePermissionModal = closePermissionModal;
window.savePermissions = savePermissions;
window.updatePathDisplay = updatePathDisplay;
window.editLevelName = editLevelName;
window.saveLevelName = saveLevelName;
window.deleteLevel = deleteLevel;
window.showConfirm = showConfirm;
window.closeConfirmModal = closeConfirmModal;
window.handleKeyPress = handleKeyPress;
