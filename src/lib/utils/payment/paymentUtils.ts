import html2canvas from 'html2canvas';
import { showToast } from '$lib/stores/toast';
import { get } from 'svelte/store';
import { authStore } from '$lib/stores/auth';
import { getTodayDate } from '$lib/utils/formatters';

import type { PaymentListData, PaymentStats, PaymentListResponse, PaymentSearchParams, PayType, CancelState, CancelResponse, 
  SalesSearchParams, SalesListResponse, SalesListData} from '$lib/types/payment';

let auth = get(authStore);
let classify = auth.classify;
let rate = auth.rate;
let userId = auth.userId;

let showConfirm = false;
let confirmResolve: ((value: boolean) => void) | null = null;

// 페이지 제목 생성 함수
export function getPageTitle(role: string, rate?: string): string {
    if (role === 'paymentList') return '결제내역 관리 - 결제내역';
    if (role === 'salesList') return '결제내역 관리 - 매출내역';
    if (role === 'duplicateList') return '결제내역 관리 - 중복결제알림';
    return '관리';
}

// 영수증 열기
export function openReceipt(): void {
  const receiptWindow = window.open(
    `${window.location.origin}/payment/receipt`,
    '_blank',
    'width=400,height=700'
  );

  if (!receiptWindow) {
    console.warn('팝업 차단에 의해 새 창을 열 수 없습니다.');
  }
}


// 스크린샷 캡처 함수
export function captureScreenshot(elementId: string, filename: string = 'screenshot.png'): void {
  const element = document.getElementById(elementId) as HTMLElement | null;

  if (!element) {
    console.error('Element not found:', elementId);
    return;
  }

  html2canvas(element)
    .then((canvas: HTMLCanvasElement) => {
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = filename;
      link.click();
    })
    .catch((error: unknown) => {
      console.error('Error capturing screenshot:', error);
    });
}

// 시간 문자열 반환 함수 
export function getCurrentTime(): string {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}${minutes}`;
}

// 버튼 클릭 핸들러
export function handleCapture(): void {
  const filename = `결제내역_${getTodayDate()}${getCurrentTime()}`;
  captureScreenshot('table_wrap', filename);
}

// 결제내역 데이터 조회
export async function getPaymentListData(
  page: number = 1,
  pageSize: number = 10,
  searchParams: 
  PaymentSearchParams = {}
): Promise<PaymentListResponse> {
  try {
    const auth = get(authStore);
    const classify = auth.classify ?? '';
    const rate = auth.rate ?? '';
    const userId = auth.userId ?? '';

    const params = new URLSearchParams({
      classify,
      rate,
      userId,
      page: page.toString(),
      page_size: pageSize.toString(),
      pg_select: searchParams.pgSelect ?? '',
      search_select: searchParams.searchSelect ?? '',
      search_text: searchParams.searchText ?? '',
      cancel_select: searchParams.cancelSelect ?? '',
      start_date: searchParams.startDate ?? '',
      end_date: searchParams.endDate ?? ''
    });

    const response = await fetch('/api/payment/terminal_pay_view?' + params.toString());
    const json = await response.json();

    if (json.success) {
      const rawPaymentList: PaymentListData[] = json.data ?? [];
      const totalCount = json.total_count ?? 0;
      const totalPages = Math.ceil(totalCount / pageSize);
      const totalStats: PaymentStats = json.total_stats ?? {};

      let filteredData = rawPaymentList;

      if (searchParams.searchText && searchParams.searchSelect) {
        if (searchParams.searchSelect === 'TID') {
          filteredData = rawPaymentList.filter(item =>
            item.T_catId?.includes(searchParams.searchText!) ||
            item.Ki_catId?.includes(searchParams.searchText!)
          );
        } else {
          filteredData = rawPaymentList.filter(item => {
            const value = (item as any)[searchParams.searchSelect!];
            return value && value.toString().includes(searchParams.searchText!);
          });
        }
      }

      return {
        data: filteredData,
        totalStats,
        pagination: {
          totalCount,
          totalPages,
          currentPage: page,
          pageSize
        }
      };
    } else {
      throw new Error(json.message || '서버 응답 실패');
    }
  } catch (error) {
    console.error('결제내역 데이터 조회 실패:', error);
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류입니다.';
    showToast(`데이터를 불러올 수 없습니다: ${errorMessage}`, 'error');

    return {
      data: [],
      totalStats: {},
      pagination: {
        totalCount: 0,
        totalPages: 0,
        currentPage: page,
        pageSize
      }
    };
  }
}

// 결제취소 함수
export async function paymentCancel(
  payType: PayType,
  cancelState: CancelState,
  tid: string
): Promise<void> {
  const isConfirmed = await showConfirmModal('정말로 이 결제를 취소하시겠습니까?');
  if (!isConfirmed) return;

  try {
    if (cancelState !== "N") {
      showToast('취소할 수 없는 결제 건 입니다.');
      return;
    }

    let endpoint = '';
    if (payType === "1") {
      endpoint = '/api/kwon/payment/keyin/cancel'; // 수기결제
    } else if (payType === "4") {
      endpoint = '/api/kwon/payment/3dPay/cancel'; // 인증결제
    } else {
      showToast('유효하지 않은 결제 방식입니다.');
      return;
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ trackId: tid }),
    });

    const data: CancelResponse = await response.json();

    if (data.success) {
      showToast('취소가 완료되었습니다.');
    } else {
      showToast(data.message ?? '취소 실패. 관리자 문의.');
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류입니다.';
    showToast(`취소 중 오류 발생: ${errorMessage}`, 'error');
  } finally {
    location.reload();
  }
}

// 결제내역 showconfirm 모달
export async function showConfirmModal(message: string): Promise<boolean> {
  showConfirm = true;

  return new Promise<boolean>((resolve) => {
    confirmResolve = resolve;
    // 여기서 message를 사용해 모달 메시지 바인딩도 가능
    // 예: confirmMessage = message;
  });
}

// 날짜 포맷 함수
export function formatPayDate(dateString: string): string {
    if (!dateString) return '';

    try {
        let date: Date;

        // YYYYMMDDHHmmss 형식인 경우 직접 파싱
        if (/^\d{14}$/.test(dateString)) {
            const year = dateString.slice(0, 4);
            const month = dateString.slice(4, 6);
            const day = dateString.slice(6, 8);
            const hour = dateString.slice(8, 10);
            const minute = dateString.slice(10, 12);
            const second = dateString.slice(12, 14);
            date = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}`);
        } else {
            // 일반 문자열 처리
            date = new Date(dateString);
        }

        if (isNaN(date.getTime())) return 'Invalid Date';

        // 원하는 포맷: YYYY-MM-DD HH:mm:ss
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        const hh = String(date.getHours()).padStart(2, '0');
        const mi = String(date.getMinutes()).padStart(2, '0');
        const ss = String(date.getSeconds()).padStart(2, '0');

        return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
    } catch (error) {
        return 'Invalid Date';
    }
}

// 매출내역 데이터 조회
export async function getSalesListData(
  page: number = 1,
  pageSize: number = 10,
  searchParams: SalesSearchParams = {}
): Promise<SalesListResponse> {
  try {
    const auth = get(authStore);
    const classify = auth.classify ?? '';
    const rate = auth.rate ?? '';

    const params = new URLSearchParams({
      classify,
      rate,
      page: page.toString(),
      page_size: pageSize.toString(),
      search_select: searchParams.searchSelect ?? '',
      cancelYN: searchParams.cancelYN ?? '',
      search_text: searchParams.searchText ?? '',
      start_date: searchParams.startDate ?? '',
      end_date: searchParams.endDate ?? ''
    });

    const response = await fetch('/api/payment/terminal_sales_list?' + params.toString());
    const json = await response.json();

    if (json.success) {
      const rawPaymentList: SalesListData[] = json.data ?? [];
      const totalCount = json.total_count ?? 0;
      const totalPages = Math.ceil(totalCount / pageSize);
      const totalStats: PaymentStats = json.total_stats ?? {};

      let filteredData = rawPaymentList;

      if (searchParams.searchText && searchParams.searchSelect) {
        if (searchParams.searchSelect === 'TID') {
          filteredData = rawPaymentList.filter(item =>
            item.T_catId?.toString().includes(searchParams.searchText!) ||
            item.Ki_catId?.toString().includes(searchParams.searchText!)
          );
        } else {
          filteredData = rawPaymentList.filter(item => {
            const value = (item as any)[searchParams.searchSelect!];
            return value && value.toString().includes(searchParams.searchText!);
          });
        }
      }

      return {
        data: filteredData,
        totalStats,
        pagination: {
          totalCount,
          totalPages,
          currentPage: page,
          pageSize
        }
      };
    } else {
      throw new Error(json.message || '서버 응답 실패');
    }
  } catch (error) {
    console.error('터미널 매출 데이터 조회 실패:', error);
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류입니다.';
    showToast(`데이터를 불러올 수 없습니다: ${errorMessage}`, 'error');

    return {
      data: [],
      totalStats: {},
      pagination: {
        totalCount: 0,
        totalPages: 0,
        currentPage: page,
        pageSize
      }
    };
  }
}

// 매출내역 모달
export function showSalesDetails(): void {
  const modal = document.getElementById("detail_modal");

  if (modal) {
    modal.style.display = "block";
  } else {
    console.warn("모달 요소를 찾을 수 없습니다: #detail_modal");
  }
}

export function closeModal(): void {
  const modal = document.getElementById("detail_modal");
  if (modal instanceof HTMLElement) {
    modal.style.display = "none";
  }
}