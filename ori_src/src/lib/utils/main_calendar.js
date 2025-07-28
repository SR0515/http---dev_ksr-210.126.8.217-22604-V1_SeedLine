export function Calendar() {
  console.log("📅 캘린더 초기화 실행됨!");
  
  // dateBoard 요소 확인
  const dateBoardElement = document.querySelector('.dateBoard');
  if (!dateBoardElement) {
    console.error("⛔ .dateBoard 요소가 존재하지 않습니다!");
    return;
  }
  
  // calendarData가 정의되지 않은 경우를 위한 예외 처리
  let calendarData = window.calendarData || [];
  if (!calendarData || !Array.isArray(calendarData)) {
    console.warn("⚠️ calendarData가 정의되지 않았거나 배열이 아닙니다. 빈 배열로 초기화합니다.");
    calendarData = [];
  }
  
  // 데이터 가공
  const calendarList = calendarData.reduce(
    (acc, v) => 
      ({ ...acc, [v.date]: [...(acc[v.date] || []), v.content] })
    , {}
  );
  
  // pad method
  Number.prototype.pad = function() {
    return this > 9 ? this : '0' + this;
  }
  
  // 달력 생성
  const makeCalendar = (date) => {
    // 현재의 년도와 월 받아오기
    const currentYear = new Date(date).getFullYear();
    const currentMonth = new Date(date).getMonth() + 1;
  
    // 한달전의 마지막 요일
    const firstDay = new Date(date.setDate(1)).getDay();
    // 현재 월의 마지막 날 구하기
    const lastDay = new Date(currentYear, currentMonth, 0).getDate();
  
    // 남은 박스만큼 다음달 날짜 표시
    const limitDay = firstDay + lastDay;
    const nextDay = Math.ceil(limitDay / 7) * 7;
  
    let htmlDummy = '';
  
    // 한달전 날짜 표시하기
    for (let i = 0; i < firstDay; i++) {
      htmlDummy += `<div class="noColor"></div>`;
    }
  
    // 이번달 날짜 표시하기
    for (let i = 1; i <= lastDay; i++) {
      const date = `${currentYear}-${currentMonth.pad()}-${i.pad()}`
      
      htmlDummy += `
        <div>
          ${i}
          <p>
            ${calendarList[date]?.join('</p><p>') || ''}
          </p>
        </div>
      `;
    }
  
    // 다음달 날짜 표시하기
    for (let i = limitDay; i < nextDay; i++) {
      htmlDummy += `<div class="noColor"></div>`;
    }
    
    const dateBoardEl = document.querySelector('.dateBoard');
    if (dateBoardEl) {
      dateBoardEl.innerHTML = htmlDummy;
    } else {
      console.error("⛔ .dateBoard 요소를 찾을 수 없습니다.");
    }
    
    const dateTitleEl = document.querySelector('.dateTitle');
    if (dateTitleEl) {
      dateTitleEl.innerText = `${currentYear}년 ${currentMonth}월`;
    } else {
      console.error("⛔ .dateTitle 요소를 찾을 수 없습니다.");
    }
  }
  
  const date = new Date();
  
  makeCalendar(date);
  
  // 이전달 이동
  const prevDayEl = document.querySelector('.prevDay');
  if (prevDayEl) {
    prevDayEl.onclick = () => {
      makeCalendar(new Date(date.setMonth(date.getMonth() - 1)));
    }
  } else {
    console.error("⛔ .prevDay 요소를 찾을 수 없습니다.");
  }
  
  // 다음달 이동
  const nextDayEl = document.querySelector('.nextDay');
  if (nextDayEl) {
    nextDayEl.onclick = () => {
      makeCalendar(new Date(date.setMonth(date.getMonth() + 1)));
    }
  } else {
    console.error("⛔ .nextDay 요소를 찾을 수 없습니다.");
  }
}