//  관리자만 접근가능
export function adminAccess() {
  let classify = localStorage.getItem('classify');
  let rate = localStorage.getItem('user_rate') || '';
    const savedPage = sessionStorage.getItem('currentPage');
    if (classify != '0'){
        window.dispatchEvent(new CustomEvent('pageChange', { 
      detail: { savedPage } 
    }));
    }
}

//  관리자/대행사만 접근 가능
export function adminDistributorAcess() {
  let classify = localStorage.getItem('classify');
  let rate = localStorage.getItem('user_rate') || '';
    const savedPage = sessionStorage.getItem('currentPage');
    if (!(classify == "0" || (classify == "1" && rate == "p1"))){
        window.dispatchEvent(new CustomEvent('pageChange', { 
      detail: { savedPage } 
    }));
    }
}

//  관리자/대행사/에이전시까지 접근 가능
export function adminPartnerAccess() {
  let classify = localStorage.getItem('classify');
  let rate = localStorage.getItem('user_rate') || '';
    const savedPage = sessionStorage.getItem('currentPage');
    if (!(classify == "0" || classify == "1")){
        window.dispatchEvent(new CustomEvent('pageChange', { 
      detail: { savedPage } 
    }));
    }
}