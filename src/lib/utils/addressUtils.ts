declare global {
  interface Window {
    daum: {
      Postcode: new (options: { oncomplete: (data: any) => void }) => {
        open: () => void;
      };
    };
  }
}

export function loadDaumPostcodeScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.daum && window.daum.Postcode) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('카카오 주소검색 스크립트 로드 실패'));
    document.head.appendChild(script);
  });
}

export async function setupAddressSearch(buttonId: string, addressInputId: string, addressDetailsSelector: string) {
  try {
    await loadDaumPostcodeScript();

    const button = document.getElementById(buttonId);
    if (!button) {
      console.warn(`버튼 ID(${buttonId})를 찾을 수 없습니다.`);
      return;
    }

    button.addEventListener('click', () => {
      new window.daum.Postcode({
        oncomplete: (data) => {
          const addressElem = document.getElementById(addressInputId) as HTMLInputElement | null;
          if (addressElem) addressElem.value = data.address;

          const detailsElem = document.querySelector(`input[name=${addressDetailsSelector}]`) as HTMLElement | null;
          if (detailsElem) detailsElem.focus();
        }
      }).open();
    });

  } catch (error) {
    console.error('주소검색 초기화 실패:', error);
  }
}
