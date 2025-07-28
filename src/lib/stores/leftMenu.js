import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export const leftMenuData = writable({
  C_dupli: 0,
  terminalCount: 0,
  inactiveCount: 0,
  realtimeState: 0,
  t_realtimeState: 0,
  commissionBalance: 0,
  notifyRateMap: {},
  pathNotifyCount: 0,
});

export async function fetchLeftMenuData() {
    if (!browser) return;
    
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