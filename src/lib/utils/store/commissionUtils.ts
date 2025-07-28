import { showToast } from '$lib/stores/toast';
import { get } from 'svelte/store';
import { authStore } from '$lib/stores/auth';
import { loadMenuData } from '$lib/utils/menuUtils';
import type { RawStoreData, MerchantData, MerchantLevel } from '$lib/types/commission';

let auth = get(authStore);
let classify = auth.classify;
let rate = auth.rate;
let userId = auth.userId;


declare const merchants: MerchantData[]; 

// 가맹점 수수료 데이터 조회
export async function getStoreCommissionData(
    page: number = 1,
    pageSize: number = 12,
    searchParams: {
        searchSelect?: string;
        searchText?: string;
    } = {}
    ) {
    try {
        auth = get(authStore);
        classify = auth.classify ?? '';
        rate = auth.rate ?? '';
        userId = auth.userId ?? '';

        const params = new URLSearchParams({
            classify,
            rate,
            userId,
            page: page.toString(),
            page_size: pageSize.toString(),
            search_select: searchParams.searchSelect ?? '',
            search_text: searchParams.searchText ?? ''
        });

        const response = await fetch('/api/store/storeCommissionTable?' + params.toString());
        const json = await response.json();

        if (json.success) {
            const merchants = json.data;
            const totalCount = json.pagination?.totalCount ?? 0;
            const totalPages = Math.ceil(totalCount / pageSize);

            return {
                data: merchants,
                pagination: {
                totalCount,
                currentPage: page,
                totalPages,
                pageSize
                }
            };
        } else {
            throw new Error(json.message);
        }
    } catch (error) {
        console.error('정산 수수료 데이터 조회 실패:', error);
        const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
        showToast(`데이터를 불러올 수 없습니다: ${errorMessage}`, 'error');

        return {
            data: [],
            pagination: {
                totalCount: 0,
                currentPage: 1,
                totalPages: 0,
                pageSize
            }
        };
    }
}

// 가맹점 수수료 데이터 가공
export function mapDataToMerchant(data: RawStoreData, index: number = 0) {
  const pathList = data.upper_path?.split(' > ') ?? [];

  const commissionKeys = [
    'prime_AC', 'prime_BC', 'prime_CC', 'prime_DC',
    'prime_EC', 'prime_FC', 'prime_GC', 'prime_HC',
    'prime_IC', 'prime_JC', 'prime_KC', 'prime_LC', 'prime_MC'
  ];

  const hierarchy = pathList.map((name, i) => ({
    name,
    commission: parseFloat(data[commissionKeys[i]] ?? 0)
  }));

  const totalCommission = parseFloat(String(data.terminal_C ?? 0));
  const merchantCommission = parseFloat(String(data.store_wallet?.terminal_commission ?? 0));

  const createdDate = data.store_basic_info?.join_date?.split(' ')[0] ?? '';
  const lastUpdated = data.store_commission_edit_logs?.[0]?.edit_date?.split(' ')[0] ?? '';

  return {
    id: data.id,
    name: data.store_name,
    status: 'active', // 추후 필요 시 status 필드 추가 가능
    totalCommission,
    hasCommission: !!merchantCommission,
    hierarchy,
    merchantCommission,
    createdDate,
    lastUpdated
  };
}


// 수수료 수정 함수
export async function commissionEdit(
        id: string | number,
        merchants: MerchantData[]
    ): Promise<void> {
    const merchant = merchants.find(m => m.id === id);
    if (!merchant) {
        console.error("❌ merchant not found for id:", id);
        return;
    }

    // 각 단계 수수료 변수 초기화
    let AC = 0, BC = 0, CC = 0, DC = 0, EC = 0, FC = 0, GC = 0, HC = 0, IC = 0, JC = 0, KC = 0, LC = 0, MC = 0;

    // 계층별 수수료 추출 (index 기반)
    merchant.hierarchy.forEach((level, idx) => {
        const input = document.getElementById(`comm-${id}-${idx}`) as HTMLInputElement | null;
        const value = parseFloat(input?.value ?? "0");

        switch (idx) {
            case 0: AC = value; break;
            case 1: BC = value; break;
            case 2: CC = value; break;
            case 3: DC = value; break;
            case 4: EC = value; break;
            case 5: FC = value; break;
            case 6: GC = value; break;
            case 7: HC = value; break;
            case 8: IC = value; break;
            case 9: JC = value; break;
            case 10: KC = value; break;
            case 11: LC = value; break;
            case 12: MC = value; break;
        }
    });

    const merchantCommInput = document.getElementById(`merchant-comm-${id}`) as HTMLInputElement | null;
    const terminal_C = parseFloat(merchantCommInput?.value ?? "0");

    const sum = AC + BC + CC + DC + EC + FC + GC + HC + IC + JC + KC + LC + MC;

    if (terminal_C > sum) {
        showToast("파트너 수수료가 부족합니다.", "error");
        document.getElementById(`comm-${id}-0`)?.focus();
        return;
    } else if (sum > terminal_C) {
        showToast("가맹점 수수료보다 적어야 합니다.", "error");
        return;
    }

    const classify = localStorage.getItem("classify");
    const userId = localStorage.getItem("user_id");
    const commissionData = {
        store_settlement_id: id,
        store_settlement_AC: AC,
        store_settlement_BC: BC,
        store_settlement_CC: CC,
        store_settlement_DC: DC,
        store_settlement_EC: EC,
        store_settlement_FC: FC,
        store_settlement_GC: GC,
        store_settlement_HC: HC,
        store_settlement_IC: IC,
        store_settlement_JC: JC,
        store_settlement_KC: KC,
        store_settlement_LC: LC,
        store_settlement_MC: MC,
        store_settlement_terminal: terminal_C,
    };

    const clientIP = await getClientIP();

    const editData = {
        ip: clientIP,
        browser: navigator.userAgent,
        url: window.location.href,
    };

    const payload = { classify, userId, commissionData, editData };

    try {
        const res = await fetch(`/api/store/storeCommissionTable/commissionEdit/${id}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        const result = await res.json();
        if (result.success) {
            loadMenuData(); // LeftMenu count 갱신
            showToast("수수료 수정 성공", "info");
            await getStoreCommissionData();
        } else {
            showToast("오류: " + result.message, "error");
        }
    } catch (err) {
        console.error("API 호출 중 오류:", err);
    }
}

// 공인 IP 조회
export async function getClientIP(): Promise<string> {
    try {
        const res = await fetch('https://api.ipify.org?format=json');
        if (!res.ok) throw new Error('요청 실패');

        const data: { ip: string } = await res.json();
        return data.ip;
    } catch (err) {
        console.error('IP 조회 실패:', err);
        return "unknown";
    }
}

// 수수료 숫자 포맷팅 함수
export function formatCommission(value: string | number | null | undefined): string {
    const num = typeof value === 'number' ? value : parseFloat(String(value));
    if (isNaN(num)) return '0.00';
    return num.toFixed(2);
}

// 입력값 포맷팅
export function formatInputValue(input: HTMLInputElement): void {
    const value = parseFloat(input.value);
    if (!isNaN(value)) {
        input.value = formatCommission(value);
    }
}

// Path 색상 업데이트 함수
export function updatePathColor(merchantId: string | number, index: number): void {
    const card = document.querySelector(`[data-merchant-id="${merchantId}"]`) as HTMLElement | null;
    if (!card) return;

    const pathItem = card.querySelector(`.path-item[data-index="${index}"]`) as HTMLElement | null;
    const input = document.getElementById(`comm-${merchantId}-${index}`) as HTMLInputElement | null;

    if (pathItem && input) {
        const value = parseFloat(input.value) || 0;
        if (value === 0) {
            pathItem.classList.add('zero-commission');
        } else {
            pathItem.classList.remove('zero-commission');
        }
    }
}

// Path 아이템 클릭 시 수수료 입력창 포커스
export function setupPathClickEvents(): void {
    document.addEventListener('click', (e: MouseEvent) => {
        const target = e.target as HTMLElement;

        if (target.classList.contains('path-item')) {
            const merchantCard = target.closest('.merchant-card') as HTMLElement | null;
            if (!merchantCard) return;

            const merchantId = merchantCard.dataset.merchantId;
            if (!merchantId) return;

            let commissionInput: HTMLInputElement | null = null;

            if (target.hasAttribute('data-merchant')) {
                // 가맹점 클릭한 경우
                commissionInput = document.getElementById(`merchant-comm-${merchantId}`) as HTMLInputElement | null;
            } else {
                // 일반 상위 단계 클릭한 경우
                const indexAttr = target.getAttribute('data-index');
                const index = indexAttr ? parseInt(indexAttr) : NaN;
                if (!isNaN(index)) {
                    commissionInput = document.getElementById(`comm-${merchantId}-${index}`) as HTMLInputElement | null;
                }
            }

            if (commissionInput && !commissionInput.disabled) {
                const commissionSection = merchantCard.querySelector('.commission-section') as HTMLElement | null;
                const commissionItem = commissionInput.closest('.commission-item') as HTMLElement | null;

                if (commissionSection && commissionItem) {
                    const itemLeft = commissionItem.offsetLeft;
                    const itemWidth = commissionItem.offsetWidth;
                    const sectionWidth = commissionSection.clientWidth;
                    const scrollLeft = itemLeft - (sectionWidth - itemWidth) / 2;

                    commissionSection.scrollTo({
                        left: Math.max(0, scrollLeft),
                        behavior: 'smooth',
                    });
                }

                // 하이라이트 효과 초기화
                document.querySelectorAll('.commission-input.highlighted').forEach((input) => {
                    (input as HTMLElement).classList.remove('highlighted');
                });

                commissionInput.classList.add('highlighted');

                setTimeout(() => {
                    commissionInput?.focus();
                    commissionInput?.select();
                }, 300);

                setTimeout(() => {
                    commissionInput?.classList.remove('highlighted');
                }, 3000);
            }
        }
    });
}

// 수수료 스크롤
export function scrollCommission(section: HTMLElement, direction: 'left' | 'right'): void {
    const scrollAmount = 120;

    if (direction === 'left') {
        section.scrollTo({
            left: Math.max(0, section.scrollLeft - scrollAmount),
            behavior: 'smooth'
        });
    } else {
        section.scrollTo({
            left: Math.min(section.scrollWidth - section.clientWidth, section.scrollLeft + scrollAmount),
            behavior: 'smooth'
        });
    }
}

// 스크롤 인디케이터 업데이트
export function updateScrollIndicators(wrapper: HTMLElement, section: HTMLElement): void {
    const leftIndicator = wrapper.querySelector<HTMLElement>('.scroll-indicator.left');
    const rightIndicator = wrapper.querySelector<HTMLElement>('.scroll-indicator.right');

    if (!leftIndicator || !rightIndicator) return;

    const scrollLeft = section.scrollLeft;
    const scrollWidth = section.scrollWidth;
    const clientWidth = section.clientWidth;

    const canScroll = scrollWidth > clientWidth;

    if (!canScroll) {
        leftIndicator.classList.remove('visible');
        rightIndicator.classList.remove('visible');
        return;
    }

    // 왼쪽 인디케이터
    if (scrollLeft > 5) {
        leftIndicator.classList.add('visible');
    } else {
        leftIndicator.classList.remove('visible');
    }

    // 오른쪽 인디케이터
    if (scrollLeft < scrollWidth - clientWidth - 5) {
        rightIndicator.classList.add('visible');
    } else {
        rightIndicator.classList.remove('visible');
    }
}

// 인디케이터 표시
export function showIndicators(wrapper: HTMLElement, section: HTMLElement): void {
  const grid = section.querySelector<HTMLElement>('.commission-grid');

  // 스크롤 가능 여부 확인
  if (grid && grid.scrollWidth > section.clientWidth) {
    const indicators = wrapper.querySelectorAll<HTMLElement>('.scroll-indicator');
    indicators.forEach((ind) => {
      ind.style.display = 'flex';
    });

    // 즉시 위치 업데이트
    setTimeout(() => updateScrollIndicators(wrapper, section), 10);
  }
}

// 인디케이터 숨김
export function hideIndicators(wrapper: HTMLElement): void {
    const indicators = wrapper.querySelectorAll<HTMLElement>('.scroll-indicator');
    indicators.forEach((ind) => {
        ind.classList.remove('visible');

        setTimeout(() => {
            if (!ind.classList.contains('visible')) {
                ind.style.display = 'none';
            }
        }, 200);
    });
}

// 카드 호버 효과 관리
export function setupCardHoverEffects(): void {
    const cards = document.querySelectorAll<HTMLElement>('.merchant-card');

    cards.forEach((card) => {
        const wrapper = card.querySelector<HTMLElement>('.commission-wrapper');
        const section = card.querySelector<HTMLElement>('.commission-section');
        const leftIndicator = card.querySelector<HTMLElement>('.scroll-indicator.left');
        const rightIndicator = card.querySelector<HTMLElement>('.scroll-indicator.right');

        if (!wrapper || !section || !leftIndicator || !rightIndicator) return;

        let hideTimeout: number;

        // wrapper 영역 마우스 진입
        wrapper.addEventListener('mouseenter', (e: MouseEvent) => {
            e.stopPropagation();
            clearTimeout(hideTimeout);
            showIndicators(wrapper, section);
        });

        // wrapper 영역 마우스 이탈
        wrapper.addEventListener('mouseleave', (e: MouseEvent) => {
            e.stopPropagation();
            hideTimeout = window.setTimeout(() => {
                hideIndicators(wrapper);
            }, 300);
        });

        // 스크롤 이벤트
        section.addEventListener('scroll', () => {
        clearTimeout(hideTimeout);
        showIndicators(wrapper, section);
        updateScrollIndicators(wrapper, section);

        hideTimeout = window.setTimeout(() => {
                if (!wrapper.matches(':hover')) {
                    hideIndicators(wrapper);
                }
            }, 2000);
        });

        // 좌우 인디케이터 클릭 이벤트
        leftIndicator.addEventListener('click', () => {
            scrollCommission(section, 'left');
        });

        rightIndicator.addEventListener('click', () => {
            scrollCommission(section, 'right');
        });
    });
}

// 실시간 수수료 검증
export function validateCommissions(
    merchantId: string | number,
    merchants: MerchantData[],
    balanceC: number
): boolean {
    const merchant = merchants.find((m) => m.id === merchantId);

    if (!merchant) {
        console.error(`❌ merchant not found for id: ${merchantId}`);
        return false;
    }

    const saveBtn = document.getElementById(`save-${merchantId}`) as HTMLButtonElement | null;
    const card = document.querySelector(`[data-merchant-id="${merchantId}"]`) as HTMLElement | null;

    if (!saveBtn || !card) {
        console.warn(`❌ DOM 요소를 찾을 수 없음 (saveBtn 또는 card)`);
        return false;
    }

    // 비활성 상태면 검증 스킵
    if (merchant.status === 'inactive') {
        saveBtn.disabled = true;
        saveBtn.classList.add('disabled');
        return false;
    }

    let totalUsed = 0;

    // 각 계층 수수료 합산
    merchant.hierarchy.forEach((_, idx) => {
        const input = document.getElementById(`comm-${merchantId}-${idx}`) as HTMLInputElement | null;
        if (input) {
            totalUsed += parseFloat(input.value) || 0;
        }
    });

    // 가맹점 수수료 입력값
    const merchantCommInput = document.getElementById(`merchant-comm-${merchantId}`) as HTMLInputElement | null;
    let merchantComm = 0;

    if (merchantCommInput) {
        merchantComm = parseFloat(merchantCommInput.value) || 0;
    } else {
        console.warn(`⚠️ merchantCommInput not found for id: ${merchantId}`);
    }

    // 총 허용 수수료와 사용 수수료 비교
    const totalCommissionUsed = totalUsed;
    const totalCommissionAllowed = merchant.totalCommission;

    // 수수료 상태 업데이트
    updateCommissionStatus(card, totalCommissionUsed, totalCommissionAllowed, saveBtn, merchantComm, balanceC);

    return totalCommissionUsed === totalCommissionAllowed;
}

// 수수료 상태 UI 업데이트
export function updateCommissionStatus(
        card: HTMLElement,
        used: number,
        allowed: number,
        saveBtn: HTMLButtonElement,
        merchantComm: number,
        balanceC: number 
    ): void {
    let statusBanner = card.querySelector<HTMLElement>('.commission-status-banner');

    // used에서 가맹점 수수료 빼기 (현재 usedWithoutMerchant = used 그대로 사용 중)
    const usedWithoutMerchant = used;

    // 총 수수료 표시 업데이트
    const totalDisplay = card.querySelector<HTMLElement>('.total-value');
    if (totalDisplay) {
        totalDisplay.textContent = allowed.toString();
        const totalCommDiv = card.querySelector<HTMLElement>('.total-commission');
        if (totalCommDiv) {
            if (usedWithoutMerchant !== allowed && balanceC === 0) {
                totalCommDiv.classList.add('mismatched');

                card.querySelector<HTMLElement>('.card-top-section')?.classList.add('commission_red_bg');
                card.querySelector<HTMLElement>('.commission-wrapper')?.classList.add('commission_red_bg');
                card.querySelector<HTMLElement>('.card-footer')?.classList.add('commission_red_bg');
            } else {
                totalCommDiv.classList.remove('mismatched');

                // card.querySelector<HTMLElement>('.card-top-section')?.classList.remove('commission_red_bg');
                // card.querySelector<HTMLElement>('.commission-wrapper')?.classList.remove('commission_red_bg');
                // card.querySelector<HTMLElement>('.card-footer')?.classList.remove('commission_red_bg');
            }
        }
    }

    if (usedWithoutMerchant === allowed && usedWithoutMerchant > 0) {
        // 정확히 맞는 경우
        if (statusBanner) {
            statusBanner.style.animation = 'fadeOutUp 0.5s ease';
            setTimeout(() => statusBanner?.remove(), 500);
        }
        saveBtn.disabled = false;
        saveBtn.classList.remove('disabled');
    } else {
        // allowed 또는 usedWithoutMerchant가 0이면 배너 띄우지 않음
        if (!allowed || !usedWithoutMerchant) {
            card.querySelector<HTMLElement>('.card-top-section')?.classList.add('commission_red_bg');
            card.querySelector<HTMLElement>('.commission-wrapper')?.classList.add('commission_red_bg');
            card.querySelector<HTMLElement>('.card-footer')?.classList.add('commission_red_bg');
            
            if (statusBanner) statusBanner.remove();
            saveBtn.disabled = true;
            saveBtn.classList.add('disabled');
            return;
        }

        // 맞지 않는 경우
        if (!statusBanner) {
            statusBanner = document.createElement('div');
            statusBanner.className = 'commission-status-banner';
            const topSection = card.querySelector<HTMLElement>('.card-top-section');
            topSection?.appendChild(statusBanner);
        }

        if (usedWithoutMerchant > allowed) {
            statusBanner.innerHTML = `<i class="fas fa-exclamation-circle"></i> 초과: ${formatCommission(usedWithoutMerchant - allowed)}%`;
            statusBanner.className = 'commission-status-banner error';
        } else if (usedWithoutMerchant < allowed) {
            statusBanner.innerHTML = `<i class="fas fa-info-circle"></i> 부족: ${formatCommission(allowed - usedWithoutMerchant)}%`;
            statusBanner.className = 'commission-status-banner warning';
        }

        saveBtn.disabled = true;
        saveBtn.classList.add('disabled');
    }
}

// 수정 상태 표시
export function markAsModified(
    merchantId: string | number,
    merchants: MerchantData[],
    balanceC: number
): void {
    const merchant = merchants.find(m => m.id === merchantId);

    if (!merchant) {
        console.warn(`merchant not found for id: ${merchantId}`);
        return;
    }

    // 비활성 상태면 무시
    if (merchant.status === 'inactive') {
        return;
    }

    const saveBtn = document.getElementById(`save-${merchantId}`) as HTMLButtonElement | null;
    if (!saveBtn) {
        console.warn(`save button not found for merchantId: ${merchantId}`);
        return;
    }

    const isValid = validateCommissions(merchantId, merchants, balanceC);

    if (isValid) {
        saveBtn.classList.add('modified', 'shake-animation');
        setTimeout(() => {
            saveBtn.classList.remove('shake-animation');
        }, 500);
    }
}

// 수수료 저장
export async function saveCommissions(
    merchantId: string | number,
    merchants: MerchantData[],
    balanceC: number
): Promise<void> {
  const merchant = merchants.find(m => m.id === merchantId);
  if (!merchant) {
    console.warn(`merchant not found for id: ${merchantId}`);
    return;
  }

  // 비활성 상태 확인
  if (merchant.status === 'inactive') {
    showNotification('비활성 가맹점은 수정할 수 없습니다.', 'error');
    return;
  }

  const saveBtn = document.getElementById(`save-${merchantId}`) as HTMLButtonElement | null;
  if (!saveBtn) {
    console.warn(`save button not found for merchantId: ${merchantId}`);
    return;
  }

  // 검증 실패시 저장 불가
  if (!validateCommissions(merchantId, merchants, balanceC)) {
    showNotification('수수료 합계가 총 수수료와 일치해야 합니다.', 'error');
    saveBtn.classList.add('shake-animation');
    setTimeout(() => {
      saveBtn.classList.remove('shake-animation');
    }, 500);
    return;
  }

  // 저장 애니메이션 시작
  saveBtn.classList.add('saving');
  saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span class="save-text">저장중...</span>';

  // 실제 저장 로직 (딜레이 시뮬레이션)
  setTimeout(() => {
    const merchant = merchants.find(m => m.id === merchantId);
    if (!merchant) return;

    let hasAnyCommission = false;

    // 각 레벨의 수수료 업데이트
    merchant.hierarchy.forEach((level, idx) => {
      const input = document.getElementById(`comm-${merchantId}-${idx}`) as HTMLInputElement | null;
      if (input) {
        level.commission = parseFloat(input.value) || 0;
        if (level.commission > 0) hasAnyCommission = true;
        // 입력값 포맷팅
        input.value = formatCommission(level.commission);
      }
    });

    // 가맹점 수수료 업데이트
    const merchantCommInput = document.getElementById(`merchant-comm-${merchantId}`) as HTMLInputElement | null;
    if (merchantCommInput) {
      merchant.merchantCommission = parseFloat(merchantCommInput.value) || 0;
      if (merchant.merchantCommission > 0) hasAnyCommission = true;
      // 입력값 포맷팅
      merchantCommInput.value = formatCommission(merchant.merchantCommission);
    }

    // 수수료 지정 여부 업데이트
    merchant.hasCommission = hasAnyCommission;

    // 날짜 업데이트
    merchant.lastUpdated = new Date().toISOString().split('T')[0];

    // 저장 완료 애니메이션
    saveBtn.classList.remove('saving');
    saveBtn.classList.add('saved');
    saveBtn.innerHTML = '<i class="fas fa-check-circle"></i><span class="save-text">완료!</span>';

    // 카드 업데이트
    const card = document.querySelector(`[data-merchant-id="${merchantId}"]`) as HTMLElement | null;
    if (card) {
      if (hasAnyCommission) {
        card.classList.remove('no-commission');
        const banner = card.querySelector<HTMLElement>('.commission-required-banner');
        if (banner) {
          banner.style.animation = 'fadeOutUp 0.5s ease';
          setTimeout(() => banner.remove(), 500);
        }
        const badge = card.querySelector<HTMLElement>('.no-commission-badge');
        if (badge) {
          badge.style.animation = 'fadeOut 0.3s ease';
          setTimeout(() => badge.remove(), 300);
        }
      } else {
        card.classList.add('no-commission');
      }

      // 날짜 업데이트 
      const updatedDate = card.querySelector<HTMLElement>('.updated-date');
      if (updatedDate) {
        updatedDate.innerHTML = `<i class="fas fa-clock"></i> 수정: ${merchant.lastUpdated}`;
      }
    }

    // 2초 후 버튼 원래 상태로
    setTimeout(() => {
      saveBtn.classList.remove('saved', 'modified', 'pulse-animation');
      saveBtn.innerHTML = '<i class="fas fa-save"></i><span class="save-text">저장</span>';
      if (!hasAnyCommission) {
        saveBtn.classList.add('pulse-animation');
      }
    }, 2000);
  }, 800);

  // commissionEdit 호출 (API 통신)
  try {
    await commissionEdit(merchantId, merchants);
  } catch (error) {
    console.error('수수료 API 수정 중 오류:', error);
    showNotification('서버 저장 중 오류가 발생했습니다.', 'error');
  }
}

// 알림 표시 함수
function showNotification(message: string, type: 'info' | 'error' | 'success' | 'warning' = 'info'): void {
    const mask = document.createElement('div');
    mask.className = 'commission_toast-mask';
    document.body.appendChild(mask);

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        mask.style.opacity = '0';
        setTimeout(() => {
            notification.remove();
            mask.remove();
        }, 500);
    }, 1500);
}
