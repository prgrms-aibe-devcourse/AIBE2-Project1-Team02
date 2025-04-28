let selectedStartDate = null;
let selectedEndDate = null;

function generateCalendar(id, month, year) {
  const container = document.getElementById(id);
  const monthNames = [
    '1월', '2월', '3월', '4월', '5월', '6월',
    '7월', '8월', '9월', '10월', '11월', '12월'
  ];
  
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const totalDays = lastDay.getDate();
  const firstDayOfWeek = firstDay.getDay();

  // 월 이름 표시
  const monthName = document.createElement('div');
  monthName.classList.add('month-name');
  monthName.textContent = `${monthNames[month]} ${year}`;
  container.innerHTML = ''; // 기존 내용 초기화
  container.appendChild(monthName);

  // 요일 표시
  const weekdays = document.createElement('div');
  weekdays.classList.add('weekdays');
  const weekdaysNames = ['일', '월', '화', '수', '목', '금', '토'];
  weekdaysNames.forEach(day => {
    const weekday = document.createElement('div');
    weekday.textContent = day;
    weekdays.appendChild(weekday);
  });
  container.appendChild(weekdays);

  // 날짜 표시
  const days = document.createElement('div');
  days.classList.add('days');

  // 빈 날짜 채우기
  for (let i = 0; i < firstDayOfWeek; i++) {
    const emptyDay = document.createElement('div');
    days.appendChild(emptyDay);
  }

  // 실제 날짜 채우기
  for (let i = 1; i <= totalDays; i++) {
    const day = document.createElement('div');
    day.classList.add('day');
    day.textContent = i;
    day.dataset.date = `${year}-${month + 1}-${i}`;
    days.appendChild(day);
  }

  container.appendChild(days);

  // 클릭 이벤트 추가
  const dayElements = container.querySelectorAll('.day');
  dayElements.forEach(day => {
    day.addEventListener('click', () => handleDayClick(day));
  });
}

function changeMonth(calendarId, direction) {
  const calendarContainer = document.getElementById(calendarId);
  const monthYearText = calendarContainer.querySelector('.month-name').textContent;
  const [currentMonthName, currentYear] = monthYearText.split(' ');

  let currentMonth = parseInt(currentMonthName.replace('월', '')) - 1; // 0-based index
  let currentYearNumber = parseInt(currentYear);

  currentMonth += direction;
  
  // 월을 넘길 때, 년도 변경
  if (currentMonth < 0) {
    currentMonth = 11; // 12월
    currentYearNumber--;
  } else if (currentMonth > 11) {
    currentMonth = 0; // 1월
    currentYearNumber++;
  }

  generateCalendar(calendarId, currentMonth, currentYearNumber); // 월 변경된 캘린더 생성
}



// 두 개의 달력 생성 (왼쪽은 현재, 오른쪽은 5월)
generateCalendar('calendar1', new Date().getMonth(), new Date().getFullYear());
generateCalendar('calendar2', 4, 2025); // 5월 (0-based index)
