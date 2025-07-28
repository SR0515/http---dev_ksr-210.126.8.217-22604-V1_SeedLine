import { writable } from 'svelte/store';

// 기존 partnerStore.js와 동일한 파트너 데이터 구조
export interface PartnerData {
	id: string;
	partner_name: string;
	rate: string;
	classify: string;
	upper_path?: string;
	level?: number;
}

export const partnerData = writable<PartnerData[]>([]);

// 기존 시스템과 동일한 파트너 데이터 페치 함수
export async function fetchPartners(): Promise<void> {
	if (typeof window === 'undefined') return;

	try {
		const classify = localStorage.getItem('classify');
		const rate = localStorage.getItem('user_rate');
		const userId = localStorage.getItem('user_id');

		if (!classify || !rate || !userId) {
			console.error('인증 정보가 없습니다.');
			return;
		}

		const params = new URLSearchParams({
			classify,
			rate,
			userId
		});

		const response = await fetch(`/api/partner_hierarchy?${params}`);
		const json = await response.json();

		if (json.success) {
			partnerData.set(json.data || []);
		} else {
			console.error('파트너 데이터 로딩 실패:', json.message);
			partnerData.set([]);
		}
	} catch (error) {
		console.error('파트너 데이터 페치 오류:', error);
		partnerData.set([]);
	}
}

// 파트너 등급별 CSS 클래스 반환 (기존 시스템과 동일)
export function getPartnerClass(rate: string): string {
	const rateMap: Record<string, string> = {
		'p1': 'upper_1_point',
		'p2': 'upper_2_point',
		'p3': 'upper_3_point',
		'p4': 'upper_4_point',
		'p5': 'upper_5_point',
		'p6': 'upper_6_point',
		'p7': 'upper_7_point',
		'p8': 'upper_8_point',
		'p9': 'upper_9_point',
		'p10': 'upper_10_point',
		'p11': 'upper_11_point',
		'p12': 'upper_12_point'
	};
	
	return rateMap[rate] || '';
}

// 파트너 등급 레벨 반환 (기존 시스템과 동일)
export function getRateLevel(rate: string): number {
	return parseInt(rate.replace('p', '')) || 0;
}