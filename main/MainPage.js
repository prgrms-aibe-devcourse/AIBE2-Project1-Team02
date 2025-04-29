let globalStartDate = "";
let globalEndDate = "";

let currentPage = 1;
let totalPages = 1; // 전체 페이지 수 초기화
let selectedAreaCode = ""; // 기본값은 빈 문자열 (전체 지역)
let selectedCategory = ""; // 선택된 카테고리
let filteredItems = []; // 필터링된 데이터 저장
const jsonFilePath = "../listEx.json"; // 로컬 파일 경로

// ==================== 캘린더 부분 변수 ====================
const monthNames = [
  "1월",
  "2월",
  "3월",
  "4월",
  "5월",
  "6월",
  "7월",
  "8월",
  "9월",
  "10월",
  "11월",
  "12월",
];

let currentMonth1 = new Date().getMonth(); // 현재 달력1의 월
let currentYear1 = new Date().getFullYear(); // 현재 달력1의 년도

let currentMonth2 = 4; // 달력2는 5월 (0-based index)
let currentYear2 = 2025; // 달력2는 2025년

let selectedDates = [];
let selectedStartDate = null;
let selectedEndDate = null;
let lastStartDate = null;
let lastEndDate = null;

// 달력1, 달력2를 생성
generateCalendar("calendar1", currentMonth1, currentYear1, "calendar1-content");
generateCalendar("calendar2", currentMonth2, currentYear2, "calendar2-content");
// ===========================================================

const AREA_CODE_MAP = {
  서울특별시: "1",
  인천광역시: "2",
  대전광역시: "3",
  대구광역시: "4",
  광주광역시: "5",
  부산광역시: "6",
  울산광역시: "7",
  세종특별자치시: "8",
  경기도: "31",
  강원특별자치도: "32",
  충청북도: "33",
  충청남도: "34",
  경상북도: "35",
  경상남도: "36",
  전북특별자치도: "37",
  전라남도: "38",
  제주도: "39",
  제주특별자치도: "39",
};
document.querySelectorAll(".tab").forEach((btn) => {
  btn.addEventListener("click", () => {
    document
      .querySelectorAll(".tabContent")
      .forEach((c) => (c.style.display = "none"));
    const target = document.getElementById(btn.dataset.tab);
    target.style.display = "block";
  });
});
document.addEventListener("DOMContentLoaded", () => {
  // 페이지 데이터 로딩 및 더보기 버튼 처리
  loadFestivalData(currentPage);

  // 로드되면 바로 날짜 선택부터
  document.getElementById("calendarModalBackground").style.display = "flex";

  // 더보기 버튼 클릭 이벤트
  const moreBtn = document.getElementById("load-more-btn");
  moreBtn.addEventListener("click", () => {
    if (currentPage >= totalPages) {
      moreBtn.style.display = "none"; // 더 이상 페이지가 없으면 버튼 숨기기
      return;
    }
    currentPage += 1;
    loadFestivalData(currentPage);
  });

  // 지역 버튼 클릭 이벤트 등록
  document.querySelectorAll(".area-btn").forEach((button) => {
    button.addEventListener("click", (event) => {
      selectedAreaCode = event.target.dataset.value; // 지역 값 가져오기
      updateCalendarInfo();
      currentPage = 1; // 페이지를 첫 번째 페이지로 초기화
      loadFestivalData(currentPage); // 지역에 맞는 데이터 로드

      // 버튼 스타일 변경 (활성화된 버튼에 스타일 추가)
      document
        .querySelectorAll(".area-btn")
        .forEach((btn) => btn.classList.remove("active"));
      event.target.classList.add("active"); // 클릭한 버튼에 active 클래스 추가
      // 탭3으로 이동
      const tab3Button = document.querySelector('.tab[data-tab="tab3"]');
      if (tab3Button) {
        tab3Button.click();
      }
    });
  });
  // 카테고리 버튼 클릭 이벤트 등록
  document.querySelectorAll(".placeCategory").forEach((button) => {
    button.addEventListener("click", (event) => {
      selectedCategory = event.target.dataset.value; // 선택된 카테고리 값
      currentPage = 1; // 페이지를 첫 번째 페이지로 초기화
      loadFestivalData(currentPage); // 카테고리 기반 데이터 로드

      // 버튼 스타일 변경 (활성화된 버튼에 스타일 추가)
      document
        .querySelectorAll(".placeCategory")
        .forEach((btn) => btn.classList.remove("active"));
      event.target.classList.add("active"); // 클릭한 버튼에 active 클래스 추가
    });
  });

  // 상세정보 모달 처리
  modalHandler();
  // 달력 모달 처리
  calendarModalHandler();
});
// 리스트 정보가져오기 메인
function loadFestivalData(page = 1) {
  fetch(jsonFilePath)
    .then((res) => res.json())
    .then((data) => {
      const items = data.items || [];
      const list = document.getElementById("festival-list");

      // 지역 필터링
      let filteredData = items;
      if (selectedAreaCode && selectedAreaCode !== "all") {
        filteredData = filteredData.filter((item) => {
          const areaCode = getAreaCodeFromAddress(item.address);
          return areaCode === selectedAreaCode;
        });
      }

      // 카테고리 필터링
      if (selectedCategory && selectedCategory !== "all") {
        filteredData = filteredData.filter(
          (item) => item.category == selectedCategory
        );
      }

      // 필터링된 데이터에 대한 페이징 처리
      const itemsPerPage = 10; // 한 페이지에 표시할 항목 수
      const startIndex = (page - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const pagedItems = filteredData.slice(startIndex, endIndex);

      if (page === 1) {
        list.innerHTML = ""; // 첫 페이지일 때 목록 초기화
      }
      if (pagedItems.length === 0 && page === 1) {
        list.innerHTML = "<li>검색된 축제가 없습니다.</li>";
        return;
      }

      pagedItems.forEach((f) => {
        const li = document.createElement("li");
        li.className = "placeItem";

        // 이미지 URL 처리
        const imageUrl = f.images ? f.images[0] : ""; // 첫 번째 이미지를 사용
        const imageHtml = `<img src="${imageUrl}" alt="${f.placeName}" />`;

        // 각 장소의 정보 처리
        const id = f.id || "";
        const image = f.images;
        const placeName = f.placeName || ""; // 장소 이름
        const category = f.category || ""; // 카테고리
        const address = f.address || ""; // 주소
        const operationHours = f.operationHours || "";
        const contact = f.contact || ""; // 연락처
        const description = f.description || "";
        const likes = f.likes || 0;
        let reviews = f.reviews;

        li.dataset.id = id;
        li.dataset.placeName = placeName;
        li.dataset.category = category;
        li.dataset.address = address;
        li.dataset.operationHours = operationHours;
        li.dataset.contact = contact;
        li.dataset.description = description;
        li.dataset.likes = likes;

        // 장바구니 클릭 및 모달 이벤트시
        li.addEventListener("click", (e) => {
          //장바구니 "+" "-" 클릭
          if (e.target.classList.contains("addPlace")) {
            e.stopPropagation();
            const selectedPlaces = document.getElementById("selectedPlaces");

            // 현재 클릭된 버튼이 속한 placeItem
            const placeItem = e.target.closest(".placeItem");

            // 중복 추가 방지
            let isReturn = false;
            filteredItems.forEach(item => {
              if(placeItem.dataset.id == item.id) {
                isReturn = true;
              }
            });
            if(isReturn) {
              return;
            }

            // 이미지 src, title, description 추출
            const imgSrc = placeItem.querySelector("img")?.src || "";
            const placeName = placeItem.querySelectorAll("p")[0].innerHTML;
            const description = placeItem.querySelectorAll("p")[1].textContent;

            // 새로운 li 생성
            const newLi = document.createElement("li");
            newLi.className = "placeItem";

            newLi.dataset.id = placeItem.dataset.id;
            newLi.dataset.category = placeItem.dataset.category; // 카테고리 추가
            newLi.dataset.address = placeItem.dataset.address;
            newLi.dataset.operationHours = placeItem.dataset.operationHours;
            newLi.dataset.contact = placeItem.dataset.contact;
            newLi.dataset.description = placeItem.dataset.description;
            newLi.dataset.likes = placeItem.dataset.likes;

            // HTML 구조 삽입
            newLi.innerHTML = ` <div class="placeCard">
            <div class="placeImg">${imageHtml}</div>
            <div class="placeContent">
              <div class="placeText">
                <p class="plcaeTitle">${placeName}</p>
                <p class="placeAddress">${address}</p>
                <div class="placeBottom"> 
                  <div class="likeInfo">
                    <span>💬 ${reviews.length}</span>
                    <span>🩷 ${likes}</span>
                    <span>⭐ ${reviews[0].rating}</span>
                   </div>
                  <button class="deletePlace">-</button>
                </div>
              </div>
             </div>
          </div>`;

            selectedPlaces.appendChild(newLi);

            // deleteBtn
            const deleteBtn = newLi.querySelector(".deletePlace");
            deleteBtn.addEventListener("click", () => {
              newLi.remove();
              filteredItems = filteredItems.filter(item => {
                return item.id != newLi.dataset.id;
              });
            });

            // item filtering
            let filteredItem = pagedItems.filter(item => { return item.id == placeItem.dataset.id; });
            filteredItems.push(filteredItem[0]);
            return;
          }
          // 모달열기기
          if (e.target.closest("li")) {
            handleLocationDetail({
              id,
              image,
              placeName,
              category,
              address,
              description,
              operationHours,
              contact,
              likes,
              reviews,
            });
          }
        });

        // 리스트에 HTML 삽입
        li.innerHTML = `<div class="placeCard">
            <div class="placeImg">${imageHtml}</div>
            <div class="placeContent">
              <div class="placeText">
                <p class="plcaeTitle">${placeName}</p>
                <p class="placeAddress">${address}</p>
                <div class="placeBottom"> 
                  <div class="likeInfo">
                    <span>💬 ${reviews.length}</span>
                    <span>🩷 ${likes}</span>
                    <span>⭐ ${reviews[0].rating}</span>
                   </div>
                  <button class="addPlace">+</button>
                </div>
              </div>
             </div>
          </div>
        `;
        list.appendChild(li);
      });
      // 전체 페이지 수 계산
      totalPages = Math.ceil(filteredData.length / itemsPerPage);
      console.log("전체 페이지 수:", totalPages);
    })
    .catch((err) => {
      const list = document.getElementById("festival-list");
      list.innerHTML = `<li>데이터 불러오기 실패: ${err.message}</li>`;
      console.error("API 호출 오류:", err);
    });
}
// 추가 상세정보 (모달의 내용)
function handleLocationDetail(data) {
  const modal = document.getElementById("festival-modal");

  const placeNameEl = document.getElementById("modal-placeName");
  const addressEl = document.getElementById("modal-address");
  const slider = document.getElementById("image_slider");
  const contactEl = document.getElementById("modal-contact");
  const operationHoursEl = document.getElementById("modal-operationHours");
  const descriptionEl = document.getElementById("modal-description");
  const reviews = document.getElementById("reviews");

  placeNameEl.textContent = data.placeName || "정보 없음";
  data.image.forEach((image) => {
    let newLi = document.createElement('li');
    newLi.className = 'splide__slide';
    newLi.innerHTML = `<img src = ${image} alt="${data.placeName}"/>`;
    slider.appendChild(newLi);
  });
  addressEl.textContent = data.address || "정보 없음";
  contactEl.textContent = data.contact || "정보 없음";
  operationHoursEl.textContent = data.operationHours || "운영 시간 정보 없음";
  descriptionEl.textContent = data.description || "상세 정보 없음";
  reviews.innerHTML = "";
  data.reviews.forEach(item => {
    let newLi = document.createElement('li');
    newLi.innerHTML = `<div>⭐️${item.rating}</div>
                    <div>${item.comment}</div>
                    <div>${item.author} | ${item.date}</div>`;

    reviews.appendChild(newLi);
  });

  new Splide('#travel-slider', {
    type: 'loop',      // 무한 반복
    perPage: 1,        // 한 번에 1개 보여줌
    autoplay: true,    // 자동 재생
    interval: 3000,    // 3초 간격
    pauseOnHover: true, // 마우스 올리면 멈춤
    arrows: true,      // 좌우 버튼 표시
    pagination: true,  // 하단 점 네비게이션 표시
  }).mount();


  // 모달 열기
  modal.classList.remove("hidden");
}
//모달 처리 함수
function modalHandler(e) {
  const modal = document.getElementById("festival-modal");
  const closeBtn = document.querySelector(".close-button");
  closeBtn.addEventListener("click", () => {
    modal.classList.add("hidden");
  });
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.classList.add("hidden");
    }
  });
}
// 달력 모달 핸들러
function calendarModalHandler() {
  const calendarModalBackground = document.getElementById(
    "calendarModalBackground"
  );
  const confirmBtn = document.querySelector(".confirm-btn");

  // 선택 완료 버튼 클릭 시 모달 닫기
  confirmBtn.addEventListener("click", () => {
    calendarModalBackground.style.display = "none"; // 모달 닫기
    updateCalendarInfo();
    // 탭2 버튼을 찾아서 강제로 클릭해버리기
    // const tab2Button = document.querySelector('.tab[data-tab="tab2"]');
    // if (tab2Button) {
    //   tab2Button.click();
    // }
  });

  // 모달 외부 클릭 시 아무 일도 일어나지 않도록
  calendarModalBackground.addEventListener("click", (e) => {
    if (e.target === calendarModalBackground) {
      // 외부 클릭 시 아무 일도 일어나지 않음
    }
  });

  // 이전 버튼 누른경우
  const prevBtn = document.getElementById("calendarPrevBtn");
  prevBtn.addEventListener("click", () => {
    changeBothMonths(-1);
  });

  // 다음 버튼 누른경우
  const nextBtn = document.getElementById("calendarNextBtn");
  nextBtn.addEventListener("click", () => {
    changeBothMonths(1);
  });

  // 선택 완료 버튼 클릭 시 날짜 로그
  document
    .getElementById("confirmBtn")
    .addEventListener("click", confirmSelection);

  const dateRangeElement = document.getElementById("dateRange");
  //날짜 눌렀을때, 날짜 설정 모달 동작
  dateRangeElement.addEventListener("click", () => {
    calendarModalBackground.style.display = "flex";
  });
  // 달력 아이콘 클릭 시 모달 열기
  const calendarIcon = document.getElementById("calendarIcon");
  calendarIcon.addEventListener("click", () => {
    calendarModalBackground.style.display = "flex";
  });
  if (!dateRangeElement.textContent.trim()) {
    calendarIcon.style.display = "none"; // 값이 없으면 아이콘 숨기기
  } else {
    calendarIcon.style.display = "inline"; // 값이 있으면 아이콘 보이기
  }
}
// 선택 완료 후 calendarInfo를 업데이트하는 함수 + 시간 수정부분
function updateCalendarInfo() {
  const areaNameElement = document.getElementById("areaName");
  const dateRangeElement = document.getElementById("dateRange");
  const calendarIcon = document.getElementById("calendarIcon");
  const selectedDatesList = document.getElementById("selectedDatesList");
  const timeConfirmBtn = document.getElementById("timeConfirmBtn");

  if (selectedAreaCode !== "") {
    const areaName = findAreaNameByCode(selectedAreaCode);
    if (areaName) {
      areaNameElement.textContent = areaName;
    }
  }

  if (selectedStartDate && selectedEndDate) {
    dateRangeElement.textContent = `${formatDateForRange(
      selectedStartDate
    )} ~ ${formatDateForRange(selectedEndDate)}`;
    calendarIcon.style.display = "inline";
  } else {
    dateRangeElement.textContent = `${formatDateForRange(
      today
    )} ~ ${formatDateForRange(today)}`;
    calendarIcon.style.display = "inline";
  }

  // 날짜별 리스트 초기화
  selectedDatesList.innerHTML = "";

  const dates = getDatesInRange(selectedStartDate, selectedEndDate);
  dates.forEach((dateStr) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <div class="schedule-item">
        <div class="schedule-date">
          <div class="schedule-date-label">일자</div>
          <span class="schedule-date-text">${formatDateForTimeAdjustment(
            dateStr
          )}</span>
        </div>
        <div class="schedule-time-inputs">
          <div class="schedule-time-input">
            <div class="schedule-time-label">시작시간</div>
            <input type="time" value="10:00" class="startTime" />
          </div>
          <div class="schedule-time-arrow"><i class="bi bi-arrow-right" id="schedule-arrow"></i></div> <!-- 화살표 추가 -->
          <div class="schedule-time-input">
            <div class="schedule-time-label">종료시간</div>
            <input type="time" value="22:00" class="endTime" />
          </div>
        </div>
      </div>
    `;
    selectedDatesList.appendChild(li);
  });

  if (dates.length > 0) {
    timeConfirmBtn.style.display = "block";
  } else {
    timeConfirmBtn.style.display = "none";
  }

  // (1) 전체 여행기간 출력용
  function formatDateForRange(dateStr) {
    const days = ["일", "월", "화", "수", "목", "금", "토"];
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const dayOfWeek = days[date.getDay()];
    return `${year}.${month}.${day}(${dayOfWeek})`; // 예: 2025.05.16(금)
  }

  // (2) 개별 시간 설정용
  function formatDateForTimeAdjustment(dateStr) {
    const days = ["일", "월", "화", "수", "목", "금", "토"];
    const date = new Date(dateStr);
    const month = date.getMonth() + 1; // pad 없이
    const day = date.getDate();
    const dayOfWeek = days[date.getDay()];
    return `${month}/${day} ${dayOfWeek}`; // 예: 5/16 금
  }

  selectedDatesList.querySelectorAll(".schedule-item").forEach((item) => {
    const startTimeInput = item.querySelector(".startTime");
    const endTimeInput = item.querySelector(".endTime");

    // 시작 시간 변경 시
    startTimeInput.addEventListener("change", () => {
      if (startTimeInput.value >= endTimeInput.value) {
        alert("시작시간은 종료시간보다 빠르거나 같을 수 없습니다.");
        startTimeInput.value = "10:00"; // 잘못 입력하면 초기값 10:00으로 복구
      }
    });

    // 종료 시간 변경 시
    endTimeInput.addEventListener("change", () => {
      if (startTimeInput.value >= endTimeInput.value) {
        alert("종료시간은 시작시간보다 늦어야 합니다.");
        endTimeInput.value = "22:00"; // 잘못 입력하면 초기값 22:00으로 복구
      }
    });
  });

  //시간 설정완료 버튼 클릭시,
  document.getElementById("timeConfirmBtn").addEventListener("click", () => {
    const dateItems = document.querySelectorAll(".schedule-item");

    // 각 날짜 항목에 대해 startTime, endTime을 가져와서 selectedDates 배열에 추가
    dateItems.forEach((item) => {
      const date = item.querySelector(".schedule-date-text").textContent;
      const startTime = item.querySelector(".startTime").value;
      const endTime = item.querySelector(".endTime").value;

      selectedDates.push({
        date,
        startTime,
        endTime,
      });
    });
    console.log("전역 변수에 저장된 값:", selectedDates);
    // 탭3으로 이동
    const tab2Button = document.querySelector('.tab[data-tab="tab2"]');
    if (tab2Button) {
      tab2Button.click();
    }
  });

  // 날짜 범위 배열 생성
  function getDatesInRange(startStr, endStr) {
    const dateArray = [];
    if (!startStr || !endStr) return dateArray;
    let currentDate = new Date(startStr);
    const endDate = new Date(endStr);

    while (currentDate <= endDate) {
      dateArray.push(currentDate.toISOString().split("T")[0]); // yyyy-mm-dd
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return dateArray;
  }
}
// 주소에서 지역 코드를 추출하는 함수
function getAreaCodeFromAddress(address) {
  if (!address) return null;
  // 주소 앞부분 (공백으로 구분된 첫 단어)을 가져온다
  const firstWord = address.split(" ")[0];
  return AREA_CODE_MAP[firstWord] || null;
}
// 검색 이전 상태로 되돌리는 함수
function resetToInitialState() {
  const list = document.getElementById("festival-list");
  const moreBtn = document.getElementById("load-more-btn");

  currentPage = 1;
  totalPages = 1;
  isSearchMode = false;
  searchQuery = "";

  document.getElementById("search-input").value = "";
  list.innerHTML = "";
  moreBtn.style.display = "block";

  loadFestivalData(currentPage);
}
// 두 달력을 생성하는 함수
function generateCalendar(id, month, year, contentId) {
  const container = document.getElementById(contentId);
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const totalDays = lastDay.getDate();
  const firstDayOfWeek = firstDay.getDay();

  // 월 이름 표시
  const monthName = document.createElement("div");
  monthName.classList.add("month-name");
  monthName.textContent = `${year} ${monthNames[month]}`;
  container.innerHTML = ""; // 기존 내용 삭제 후 새로 생성
  container.appendChild(monthName);

  // 요일 표시
  const weekdays = document.createElement("div");
  weekdays.classList.add("weekdays");
  const weekdaysNames = ["일", "월", "화", "수", "목", "금", "토"];
  weekdaysNames.forEach((day, index) => {
    const weekday = document.createElement("div");
    weekday.textContent = day;
    if (index === 0) {
      weekday.classList.add("sunday");
    } else if (index === 6) {
      weekday.classList.add("saturday");
    }
    weekdays.appendChild(weekday);
  });
  container.appendChild(weekdays);

  // 날짜 표시
  const days = document.createElement("div");
  days.classList.add("days");

  // 빈 날짜 채우기
  for (let i = 0; i < firstDayOfWeek; i++) {
    const emptyDay = document.createElement("div");
    days.appendChild(emptyDay);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0); // 시간을 00:00:00으로 맞춰 정확하게 비교

  for (let i = 1; i <= totalDays; i++) {
    const day = document.createElement("div");
    day.classList.add("day");
    day.textContent = i;
    day.dataset.date = `${year}-${month + 1}-${i}`;

    const thisDate = new Date(year, month, i);
    if (thisDate < today) {
      day.classList.add("past");
    }

    // 시작일, 종료일 하이라이트
    if (selectedStartDate && selectedEndDate) {
      const startDate = new Date(selectedStartDate);
      const endDate = new Date(selectedEndDate);

      // 시작일과 종료일 범위 내 날짜 하이라이팅
      if (thisDate >= startDate && thisDate <= endDate) {
        day.classList.add("selected-range");
      }
      if (
        thisDate.getTime() == startDate.getTime() ||
        thisDate.getTime() == endDate.getTime()
      ) {
        day.classList.add("selected", "selected-end");
      }
    }

    days.appendChild(day);
  }

  container.appendChild(days);

  // 클릭 이벤트 추가
  const dayElements = container.querySelectorAll(".day");
  dayElements.forEach((day) => {
    day.addEventListener("click", () => handleDayClick(day));
  });
}
// 날짜 범위 하이라이팅
function highlightRange(startDate, endDate) {
  if (startDate === lastStartDate && endDate === lastEndDate) {
    return; // 이전 상태와 동일하면 하이라이팅을 하지 않음
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  const dayElements = document.querySelectorAll(".day");

  const startTime = start.getTime();
  const endTime = end.getTime();

  dayElements.forEach((day) => {
    const dayDate = new Date(day.dataset.date);
    const dayTime = dayDate.getTime();

    if (dayTime >= startTime && dayTime <= endTime) {
      if (dayTime === startTime) {
        day.classList.add("selected", "selected-start");
      } else if (dayTime === endTime) {
        day.classList.add("selected", "selected-end");
      } else {
        day.classList.add("selected-range");
      }
    } else {
      day.classList.remove("selected-range", "selected-start", "selected-end");
    }
  });

  lastStartDate = startDate;
  lastEndDate = endDate;
  // 선택된 날짜가 있을 경우 버튼 활성화
  toggleConfirmButton();
}
// 날짜 클릭 시 처리
function handleDayClick(dayElement) {
  const clickedDate = dayElement.dataset.date;
  console.log("클릭한 날짜:", clickedDate);

  if (!selectedStartDate) {
    selectedStartDate = clickedDate;
    dayElement.classList.add("selected", "selected-start");
  } else if (!selectedEndDate) {
    selectedEndDate = clickedDate;

    if (
      new Date(selectedEndDate).getTime() <
      new Date(selectedStartDate).getTime()
    ) {
      [selectedStartDate, selectedEndDate] = [
        selectedEndDate,
        selectedStartDate,
      ];
    }

    highlightRange(selectedStartDate, selectedEndDate);
  } else {
    selectedStartDate = clickedDate;
    selectedEndDate = null;
    resetSelection();
    dayElement.classList.add("selected", "selected-start");
  }
  // 선택된 날짜가 있을 경우 버튼 활성화
  toggleConfirmButton();
}
// 날짜 초기화
function resetSelection() {
  const dayElements = document.querySelectorAll(".day");
  dayElements.forEach((day) => {
    day.classList.remove(
      "selected",
      "selected-range",
      "selected-start",
      "selected-end"
    );
  });
}
// 월 변경 시 선택된 날짜 유지
function changeBothMonths(direction) {
  currentMonth1 += direction;
  currentMonth2 += direction;

  if (currentMonth1 < 0) {
    currentMonth1 = 11;
    currentYear1--;
  } else if (currentMonth1 > 11) {
    currentMonth1 = 0;
    currentYear1++;
  }

  if (currentMonth2 < 0) {
    currentMonth2 = 11;
    currentYear2--;
  } else if (currentMonth2 > 11) {
    currentMonth2 = 0;
    currentYear2++;
  }

  generateCalendar(
    "calendar1",
    currentMonth1,
    currentYear1,
    "calendar1-content"
  );
  generateCalendar(
    "calendar2",
    currentMonth2,
    currentYear2,
    "calendar2-content"
  );
}
// 날짜 로그
function confirmSelection() {
  if (!selectedStartDate) {
    console.log("시작일을 선택하세요.");
    return;
  }

  if (!selectedEndDate) {
    console.log("종료일을 선택하세요.");
    return;
  }

  function formatDate(dateStr) {
    const [year, month, day] = dateStr.split("-");
    return `${year}${month.padStart(2, "0")}${day.padStart(2, "0")}`;
  }

  function calculateDuration(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end - start;
    const diffDays = diffTime / (1000 * 3600 * 24); // 밀리초를 일로 변환
    return diffDays;
  }

  const duration = calculateDuration(selectedStartDate, selectedEndDate) + 1;

  console.log("선택된 기간:");
  console.log("시작일:", formatDate(selectedStartDate));
  console.log("종료일:", formatDate(selectedEndDate));
  console.log("기간:", duration, "일");
}
// 선택 완료 버튼의 활성화 여부를 설정하는 함수
function toggleConfirmButton() {
  const confirmBtn = document.getElementById("confirmBtn");

  // 시작일과 종료일이 모두 선택되었을 때 버튼을 활성화
  if (selectedStartDate && selectedEndDate) {
    confirmBtn.removeAttribute("disabled");
    // 활성화 상태 스타일 변경 (검은색 배경에 흰색 글씨)
    confirmBtn.style.backgroundColor = "#282828";
    confirmBtn.style.color = "white";
  } else {
    confirmBtn.setAttribute("disabled", "true");
    // 비활성화 상태 스타일 변경 (회색 배경에 흰색 글씨)
    confirmBtn.style.backgroundColor = "#b0b0b0";
    confirmBtn.style.color = "white";
  }
}
// 지역코드로 지역명을 가져오는 함수
function findAreaNameByCode(code) {
  for (const [areaName, areaCode] of Object.entries(AREA_CODE_MAP)) {
    if (areaCode === code) {
      return areaName;
    }
  }
  return null;
}

let makeScheduleButton = document.getElementById("makeSchedule");
makeScheduleButton.addEventListener('click', function(e) {
  document
      .querySelectorAll(".tabContent")
      .forEach((c) => (c.style.display = "none"));
  const target = document.getElementById("tab4");
  target.style.display = "block";
});

// 오늘 날짜를 YYYYMMDD 형식으로 반환하는 함수
function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}${month}${day}`;
}
// 로드시, 날짜를 오늘 날짜로 초기화하는 함수
function initializeDates() {
  const dateInput = document.getElementById("daterange");

  // 오늘 날짜를 YYYYMMDD 형식으로 설정
  const todayDate = getTodayDate();

  if (!dateInput.value) {
    dateInput.value = todayDate;
  }

  globalStartDate = todayDate;
  globalEndDate = todayDate;
}

// const searchInput = document.getElementById('search-input');
// const placeSearchBox = document.getElementById('placeSearchBox');
// const placeSelectBox = document.getElementById('placeSelectBox');
// const tagSearchBox = document.getElementById('tagSearchBox');
//
// // 초기 상태: placeSearchBox, placeSelectBox는 visible, tagSearchBox는 hidden
// placeSearchBox.classList.add('visible');
// placeSelectBox.classList.add('visible');
// tagSearchBox.classList.add('hidden');
//
// searchInput.addEventListener('focus', () => {
//   placeSearchBox.classList.remove('visible');
//   placeSearchBox.classList.add('hidden');
//
//   placeSelectBox.classList.remove('visible');
//   placeSelectBox.classList.add('hidden');
//
//   tagSearchBox.classList.remove('hidden');
//   tagSearchBox.classList.add('visible');
// });


const searchInput = document.getElementById("search-input");
const tagSearchBtn = document.getElementById("tag-search-btn");
const tagBox = document.getElementById("tagSearchBox");
const placeBox = document.getElementById("placeSearchBox");
const selectBox = document.getElementById("placeSelectBox");

function showTagBox() {
  tagBox.classList.add("show");
  tagBox.classList.remove("hidden");

  placeBox.style.display = "none";
  selectBox.style.display = "none";
}

function hideTagBox() {
  tagBox.classList.remove("show");
  tagBox.classList.add("hidden");

  placeBox.style.display = "block";
  selectBox.style.display = "block";
}

searchInput.addEventListener("focus", showTagBox);

// 문서 클릭 시 input, tagBox 이외는 숨기기
document.addEventListener("mousedown", (e) => {
  if (
      !searchInput.contains(e.target) &&
      !tagBox.contains(e.target)
  ) {
    hideTagBox();
  }
});

tagSearchBtn.addEventListener('click', (e) => {
  hideTagBox();
})
