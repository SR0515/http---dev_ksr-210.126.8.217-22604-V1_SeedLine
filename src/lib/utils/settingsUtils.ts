import { showToast } from '$lib/stores/toast';
import { authStore } from '$lib/stores/auth';
import { get } from 'svelte/store';

// 비밀번호 검증 함수
export function validatePassword(password: string, confirmPassword: string): boolean {
    if (password !== "" && confirmPassword === "") {
        showToast("비밀번호 확인을 입력해주세요.", "info");
        return false;
    }
    if (confirmPassword !== "" && password === "") {
        showToast("새 비밀번호를 입력해주세요.", "info");
        return false;
    }
    if (password !== confirmPassword) {
        showToast("비밀번호와 비밀번호 확인이 다릅니다.", "info");
        return false;
    }
    return true;
}

// 날짜 포맷팅 함수 (한국 시간 형식)
export function formatDateTime(datetimeStr: string): string {
    if (!datetimeStr) return '';
    
    const date = new Date(datetimeStr);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    let hour = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');

    const ampm = hour >= 12 ? '오후' : '오전';
    if (hour > 12) hour -= 12;
    if (hour === 0) hour = 12;

    return `${year}-${month}-${day} ${ampm} ${hour}:${minutes}:${seconds}`;
}

// 공통 API 호출 함수
export async function fetchUserInfo(): Promise<any> {
    const auth = get(authStore);
    if (!auth.userId || !auth.classify) {
        throw new Error('사용자 정보가 없습니다.');
    }

    const response = await fetch(`/api/InfoEdit?userId=${auth.userId}&classify=${auth.classify}`);
    const json = await response.json();

    if (!json.success) {
        throw new Error(json.message || '데이터를 불러오는데 실패했습니다.');
    }

    return json.data;
}

// 사용자 정보 업데이트 함수
export async function updateUserInfo(role: 'Admin' | 'Partner' | 'Store', data: any): Promise<boolean> {
    try {
        const response = await fetch(`/api/InfoEdit/${role}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        
        if (result.success) {
            showToast("정보수정 완료", "info");
            return true;
        } else {
            console.error('서버 응답 오류:', result);
            showToast(`오류: ${result.message}`, "error");
            return false;
        }
    } catch (error) {
        console.error('수정 중 오류 발생:', error);
        showToast('서버 오류 발생', "error");
        return false;
    }
}

// 주소 검색 함수 (daum.Postcode)
export function initializeAddressSearch(addressInputId: string, detailInputId: string, onAddressSelected?: (address: string) => void) {
    const addressInput = document.getElementById(addressInputId);
    const searchButton = document.getElementById(`${addressInputId}_search`);
    
    const openPostcode = () => {
        // @ts-ignore - daum.Postcode는 외부 라이브러리
        new daum.Postcode({
            oncomplete: function (data: any) {
                const address = data.address;
                
                // 주소 입력 필드에 값 설정
                if (addressInput) {
                    (addressInput as HTMLInputElement).value = address;
                }
                
                // 상세주소 입력 필드에 포커스
                const detailInput = document.getElementById(detailInputId);
                if (detailInput) {
                    detailInput.focus();
                }
                
                // 콜백 함수 호출
                if (onAddressSelected) {
                    onAddressSelected(address);
                }
            }
        }).open();
    };

    // 검색 버튼 클릭 이벤트
    if (searchButton) {
        searchButton.addEventListener('click', openPostcode);
    }
    
    // 주소 입력 필드 클릭 이벤트
    if (addressInput) {
        addressInput.addEventListener('click', openPostcode);
    }
}

// 숫자만 입력 허용 함수
export function restrictToNumbers(event: Event) {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/[^0-9]/g, '');
}

// 페이지 제목 생성 함수
export function getPageTitle(role: string, rate?: string): string {
    if (role === 'admin') return '관리자';
    if (role === 'partner') {
        if (rate === 'p1') return '대행사관리';
        if (rate === 'p2') return '에이전시관리';
        return '관리';
    }
    if (role === 'store') return '가맹점';
    return '정보수정';
}