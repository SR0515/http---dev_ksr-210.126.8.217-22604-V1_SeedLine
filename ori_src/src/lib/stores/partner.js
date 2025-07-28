import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export const partnerData = writable([]); // 전역에서 쓰일 파트너 목록

// SSR 안전한 localStorage 접근
const saved = browser ? localStorage.getItem('affectedChildren') : null;
export const affectedChildren = writable(saved ? JSON.parse(saved) : []);

affectedChildren.subscribe(value => {
  if (browser) {
    localStorage.setItem('affectedChildren', JSON.stringify(value));
  }
});


//rate값 보내서 하위 파트너만 보이도록
export async function fetchPartners() {
  if (!browser) return;
  
  try {
    let rate = localStorage.getItem("user_rate")  
    let user_code = localStorage.getItem("user_code")
    let classify = localStorage.getItem("classify")

      const params = new URLSearchParams({
        rate : rate,
        user_code : user_code,
        classify : classify
      });
    const response = await fetch('/api/partner/PartnerSetting?' + params.toString());
    const json = await response.json();

    if (json.success) {
        partnerData.set(
            json.data.map(item => ({
            id: item.idx,
            rate: item.rate,
            partner_name: item.partner_name,
            route: `Partner_${item.idx}`,
            }))
        );
        console.log("partnerStoreJson", json)
    } else {
      console.error('서버 오류:', json.message);
    }
  } catch (err) {
    console.error('파트너 목록 갱신 실패:', err);
  }
}