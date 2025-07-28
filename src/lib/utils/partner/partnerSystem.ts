import { showToast } from '$lib/stores/toast';
import { get } from 'svelte/store';
import { authStore } from '$lib/stores/auth';
import { fetchPartners, affectedChildren} from '$lib/stores/partner';
import { loadMenuData } from '$lib/utils/menuUtils';
import type { Level, Permissions, ApiResponse, PartnerSettingData, LevelPartner, SpecialPathInfo, SpecialPaths} from '$lib/types/partner';

let partnerLevels: PartnerSettingData[] = [];
let permissions: Permissions = {};
let specialPaths: SpecialPaths = {};

let totalCount: number = 0;

// 파트너 레벨 설정 함수
function setPartnerLevels(levels: PartnerSettingData[]) {
    partnerLevels = levels;
}

// partner_setting 데이터 가져오기
export async function fetchData(): Promise<void> {
    try {
        const response = await fetch('/api/partner/PartnerSetting');
        const json: ApiResponse<PartnerSettingData[]> = await response.json();

        if (json.success) {
            totalCount = json.totalCount ?? 0;
            setPartnerLevels(json.data);
            renderLevels();      // 파트너 레벨 목록 렌더링
            renderPartners();    // 파트너 리스트 렌더링
        } else {
            console.error('서버 오류:', json.message);
        }

        console.log('받은 데이터:', json);
    } catch (err) {
        console.error('API 호출 중 오류 발생:', err);
    }
}

// 파트너 레벨 목록 렌더링 함수
function renderLevels(): void {
  const container = document.getElementById('dynamic-levels');

  if (!container) {
    console.warn('dynamic-levels 요소를 찾을 수 없습니다.');
    return;
  }

  // Type narrowing: container가 null이 아닌 HTMLElement임을 명시
  container.innerHTML = '';

  partnerLevels.forEach((level: PartnerSettingData, index: number): void => {
    const levelCard: HTMLDivElement = createLevelCard(level, index);
    container.appendChild(levelCard);
  });
}

// 파트너 필터링 함수
function renderPartners(): void {
  const tbody = document.getElementById('partnerTableBody');

  if (!tbody) {
    console.warn('partnerTableBody 요소를 찾을 수 없습니다.');
    return;
  }

  // tbody는 HTMLTableSectionElement 타입임
  tbody.innerHTML = '';

  const filteredPartners: LevelPartner[] = filterPartners();

  filteredPartners.forEach((partner: LevelPartner) => {
    const row: HTMLTableRowElement = createPartnerRow(
        partner,
        partnerLevels,
        permissions,
        specialPaths,
        getFullPath
    );
    tbody.appendChild(row);
  });
}

// 특정 패스의 전체 경로 가져오기
function getFullPath(levelId: number): string[] {
  const path: string[] = [];
  let currentId: number | undefined = levelId;

  while (currentId && currentId > 0) {
    const level = partnerLevels.find(l => l.idx === currentId);
    if (!level) break;

    path.unshift(level.partner_name);

    const pathInfo: SpecialPathInfo | undefined = specialPaths[currentId];
    if (pathInfo && pathInfo.targetLevel && pathInfo.targetLevel !== currentId) {
      currentId = pathInfo.targetLevel;
    } else {
      currentId = currentId - 1;
    }
  }

  return path;
}

// 파트너 행 생성 함수
function filterPartners(): LevelPartner[] {
  return partnerLevels.map((level, index) => ({
    id: level.idx,
    order: index + 1,
    name: level.partner_name,
    levelId: level.idx,
    path: '', // Level 타입엔 path가 없으므로 빈 문자열 또는 수정 필요
    status: 'active',
  }));
}

// 파트너 레벨 카드 UI 생성 함수
export function createLevelCard(level: PartnerSettingData, index: number): HTMLDivElement {
  const div: HTMLDivElement = document.createElement('div');
  div.className = 'level-card';
  div.dataset.level = (index + 1).toString(); 
  div.dataset.levelId = level.idx.toString();

  div.innerHTML = `
    <div class="level-header" id="header-${level.idx}">
      <span class="level-number">${index + 1}</span>
      <span class="level-name" id="name-${level.idx}" onclick="editLevelName(${level.idx})">${level.partner_name}</span>
    </div>
    ${index > 0 ? `<button class="delete-btn" onclick="deleteLevel(${level.idx})">×</button>` : ''}
  `;

  return div;
}

// 레벨 이름 편집 함수
export function editLevelName(levelId: number): void {
    const level = partnerLevels.find((l) => l.idx === levelId);
    const index = partnerLevels.findIndex((l) => l.idx === levelId) + 1;

    if (!level) return;

    const nameSpan = document.getElementById(`name-${levelId}`);
    const header = document.getElementById(`header-${levelId}`);
    if (!header) return;

    const card = header.closest('.level-card') as HTMLElement | null;
    if (!card) return;

    if (nameSpan?.classList.contains('editing')) return;

    card.classList.add('editing');

    const currentName = level.partner_name;

    header.innerHTML = `
      <span class="level-number">${index}</span>
      <input type="text" class="level-name editing" id="edit-${levelId}" value="${currentName}" 
            onkeydown="handleKeyPress(event, ${levelId})">
      <button class="save-btn" onclick="saveLevelName(${levelId})">저장</button>
    `;

    const input = document.getElementById(`edit-${levelId}`) as HTMLInputElement | null;
    if (input) {
      input.focus();
      input.select();
    }

    console.log("index", index);
}

// 레벨 이름 저장 함수
export async function saveLevelName(levelId: number): Promise<void> {
  const input = document.getElementById(`edit-${levelId}`) as HTMLInputElement | null;
  if (!input) return;

  const newName = input.value.trim();

  try {
    const response = await fetch(`/api/partner/PartnerSetting/test/edit/${levelId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ partner_name: newName })
    });

    const result: { success: boolean; message?: string } = await response.json();

    if (response.ok && result.success) {
      const level = partnerLevels.find((l) => l.idx === levelId);
      if (!level) return;

      const oldName = level.partner_name;
      level.partner_name = newName;

      // path 업데이트
      partnerLevels.forEach((p) => {
        if (p.partner_path && p.partner_path.includes(oldName)) {
          p.partner_path = p.partner_path.replaceAll(oldName, newName);
        }
      });

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

  const header = document.getElementById(`header-${levelId}`);
  const card = header?.closest('.level-card') as HTMLElement | null;

  if (card) {
    card.classList.remove('editing');
  }

  if (header) {
    header.innerHTML = `
      <span class="level-number">${levelId}</span>
      <span class="level-name" id="name-${levelId}" onclick="editLevelName(${levelId})">${newName}</span>
    `;
  }
}

// 레벨 삭제 함수
export async function deleteLevel(levelId: number): Promise<void> {
  showConfirm('파트너를 삭제하시겠습니까?', async () => {
    try {
      const response = await fetch(`/api/partner/PartnerSetting/delete/${levelId}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (result.success) {
        // 1. partnerLevels에서 제거
        partnerLevels = partnerLevels.filter((l) => l.idx !== levelId);

        // 2. 순서 재정렬
        partnerLevels = partnerLevels.map((level, index) => ({
          ...level,
          order: index + 1
        }));

        // 3. permissions 재구성
        const newPermissions: Permissions = {};
        partnerLevels.forEach((level) => {
          if (permissions[level.idx]) {
            newPermissions[level.idx] = permissions[level.idx];
          }
        });
        permissions = newPermissions;

        // 4. UI 및 데이터 갱신
        renderLevels();
        renderPartners();
        fetchData();
        fetchPartners();

        showToast('레벨이 삭제되었습니다.', 'info');
      } else {
        showToast(result.message || '삭제 실패', 'error');
      }
    } catch (error) {
      console.error('삭제 에러:', error);
      showToast('서버 오류가 발생했습니다.', 'error');
    }
  });
}

// showConfirm 함수
export function showConfirm(message: string, onConfirm: () => void): void {
  const modal = document.getElementById('confirmModal');
  const messageEl = document.getElementById('confirmMessage');
  const confirmBtn = document.getElementById('confirmButton');

  // 요소들이 모두 존재하는지 확인
  if (!modal || !messageEl || !confirmBtn) {
    console.error('확인 모달 요소를 찾을 수 없습니다.');
    return;
  }

  // 메시지 설정
  messageEl.textContent = message;

  // confirm 버튼 복제 및 교체 (기존 이벤트 제거)
  const newConfirmBtn = confirmBtn.cloneNode(true) as HTMLElement;
  confirmBtn.parentNode?.replaceChild(newConfirmBtn, confirmBtn);

  // 확인 버튼 클릭 시 콜백 실행 + 모달 닫기
  newConfirmBtn.addEventListener('click', () => {
    onConfirm();
    closeConfirmModal(); // 이 함수도 TypeScript에서 선언되어 있어야 함
  });

  // 모달 보여주기
  modal.classList.add('show');
}

// showconfirm 모달 닫기 함수
export function closeConfirmModal(): void {
  const modal = document.getElementById('confirmModal');
  if (modal) {
    modal.classList.remove('show');
  } else {
    console.warn('confirmModal 요소를 찾을 수 없습니다.');
  }
}

// 파트너추가 함수
export async function addLevel(): Promise<void> {
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
        adminId: localStorage.getItem("user_id"),
      }),
    });

    const result: ApiResponse<Level[]> = await response.json();

    if (response.ok && result.success) {
      const newLevel: Level = {
        idx: nextId,
        partner_name: newName,
        order: nextId,
      };

      fetchData();
      fetchPartners();

      permissions[nextId] = {
        view: false,
        edit: false,
        commission: false,
      };

      renderLevels();
      // updateLevelFilters();
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


// 파트너 행 생성 함수
function createPartnerRow(
    partner: LevelPartner,
    partnerLevels: PartnerSettingData[],
    permissions: Permissions,
    specialPaths: SpecialPaths,
    getFullPath: (levelId: number) => string[]
): HTMLTableRowElement {
    const tr = document.createElement('tr');

    const level = partnerLevels.find((l) => l.idx === partner.levelId);

    const perms = {
      view: level?.view_permission === "1",
      edit: level?.edit_permission === "1",
      commission: level?.commission_permission === "1",
    };
    const badges: string[] = [];

    if (perms.view) badges.push('<span class="permission-badge active">조회</span>');
    if (perms.edit) badges.push('<span class="permission-badge active">수정</span>');
    if (perms.commission) badges.push('<span class="permission-badge active">수수료</span>');

    const permissionBadges = `
        <div class="permission-badges">
          ${badges.join(', ')}
        </div>
    `;

    const pathInfo = specialPaths[partner.levelId] || {};
    const data = partnerLevels.find(l => l.idx === partner.levelId);
    let pathDisplay = `<span class="path-display">${data && data.partner_path && data.partner_path.trim() !== '' ? data.partner_path : '-'}</span>`;

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

// 권한 모달 관리
export function openPermissionModal(levelId: number): void {
    const level = partnerLevels.find((l) => l.idx === levelId);
    if (!level) return;

    const permissionLevelId = document.getElementById('permissionLevelId') as HTMLInputElement | null;
    const permissionPartnerName = document.getElementById('permissionPartnerName') as HTMLElement | null;
    const permView = document.getElementById('perm_view') as HTMLInputElement | null;
    const permEdit = document.getElementById('perm_edit') as HTMLInputElement | null;
    const permCommission = document.getElementById('perm_commission') as HTMLInputElement | null;
    const permissionModal = document.getElementById('permissionModal') as HTMLElement | null;

    if (permissionLevelId) permissionLevelId.value = String(levelId);
    if (permissionPartnerName) permissionPartnerName.textContent = level.partner_name;

    const perms = permissions[levelId] || { view: false, edit: false, commission: false };
    if (permView) permView.checked = perms.view;
    if (permEdit) permEdit.checked = perms.edit;
    if (permCommission) permCommission.checked = perms.commission;

    loadPathOptions(levelId);

    if (permissionModal) permissionModal.classList.add('show');
}

export function loadPathOptions(currentLevelId: number): void {
  const targetSelect = document.getElementById('pathTargetLevel') as HTMLSelectElement | null;
  if (!targetSelect) return;

  targetSelect.innerHTML = '<option value="">선택 안함</option>';

  partnerLevels.forEach((level) => {
    if (level.idx < currentLevelId) {
      const option = document.createElement('option');
      option.value = String(level.idx);
      option.textContent = level.partner_name;
      targetSelect.appendChild(option);
    }
  });

  const pathInfo = specialPaths[currentLevelId];
  if (pathInfo?.targetLevel !== undefined) {
    targetSelect.value = String(pathInfo.targetLevel);
  }
}


//수정 모달창 저장
export async function savePermissions(): Promise<void> {
    const levelId = parseInt((document.getElementById('permissionLevelId') as HTMLInputElement).value, 10);

    permissions[levelId] = {
        view: (document.getElementById('perm_view') as HTMLInputElement).checked,
        edit: (document.getElementById('perm_edit') as HTMLInputElement).checked,
        commission: (document.getElementById('perm_commission') as HTMLInputElement).checked
    };

    const targetLevel = (document.getElementById('pathTargetLevel') as HTMLInputElement).value;

    try {
        const adminId = localStorage.getItem("user_id") || "";
        const EditLevelId = levelId;

        const permissionData = {
            view_permission: (document.getElementById('perm_view') as HTMLInputElement).checked || false,
            edit_permission: (document.getElementById('perm_edit') as HTMLInputElement).checked || false,
            commission_permission: (document.getElementById('perm_commission') as HTMLInputElement).checked || false
        };

        const upperLevelId = targetLevel === "" ? null : Number(targetLevel);

        const payload = {
            adminId,
            EditLevelId,
            permissionData,
            upperLevelId
        };

        const response = await fetch('/api/partner/PartnerSetting/editInfo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        console.log("payload", payload);

        const result: {
            success: boolean;
            message: string;
            error?: string;
            affectedChildren?: number[];
        } = await response.json();

        if (result.success) {
          if (result.affectedChildren && result.affectedChildren.length > 0) {
              const converted = result.affectedChildren.map(id => ({
                id: String(id), // id는 string이어야 하니까 변환
                name: ''        // 이름 정보가 없으니 일단 빈 문자열로
              }));
              affectedChildren.set(converted); // 타입 일치
            }

            console.log("result", result);
            showToast(result.message, "info");

            await loadMenuData();

            setTimeout(() => {
                fetchData();
            }, 1500);
        } else {
            console.error('서버 응답 오류:', result);
            alert(`오류: ${result.message}\n에러: ${result.error}`);
        }

    } catch (error) {
        console.error('수정 중 오류 발생:', error);
        alert('서버 오류 발생');
    }

    showToast('권한이 저장되었습니다.', 'info');
    fetchData();
    closePermissionModal();
}

export function closePermissionModal(): void {
    const modal = document.getElementById('permissionModal');
    if (modal instanceof HTMLElement) {
        modal.classList.remove('show');
    } else {
        console.warn('permissionModal element not found or is not an HTMLElement.');
    }
}

// 전역함수 등록
if (typeof window !== 'undefined') {
  (window as any).openPermissionModal = openPermissionModal;
  (window as any).closePermissionModal = closePermissionModal;
  (window as any).editLevelName = editLevelName;
  (window as any).saveLevelName = saveLevelName;
  (window as any).deleteLevel = deleteLevel;
}