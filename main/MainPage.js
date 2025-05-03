let globalStartDate = "";
let globalEndDate = "";

let currentPage = 1;
let totalPages = 1; // 전체 페이지 수 초기화
let selectedAreaCode = ""; // 기본값은 빈 문자열 (전체 지역)
let selectedCategory = ""; // 선택된 카테고리
let filteredItems = []; // 필터링된 데이터 저장
const jsonFilePath = "../listEx.json"; // 로컬 파일 경로

// ==================== 지도 부분 변수 ====================
let testSelectedDate = "2025-05-25";
let placeDataItems = [];

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

let currentMonth2 = currentMonth1 + 1;
let currentYear2 = currentYear1;

if (currentMonth2 > 11) {
  currentMonth2 = 0;
  currentYear2++;
}

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
// beforeunload 이벤트 핸들러 함수 정의
function beforeUnloadHandler(e) {
  // 사용자에게 경고 메시지 표시
  const message =
    "페이지를 떠나시겠습니까? 변경 사항이 저장되지 않을 수 있습니다.";
  e.returnValue = message;
  return message;
}

// 새로고침 경고 알트메세지
window.addEventListener("beforeunload", beforeUnloadHandler);
// 탭버튼 로직
document.querySelectorAll(".tab").forEach((btn) => {
  btn.addEventListener("click", () => {
    // 모든 탭 콘텐츠 숨기기
    document
      .querySelectorAll(".tabContent")
      .forEach((c) => (c.style.display = "none"));

    activateTab(btn.dataset.tab);
  });
});
// 탭을 활성화하고 관련된 레이아웃을 적용하는 함수
function activateTab(tabId) {
  const tabButton = document.querySelector(`.tab[data-tab="${tabId}"]`);
  if (!tabButton || tabButton.style.display === "none") return; // 숨겨진 탭이면 중단

  // 모든 탭 콘텐츠 숨기기
  document
    .querySelectorAll(".tabContent")
    .forEach((c) => (c.style.display = "none"));

  // 모든 탭 버튼에서 active 클래스 제거
  document
    .querySelectorAll(".tab")
    .forEach((b) => b.classList.remove("active"));

  // 클릭한 탭 버튼에 active 클래스 추가
  tabButton.classList.add("active");

  const target = document.getElementById(tabId);
  const tabContainer = document.getElementById("tab-container");
  const mapContainer = document.getElementById("map-container");

  // 저장 및 편집 버튼 컨테이너
  const tab4Buttons = document.getElementById("tab4-buttons");

  // 편집 모드에서  취소/적용 버튼 컨테이너
  const editButtons = document.getElementById("editButtons");

  // 탭3의 일정 생성 버튼
  const makeScheduleButton = document.getElementById("tab3-buttons");

  // 탭 버튼
  const tab1Button = document.getElementById("tab1Btn");
  const tab2Button = document.getElementById("tab2Btn");
  const tab3Button = document.getElementById("tab3Btn");
  const tab4Button = document.getElementById("tab4Btn");
  const tab5Button = document.getElementById("tab5Btn");

  // 탭 별로 다른 레이아웃 적용 (사용자가 드래그 중이 아닐 때만)
  if (!isResizing) {
    switch (tabId) {
      case "tab1":
        // 날짜 선택 탭 - 왼쪽 영역을 좁게
        tabContainer.style.width = "25%";
        target.style.display = "block";
        editButtons.style.display = "none";
        makeScheduleButton.style.display = "none";
        tab1Button.style.display = "block";
        tab2Button.style.display = "block";
        tab3Button.style.display = "block";
        tab4Buttons.style.display = "none";
        tab5Button.style.display = "none";
        break;

      case "tab2":
        // 지역 선택 탭 - 왼쪽 영역을 중간 크기로
        tabContainer.style.width = "20%";
        target.style.display = "block";
        editButtons.style.display = "none";
        makeScheduleButton.style.display = "none";
        tab1Button.style.display = "block";
        tab2Button.style.display = "block";
        tab3Button.style.display = "block";
        tab4Buttons.style.display = "none";
        tab5Button.style.display = "none";
        break;

      case "tab3":
        // 장소 선택 탭 - 왼쪽 영역을 넓게
        tabContainer.style.width = "40%";
        target.style.display = "block";
        editButtons.style.display = "none";
        makeScheduleButton.style.display = "flex";
        tab1Button.style.display = "block";
        tab2Button.style.display = "block";
        tab3Button.style.display = "block";
        tab4Buttons.style.display = "none";
        tab5Button.style.display = "none";
        break;

      case "tab4":
        // 일정 확인 탭 - 세부 레이아웃이 플렉스이므로
        tabContainer.style.width = "40%";
        target.style.display = "flex";
        editButtons.style.display = "none";
        makeScheduleButton.style.display = "none";
        tab1Button.style.display = "block";
        tab2Button.style.display = "block";
        tab3Button.style.display = "block";
        tab4Buttons.style.display = "flex";
        tab5Button.style.display = "none";
        tab4Handler();
        break;

      case "tab5":
        tabContainer.style.width = "38%";
        target.style.display = "flex";
        tab4Buttons.style.display = "none";
        editButtons.style.display = "flex";
        makeScheduleButton.style.display = "none";
        tab1Button.style.display = "none";
        tab2Button.style.display = "none";
        tab3Button.style.display = "none";
        tab4Button.style.display = "none";

        initializeEditMode();
        break;
    }
  } else {
    // 드래그 중일 때는 표시 상태만 변경하고 너비는 유지
    target.style.display =
      tabId === "tab4" || tabId === "tab5" ? "flex" : "block";

    // 버튼 상태는 동일하게 관리
    if (tabId === "tab5") {
      tab4Buttons.style.display = "none";
      editButtons.style.display = "flex";
      makeScheduleButton.style.display = "none";
      tab1Button.style.display = "none";
      tab2Button.style.display = "none";
      tab3Button.style.display = "none";
      tab4Button.style.display = "none";
      initializeEditMode();
    } else {
      editButtons.style.display = "none";
      makeScheduleButton.style.display = "none";
      tab1Button.style.display = "block";
      tab2Button.style.display = "block";
      tab3Button.style.display = "block";
      tab4Buttons.style.display = tabId === "tab4" ? "flex" : "none";
      tab5Button.style.display = "none";

      if (tabId === "tab4") {
        tab4Handler();
      }
    }
  }

  // 지도 크기 변경 후 relayout 실행
  if (typeof map !== "undefined") {
    setTimeout(() => map.relayout(), 100);
  }
}
//화면 로드시에 실행되는 부분
document.addEventListener("DOMContentLoaded", () => {
  // 새로고침 시 localStorage 값 모두 삭제
  localStorage.removeItem("travelSchedule");
  localStorage.removeItem("filteredItems");
  localStorage.removeItem("startDate");
  localStorage.removeItem("endDate");

  // 최초 진입 여부를 체크하는 플래그
  if (!localStorage.getItem("isInitialized")) {
    // 최초 진입이므로 localStorage 초기화
    localStorage.setItem("isInitialized", "true");
    // 지도 중심 홍대입구, 마커 지우기
    if (window.kakaoMarkers)
      window.kakaoMarkers.forEach((marker) => marker.setMap(null));
    window.kakaoMarkers = [];
    if (typeof map !== "undefined") {
      map.setCenter(new kakao.maps.LatLng(37.557192, 126.924863));
    }
  }

  // 1. travelSchedule이 없을 때만 달력 모달 자동 표시
  if (!localStorage.getItem("travelSchedule")) {
    document.getElementById("calendarModalBackground").style.display = "flex";
  } else {
    // travelSchedule이 있으면 달력 모달을 숨김
    document.getElementById("calendarModalBackground").style.display = "none";
  }

  // 페이지 데이터 로딩 및 더보기 버튼 처리
  loadFestivalData(currentPage);

  activateTab("tab1");

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

  // 항상 최신 travelSchedule을 읽음
  const savedSchedule = localStorage.getItem("travelSchedule");
  if (savedSchedule) {
    // 코드블록 제거 및 파싱
    let cleanText = savedSchedule
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    let scheduleArr;
    try {
      scheduleArr = JSON.parse(cleanText);
    } catch (e) {
      console.error("travelSchedule 파싱 오류:", e);
      return;
    }
    // 날짜 포맷 통일
    function normalizeDate(dateStr) {
      return dateStr.replace(/^0+/, "").replace(/-0+/g, "-");
    }
    // testSelectedDate는 상단에서 선언한 값을 사용
    const dayPlan = scheduleArr.find(
      (item) => normalizeDate(item.Date) === normalizeDate(testSelectedDate)
    );
    const places = dayPlan
      ? dayPlan.Places.map((p) => p.replace(/\(.*\)/, "").trim())
      : [];
    setMarkersByPlaceNames(places);
  } else {
    // travelSchedule이 없으면 지도 중심을 홍대입구역으로 이동하고 마커 모두 지우기
    if (window.kakaoMarkers)
      window.kakaoMarkers.forEach((marker) => marker.setMap(null));
    window.kakaoMarkers = [];
    if (typeof map !== "undefined") {
      map.setCenter(new kakao.maps.LatLng(37.557192, 126.924863)); // 홍대입구역
    }
  }
});
// 리스트 정보가져오기 메인
function loadFestivalData(page = 1) {
  fetch(jsonFilePath)
    .then((res) => res.json())
    .then((data) => {
      const items = data.items || [];
      placeDataItems = items; // 전역에 저장
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
            filteredItems.forEach((item) => {
              if (placeItem.dataset.id == item.id) {
                isReturn = true;
              }
            });
            if (isReturn) {
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
              filteredItems = filteredItems.filter((item) => {
                return item.id != newLi.dataset.id;
              });
            });

            // item filtering
            let filteredItem = pagedItems.filter((item) => {
              return item.id == placeItem.dataset.id;
            });
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
    })
    .catch((err) => {
      const list = document.getElementById("festival-list");
      list.innerHTML = `<li>데이터 불러오기 실패: ${err.message}</li>`;
      console.error("API 호출 오류:", err);
    });
  localStorage.setItem("filteredItems", JSON.stringify(filteredItems));

  //일정만들기 버튼 클릭 후 프롬프트넘기기
  let makeScheduleButton = document.getElementById("makeSchedule");
  makeScheduleButton.addEventListener("click", async function (e) {
    // 선택된 항목이 없는 경우 알림 표시
    if (filteredItems.length === 0) {
      alert("일정을 만들기 위해 선택된 장소가 없습니다.");
      return;
    }

    // 날짜 정보와 filteredItems를 localStorage에 저장
    localStorage.setItem("filteredItems", JSON.stringify(filteredItems));
    localStorage.setItem("startDate", selectedStartDate);
    localStorage.setItem("endDate", selectedEndDate);

    // 여행 일정 자동 생성기 실행
    const module = await import("../scripts.js");
    const filtered = JSON.parse(localStorage.getItem("filteredItems") || "[]");
    const startDate = localStorage.getItem("startDate") || "";
    const endDate = localStorage.getItem("endDate") || "";
    const placesPrompt = filtered
      .map((item) => `${item.placeName}(${item.category})`)
      .join(", ");
    const customPrompt = `날짜: ${startDate} ~ ${endDate}
장소: ${placesPrompt}
아래 장소만 사용해서 여행 일정을 작성해 주세요. 절대로 다른 장소를 추가하지 마세요.
조건:
- 하루에 같은 카테고리(예: 식당, 카페, 관광지 등)만 몰리지 않게 골고루 섞어서 배치해줘.
- 운영시간과 위치를 반드시 고려해서, 하루에 이동 동선이 최소가 되도록 가까운 장소끼리 **우선순위 10KM 이내** 묶어서 배치해줘.
- 절대 동선 낭비가 생기지 않게, 하루에 먼 곳을 여러 번 왕복하지 않도록 해줘.
- 하루에 최소 1개, 최대 4개 장소만 포함해줘.
- 장소는 딱 한 번만 이용할 수 있어.
- 만약 카테고리가와 위치 조건 이 두개의 조건이 충돌한다면, 위치조건이 우선이야.
- 결과는 아래와 같은 json 포맷으로만 반환해줘. 부연설명은 필요없어.
[
  {
    Date: ${startDate},
    Places: [장소1, 장소2, ...]
  },
  ...
]`;
    await module.generatePlanFromOpenAI(
      filtered,
      startDate,
      endDate,
      customPrompt
    );

    // 새로고침 대신 travelSchedule에서 마커만 불러오기
    const savedSchedule = localStorage.getItem("travelSchedule");
    if (savedSchedule) {
      let cleanText = savedSchedule
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
      let scheduleArr;
      try {
        scheduleArr = JSON.parse(cleanText);
      } catch (e) {
        console.error("travelSchedule 파싱 오류:", e);
        return;
      }
      // 원하는 날짜(예: testSelectedDate)의 장소만 추출
      function normalizeDate(dateStr) {
        return dateStr.replace(/^0+/, "").replace(/-0+/g, "-");
      }
      const dayPlan = scheduleArr.find(
        (item) => normalizeDate(item.Date) === normalizeDate(testSelectedDate)
      );
      const places = dayPlan
        ? dayPlan.Places.map((p) => p.replace(/\(.*\)/, "").trim())
        : [];
      setMarkersByPlaceNames(places); // 마커 표시 및 지도 bounds 이동
    }

    // 탭4 버튼을 강제로 표시하고 클릭
    const tab4Btn = document.getElementById("tab4Btn");
    if (tab4Btn) {
      tab4Btn.style.display = "block"; // 버튼을 표시
      tab4Btn.click(); // 클릭 이벤트 트리거
    }
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
    let newLi = document.createElement("li");
    newLi.className = "splide__slide";
    newLi.innerHTML = `<img src = ${image} alt="${data.placeName}"/>`;
    slider.appendChild(newLi);
  });
  addressEl.textContent = data.address || "정보 없음";
  contactEl.textContent = data.contact || "정보 없음";
  operationHoursEl.textContent = data.operationHours || "운영 시간 정보 없음";
  descriptionEl.textContent = data.description || "상세 정보 없음";
  reviews.innerHTML = "";
  data.reviews.forEach((item) => {
    let newLi = document.createElement("li");
    newLi.innerHTML = `<div>⭐️${item.rating}</div>
                    <div>${item.comment}</div>
                    <div>${item.author} | ${item.date}</div>`;

    reviews.appendChild(newLi);
  });

  new Splide("#travel-slider", {
    type: "loop", // 무한 반복
    perPage: 1, // 한 번에 1개 보여줌
    autoplay: true, // 자동 재생
    interval: 3000, // 3초 간격
    pauseOnHover: true, // 마우스 올리면 멈춤
    arrows: true, // 좌우 버튼 표시
    pagination: true, // 하단 점 네비게이션 표시
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
  // 날짜 영역 클릭 시 달력 모달 열기
  dateRangeElement.addEventListener("click", () => {
    calendarModalBackground.style.display = "flex";
  });
  // 달력 아이콘 클릭 시 달력 모달 열기
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
  //탭 2영역
  const tab2TitleEl = document.getElementById("tab2Title");
  const tab2SubTitleEl = document.getElementById("tab2SubTitle");

  //탭 3영역
  const tab3TitleEl = document.getElementById("tab3Title");
  const tab3SubTitleEl = document.getElementById("tab3SubTitle");

  if (selectedAreaCode !== "") {
    const areaName = findAreaNameByCode(selectedAreaCode);
    if (areaName) {
      areaNameElement.textContent = areaName;
      tab2TitleEl.textContent = areaName;
      tab3TitleEl.textContent = areaName;
    }
  } else {
    areaNameElement.textContent = "여행 일정";
    tab2TitleEl.textContent = "여행 일정";
    tab3TitleEl.textContent = "여행 일정";
  }

  if (selectedStartDate && selectedEndDate) {
    dateRangeElement.textContent = `${formatDateForRange(
      selectedStartDate
    )} ~ ${formatDateForRange(selectedEndDate)}`;
    calendarIcon.style.display = "inline";

    tab2SubTitleEl.textContent = `${formatDateForRange(
      selectedStartDate
    )} ~ ${formatDateForRange(selectedEndDate)}`;

    tab3SubTitleEl.textContent = `${formatDateForRange(
      selectedStartDate
    )} ~ ${formatDateForRange(selectedEndDate)}`;
  } else {
    dateRangeElement.textContent = `${formatDateForRange(
      today
    )} ~ ${formatDateForRange(today)}`;
    calendarIcon.style.display = "inline";

    tab2SubTitleEl.textContent = `${formatDateForRange(
      today
    )} ~ ${formatDateForRange(today)}`;

    tab3SubTitleEl.textContent = `${formatDateForRange(
      today
    )} ~ ${formatDateForRange(today)}`;
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
    const day = date.getDate() + 1;
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
    return;
  }

  if (!selectedEndDate) {
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
// 예시: 일정 결과에서 해당 날짜의 장소만 추출하는 함수
function getPlacesByDate(scheduleJson, dateStr) {
  // scheduleJson: Gemini에서 받은 일정 결과(JSON 파싱된 객체)
  // dateStr: '2025-05-01' 등 날짜 문자열
  if (!scheduleJson || !scheduleJson.Item) return [];
  const dayPlan = scheduleJson.Item.find((item) => item.Date === dateStr);
  return dayPlan ? dayPlan.Places : [];
}
// 기존 마커를 모두 지우기 위한 배열
let kakaoMarkers = [];
// 기존 선(폴리라인)을 지우기 위한 변수
let kakaoPolyline = null;
function setMarkersByPlaceNames(placeNames) {
  const geocoder = new kakao.maps.services.Places();

  // 기존 마커 지우기
  kakaoMarkers.forEach((marker) => marker.setMap(null));
  kakaoMarkers = [];

  // 기존 선(폴리라인) 지우기
  if (kakaoPolyline) {
    kakaoPolyline.setMap(null);
    kakaoPolyline = null;
  }

  // bounds 객체 생성 (모든 마커가 보이도록)
  const bounds = new kakao.maps.LatLngBounds();
  let foundCount = 0;
  const markerCoords = [];

  placeNames.forEach((placeName, idx) => {
    geocoder.keywordSearch(placeName, function (result, status) {
      if (status === kakao.maps.services.Status.OK) {
        const coords = new kakao.maps.LatLng(result[0].y, result[0].x);
        // 순번에 따라 색상 결정
        let bgColor = "#ffb14b"; // 기본: 주황
        if (idx === 0) bgColor = "#3ec6ec"; // 첫번째: 파랑
        else if (idx === placeNames.length - 1) bgColor = "#ff4b7d"; // 마지막: 빨강
        // SVG로 커스텀 마커 이미지 생성
        const svg = `
        <svg xmlns='http://www.w3.org/2000/svg' width='36' height='48'>
          <circle cx='18' cy='18' r='16' fill='${bgColor}' stroke='white' stroke-width='4'/>
          <text x='18' y='18' text-anchor='middle' font-size='20' font-weight='bold' fill='white' alignment-baseline='middle' dominant-baseline='middle'>${
            idx + 1
          }</text>
        </svg>
      `;
        const markerImage = new kakao.maps.MarkerImage(
          "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg),
          new kakao.maps.Size(36, 48),
          { offset: new kakao.maps.Point(18, 40) }
        );
        const marker = new kakao.maps.Marker({
          map: map,
          position: coords,
          title: placeName,
          image: markerImage,
        });
        kakaoMarkers.push(marker);
        bounds.extend(coords);
        markerCoords[idx] = coords; // 순서 보장

        // listEx.json에서 해당 장소 정보 찾기
        const item = placeDataItems.find((i) => i.placeName === placeName);
        let infoHtml = `<div style='min-width:180px;max-width:220px;padding:8px 12px;text-align:center;'>`;
        if (item) {
          if (item.images && item.images[0]) {
            infoHtml += `<img src='${item.images[0]}' alt='${item.placeName}' style='width:100px;height:auto;display:block;margin:0 auto 8px auto;border-radius:6px;'/>`;
          }
          infoHtml += `<b style='font-size:16px;'>${item.placeName}</b>`;
        } else {
          infoHtml += `<b>${placeName}</b>`;
        }
        infoHtml += `</div>`;

        const infowindow = new kakao.maps.InfoWindow({
          content: infoHtml,
        });
        kakao.maps.event.addListener(marker, "mouseover", function () {
          infowindow.open(map, marker);
        });
        kakao.maps.event.addListener(marker, "mouseout", function () {
          infowindow.close();
        });

        foundCount++;

        if (foundCount === placeNames.length) {
          if (!bounds.isEmpty()) {
            map.setBounds(bounds);
          }

          // 모든 마커 좌표가 준비되면 선(폴리라인) 그리기

          const validCoords = markerCoords.filter(Boolean);

          if (validCoords.length > 1) {
            // 폴리라인 생성 직전에 한 번 더 지우기

            if (kakaoPolyline) {
              kakaoPolyline.setMap(null);

              kakaoPolyline = null;
            }

            kakaoPolyline = new kakao.maps.Polyline({
              map: map,

              path: validCoords,

              strokeWeight: 4,

              strokeColor: "#007bff",

              strokeOpacity: 0.8,

              strokeStyle: "solid",
            });
          }
        }
      } else {
        console.warn(`장소 검색 실패: ${placeName}`);
        foundCount++;
        if (foundCount === placeNames.length) {
          if (!bounds.isEmpty()) {
            map.setBounds(bounds);
          }
          // 검색 실패도 카운트해서 폴리라인 그리기
          const validCoords = markerCoords.filter(Boolean);
          if (validCoords.length > 1) {
            kakaoPolyline = new kakao.maps.Polyline({
              map: map,
              path: validCoords,
              strokeWeight: 4,
              strokeColor: "#007bff",
              strokeOpacity: 0.8,
              strokeStyle: "solid",
            });
          }
        }
      }
    });
  });
}
function reloadMapMarkers() {
  const savedSchedule = localStorage.getItem("travelSchedule");
  if (savedSchedule) {
    // ... 기존 마커 표시 코드 ...
  }
}

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
  if (!searchInput.contains(e.target) && !tagBox.contains(e.target)) {
    hideTagBox();
  }
});

tagSearchBtn.addEventListener("click", (e) => {
  hideTagBox();
});

/* 

------------------탭4 핸들러 함수 -------------------

*/
function tab4Handler() {
  // 로컬스토리지에서 여행 일정 데이터 가져오기
  let rawData = localStorage.getItem("travelSchedule");

  if (!rawData) {
    console.error("여행 일정 데이터를 찾을 수 없습니다.");
    const scheduleSummary = document.getElementById("scheduleSummary");
    scheduleSummary.innerHTML = `
      <div class="schedule-header">
        <h1 id="scheduleSummaryTitle">여행 일정</h1>
        <div class="no-schedule">등록된 일정이 없습니다.</div>
      </div>
    `;
    return;
  }

  try {
    // 불필요한 마크다운 제거 개선
    rawData = rawData.trim();

    // 코드 블록 마크다운 제거 (```json과 ``` 패턴 모두 처리)
    if (rawData.startsWith("```")) {
      rawData = rawData
        .replace(/^```json\s*/, "")
        .replace(/^```\s*/, "")
        .replace(/\s*```$/, "")
        .trim();
    }

    // JSON 파싱
    const travelSchedule = JSON.parse(rawData);
    console.log("파싱된 여행 일정 데이터:", travelSchedule);

    // 날짜 요약 영역 초기화
    const scheduleSummary = document.getElementById("scheduleSummary");

    // 일정이 없는 경우 처리
    if (!travelSchedule || travelSchedule.length === 0) {
      scheduleSummary.innerHTML = `
        <div class="schedule-header">
          <h1 id="scheduleSummaryTitle">여행 일정</h1>
          <div class="no-schedule">등록된 일정이 없습니다.</div>
        </div>
      `;
      return;
    }

    // 중복된 날짜를 제거하고 정렬하여 고유한 날짜만 처리
    const uniqueDates = [
      ...new Set(travelSchedule.map((item) => item.Date)),
    ].sort();

    // 시작일과 종료일 추출
    if (uniqueDates.length > 0) {
      const startDate = new Date(uniqueDates[0]);
      const endDate = new Date(uniqueDates[uniqueDates.length - 1]);

      const days = ["일", "월", "화", "수", "목", "금", "토"];
      const formatDateWithDay = (dateObj) => {
        const yyyy = dateObj.getFullYear();
        const mm = (dateObj.getMonth() + 1).toString().padStart(2, "0");
        const dd = dateObj.getDate().toString().padStart(2, "0");
        const day = days[dateObj.getDay()];
        return `${yyyy}.${mm}.${dd}(${day})`;
      };

      // 여행 기간 계산 (일 수)
      const diffTime = Math.abs(endDate - startDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end days

      scheduleSummary.innerHTML = `
        <div class="schedule-header">
          <h1 id="scheduleSummaryTitle">여행 일정</h1>
          <div id="scheduleSummaryRange">
            <div class="date-range">${formatDateWithDay(
              startDate
            )} ~ ${formatDateWithDay(endDate)}</div>
          </div>
          <div class="trip-duration">${diffDays}일간의 여행</div>
        </div>
      `;
    }

    // 날짜별로 데이터 그룹화 (같은 날짜의 Places 합치기)
    const dateGroups = {};
    travelSchedule.forEach((item) => {
      if (!dateGroups[item.Date]) {
        dateGroups[item.Date] = { Date: item.Date, Places: [...item.Places] };
      } else {
        // 이미 해당 날짜가 있으면 장소 목록 병합 (중복 제거)
        const existingPlaces = new Set(dateGroups[item.Date].Places);
        item.Places.forEach((place) => existingPlaces.add(place));
        dateGroups[item.Date].Places = Array.from(existingPlaces);
      }
    });

    // 날짜순으로 정렬된 그룹화된 일정 생성
    const groupedSchedule = Object.values(dateGroups).sort(
      (a, b) => new Date(a.Date) - new Date(b.Date)
    );

    // 날짜 박스 생성
    groupedSchedule.forEach((item, scheduleIndex) => {
      const dateBoxElement = document.createElement("div");
      dateBoxElement.className = "custom-date-box";

      // 날짜 형식 변환 (YYYY.MM.DD(요일) 형식)
      const customDateObject = new Date(item.Date);
      const formattedCustomDate = `${customDateObject.getFullYear()}.${(
        customDateObject.getMonth() + 1
      )
        .toString()
        .padStart(2, "0")}.${customDateObject
        .getDate()
        .toString()
        .padStart(2, "0")} (${
        ["일", "월", "화", "수", "목", "금", "토"][customDateObject.getDay()]
      })`;

      // "1일차 yyyy.mm.dd(요일)" 한 줄 출력 구성
      const dayHeader = document.createElement("div");

      // 1일차 (굵고 큼)
      const dayNumber = document.createElement("span");
      dayNumber.id = "day-number";
      dayNumber.textContent = `${scheduleIndex + 1}일차 `;

      // yyyy.mm.dd(요일) (작고 흐림)
      const dayDate = document.createElement("span");
      dayDate.id = "day-date";
      dayDate.textContent = formattedCustomDate;

      // 조립해서 dateBox에 삽입
      dayHeader.appendChild(dayNumber);
      dayHeader.appendChild(dayDate);
      dateBoxElement.appendChild(dayHeader);

      // 장소 이름들 모아서 출력 (번호 제거 개선)
      const customPlacesLabel = document.createElement("p");
      let placeNames = "장소 정보 없음";

      if (Array.isArray(item.Places) && item.Places.length > 0) {
        // 괄호 안의 번호 제거하고 장소 이름만 추출
        const cleanPlaceNames = item.Places.map((place) =>
          place.replace(/\([0-9]+\)$/, "").trim()
        );
        placeNames = cleanPlaceNames.join(", ");
      }

      customPlacesLabel.textContent = placeNames;
      dateBoxElement.appendChild(customPlacesLabel);

      // 날짜 박스 클릭 이벤트 - 상세 정보 표시
      dateBoxElement.addEventListener("click", function () {
        // 모든 박스에서 active 클래스 제거
        document.querySelectorAll(".custom-date-box").forEach((box) => {
          box.classList.remove("active");
        });

        // 현재 박스에 active 클래스 추가
        this.classList.add("active");

        // 상세 정보 영역 확장
        const scheduleDetailsElement =
          document.getElementById("scheduleDetails");
        scheduleDetailsElement.classList.add("expanded");

        // ✅ 여기에 클릭된 날짜 저장
        const selectedDate = groupedSchedule[scheduleIndex].Date;
        testSelectedDate = selectedDate;

        // 마커 새로 표시 (해당 날짜의 장소로)
        const savedSchedule = localStorage.getItem("travelSchedule");
        if (savedSchedule) {
          let cleanText = savedSchedule
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();
          let scheduleArr;
          try {
            scheduleArr = JSON.parse(cleanText);
          } catch (e) {
            console.error("travelSchedule 파싱 오류:", e);
            return;
          }

          // 원하는 날짜에 맞는 장소만 추출
          function normalizeDate(dateStr) {
            return dateStr.replace(/^0+/, "").replace(/-0+/g, "-");
          }

          const dayPlan = scheduleArr.find(
            (item) =>
              normalizeDate(item.Date) === normalizeDate(testSelectedDate)
          );
          const places = dayPlan
            ? dayPlan.Places.map((p) => p.replace(/\(.*\)/, "").trim())
            : [];

          // 기존마커지우기기
          kakaoMarkers.forEach((marker) => marker.setMap(null));
          kakaoMarkers = [];
          // 기존 선(폴리라인) 지우기
          if (kakaoPolyline) {
            kakaoPolyline.setMap(null);
            kakaoPolyline = null;
          }

          //마커를 새로 찍는 함수
          setMarkersByPlaceNames(places); // 마커 표시 및 지도 bounds 이동
        }

        // 상세 정보 표시
        const itemIndex = scheduleIndex;
        showScheduleDetails(groupedSchedule[itemIndex]);
      });

      scheduleSummary.appendChild(dateBoxElement);
    });

    // 첫번째 날짜 자동 선택 (있다면)
    if (groupedSchedule.length > 0) {
      const firstDateBoxElement =
        scheduleSummary.querySelector(".custom-date-box");
      if (firstDateBoxElement) {
        firstDateBoxElement.click();
      }
    }
  } catch (error) {
    console.error("여행 일정 데이터 처리 중 오류가 발생했습니다:", error);

    // 오류 화면 표시
    const scheduleSummary = document.getElementById("scheduleSummary");
    scheduleSummary.innerHTML =
      '<h1 id="scheduleSummaryTitle">여행 일정</h1><p>일정 데이터 처리 중 오류가 발생했습니다.</p>';
  }
}

// 일정 상세 정보 표시 함수
async function showScheduleDetails(daySchedule) {
  const scheduleDetails = document.getElementById("scheduleDetails");
  const res = await fetch(jsonFilePath);
  const listData = await res.json();

  const dateObj = new Date(daySchedule.Date);

  // 연도는 두 자리만 추출
  const year = dateObj.getFullYear().toString().slice(2); // '2024' -> '24'
  // 월과 일은 두 자리로 포맷
  const month = (dateObj.getMonth() + 1).toString().padStart(2, "0");
  const day = dateObj.getDate().toString().padStart(2, "0");

  // "24.04.01" 형식으로 출력
  const formattedDate = `${year}.${month}.${day}`;

  // 날짜와 가이드 메시지를 포함하는 HTML 생성
  let detailsHTML = `
    <div class="details-date">${formattedDate}</div>
    <div id="placeDetailsGuide" style="margin-bottom: 20px; margin-top: 10px; padding: 12px 16px; background-color: rgb(240, 249, 255); border: 1px solid rgb(186, 230, 253); border-radius: 8px; color: rgb(3, 105, 161); font-size: 0.95rem; display: block;">
      클릭하여 해당장소의 상세정보를 확인해보세요.
    </div>
  `;

  // scheduleDetails에 HTML 설정
  scheduleDetails.innerHTML = detailsHTML;

  if (daySchedule.Places && daySchedule.Places.length > 0) {
    const places = daySchedule.Places;

    for (let i = 0; i < places.length; i++) {
      let placeName = places[i];
      // 괄호 내용 제거
      placeName = placeName.replace(/\([^\)]*\)/, "").trim();
      const matched = listData.items.find(
        (item) => item.placeName === placeName
      );

      if (matched) {
        const thumbnail = matched.images[0];

        // 안쪽에 해당 부분 추가
        let bgColor = "#ffb14b"; // 기본: 주황
        if (i === 0) bgColor = "#3ec6ec"; // 첫 장소: 파랑
        else if (i === places.length - 1) bgColor = "#ff4b7d"; // 마지막: 빨강

        // 토글 박스
        detailsHTML += `
          <span class="place-order" style="background-color: ${bgColor};">${
          i + 1
        }</span>
          <div class="place-detail collapsed">
            <div class="collapsed-summary">
              <img src="${thumbnail}" alt="${
          matched.placeName
        }" class="thumbnail-image" />
              <span class="place-name">${matched.placeName}</span>
            </div>
            <div class="detail-content" style="display: none;">
              <div class="images">
                <img src="${matched.images[0]}" alt="${
          matched.placeName
        }" class="main-image" />
              </div>
              <div class="place-detail-info">
                <div class="place-detail-feedback">
                  <span>🩷 ${matched.likes}</span>
                  <span>⭐ 미정</span>
                </div>
                <p id="place-detail-name">${matched.placeName}</p>
                <p id="place-detail-address">${matched.address}</p>
                <div class="section-divider"></div>
                <p id="place-detail-description">${matched.description}</p>
                <p><i class="bi bi-clock"></i>  ${matched.openHours}</p>
                <p><i class="bi bi-telephone"></i>  ${matched.contact}</p>
              </div>
            </div>
          </div>
        `;

        // 🔽 점선 박스와 경로 보기 아이콘 추가 (마지막 박스 뒤에는 추가하지 않음)
        // 점선 및 경로 링크 추가
        if (i < places.length - 1) {
          let nextPlaceName = places[i + 1];
          nextPlaceName = nextPlaceName.replace(/\([^\)]*\)/, "").trim(); // ⬅️ 이 줄 추가
          const nextMatched = listData.items.find(
            (item) => item.placeName === nextPlaceName
          );

          let routeLink = "";
          if (nextMatched) {
            const sName = encodeURIComponent(matched.address);
            const eName = encodeURIComponent(nextMatched.address);
            const routeUrl = `https://map.kakao.com/?sName=${sName}&eName=${eName}`;

            routeLink = `
              <div class="connector-line-box">
                <div class="dotted-line"></div>
                <div class="route-link">
                  <a href="${routeUrl}" target="_blank">
                    <i class="bi bi-car-front-fill"></i> 경로 보기
                  </a>
                </div>
              </div>
            `;
          }

          detailsHTML += routeLink;
        }
      } else {
        detailsHTML += `<p>${placeName} - 상세 정보 없음</p>`;
      }
    }
  } else {
    detailsHTML += "<p>등록된 장소가 없습니다.</p>";
  }

  scheduleDetails.innerHTML = detailsHTML;

  // ✅ 클릭 시 박스 확장/축소 토글 (하나만 열리도록 변경)
  scheduleDetails.querySelectorAll(".place-detail").forEach((box) => {
    box.addEventListener("click", () => {
      const detailContent = box.querySelector(".detail-content");
      const collapsedSummary = box.querySelector(".collapsed-summary");

      // 모든 박스에서 확장 상태를 초기화
      scheduleDetails.querySelectorAll(".place-detail").forEach((otherBox) => {
        if (otherBox !== box) {
          otherBox.classList.remove("expanded");
          otherBox.classList.add("collapsed");
          const otherDetailContent = otherBox.querySelector(".detail-content");
          const otherCollapsedSummary =
            otherBox.querySelector(".collapsed-summary");
          otherDetailContent.style.display = "none";
          otherCollapsedSummary.style.display = "flex";
        }
      });

      // 현재 박스 상태 토글
      box.classList.toggle("expanded");
      box.classList.toggle("collapsed");

      if (box.classList.contains("expanded")) {
        // 확장되면 상세 정보를 보이게
        detailContent.style.display = "block";
        collapsedSummary.style.display = "none";
      } else {
        // 축소되면 상세 정보를 숨기고 요약만 보이게
        detailContent.style.display = "none";
        collapsedSummary.style.display = "flex";
      }
    });
  });
}

// --------------------------탭4 화면에서 저장 버튼 클릭 시 처리--------------------------
// 저장 여부를 추적하는 변수
let isSaved = false;
document
  .getElementById("saveButton")
  .addEventListener("click", function (event) {
    // 경고 메시지를 표시하는 모달 창 표시
    const userConfirmed = confirm("여행 계획을 저장하시겠습니까?");

    if (!userConfirmed) {
      // 사용자가 '취소'를 누른 경우 함수 종료
      return;
    }

    // 사용자가 '확인'을 누른 경우 계속 진행
    // 1. 저장 버튼 클릭 시 로컬스토리지에 저장
    const raw = localStorage.getItem("travelSchedule");
    if (!raw) {
      return;
    }

    try {
      const cleanRaw = raw.replace(/```json|```/g, "").trim();
      const travelSchedule = JSON.parse(cleanRaw);

      // 2. tempSchedule에 저장할 데이터 준비
      // 시작일과 종료일 추출
      const dates = travelSchedule.map((item) => new Date(item.Date));
      const startDate = new Date(Math.min(...dates))
        .toISOString()
        .split("T")[0];
      const endDate = new Date(Math.max(...dates)).toISOString().split("T")[0];

      // 포맷에 맞게 schedule 데이터 구성 및 장소 이름에서 괄호 부분 제거
      const schedule = travelSchedule.map((item) => {
        // 각 장소 이름에서 "(" 이전 부분만 추출
        const cleanedPlaces = item.Places.map((place) => {
          const bracketIndex = place.indexOf("(");
          return bracketIndex > -1 ? place.substring(0, bracketIndex) : place;
        });

        return {
          date: item.Date,
          places: cleanedPlaces,
        };
      });

      // 최종 저장할 데이터 구조
      const scheduleToSave = {
        startDate: startDate,
        endDate: endDate,
        schedule: schedule,
      };

      // JSON 형식으로 tempSchedule에 저장
      sessionStorage.setItem("tempSchedule", JSON.stringify(scheduleToSave));

      // 3. 로그인 유무 판단
      const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

      // beforeunload 이벤트 리스너 제거
      window.removeEventListener("beforeunload", beforeUnloadHandler);

      if (!isLoggedIn) {
        // 로그인되지 않은 경우 로그인 안내 메시지 표시
        const loginConfirm = confirm(
          "일정을 저장하시려면 로그인이 필요합니다.\n로그인 페이지로 이동하시겠습니까?\n해당 일정은 로그인 성공시 자동 저장됩니다."
        );

        if (loginConfirm) {
          // beforeunload 이벤트 리스너 제거
          window.removeEventListener("beforeunload", beforeUnloadHandler);
          // 로그인 페이지로 이동
          window.location.href = "../login/login.html";
        }
        // 로그인을 취소한 경우 아무 작업도 수행하지 않음
      } else {
        // 로그인된 경우 savedSchedule에 추가
        const savedRaw = localStorage.getItem("savedSchedule");
        let savedSchedules = [];

        if (savedRaw) {
          savedSchedules = JSON.parse(savedRaw);
        }

        // 새 일정에 인덱스 부여
        const newIndex =
          savedSchedules.length > 0
            ? Math.max(...savedSchedules.map((item) => item.index)) + 1
            : 0;

        // tempSchedule에서 가져온 데이터에 인덱스 추가
        const tempSchedule = JSON.parse(sessionStorage.getItem("tempSchedule"));
        tempSchedule.index = newIndex;

        // savedSchedule에 추가
        savedSchedules.push(tempSchedule);
        localStorage.setItem("savedSchedule", JSON.stringify(savedSchedules));

        // tempSchedule 삭제
        sessionStorage.removeItem("tempSchedule");
        localStorage.removeItem("travelSchedule");

        // 마이페이지로 이동
        window.location.href = "../mypage/mypage.html";
      }
    } catch (e) {
      console.error("일정 저장 중 오류 발생:", e);
      alert("일정을 저장하는 중 오류가 발생했습니다.");
    }
  });

// ----------------------- 편집 버튼 클릭시 -----------------------
// 편집 버튼 클릭 시 tab5로 강제로 이동
document.getElementById("editButton").addEventListener("click", function () {
  // tab5 버튼을 강제로 표시하고 클릭
  const tab5Btn = document.getElementById("tab5Btn");
  if (tab5Btn) {
    tab5Btn.style.display = "block"; // tab5 버튼을 표시
    tab5Btn.click(); // tab5 버튼 클릭 이벤트 강제로 발생
  }
});
// 탭 5의 메인 로직
let savedForEditTab5 = [];
let isDragging = false;

// 편집 모드 초기화 함수
async function initializeEditMode() {
  console.log("편집 모드로 전환되었습니다.");

  // 컨트롤 패널 생성
  createControlPanel();

  const raw = localStorage.getItem("travelSchedule");
  if (!raw) {
    showEmptyState();
    return;
  }

  try {
    const cleanRaw = raw.replace(/```json|```/g, "").trim();
    const travelSchedule = JSON.parse(cleanRaw);

    // 날짜별로 장소 정리
    const grouped = {};
    travelSchedule.forEach((item) => {
      if (!grouped[item.Date]) grouped[item.Date] = [];
      item.Places.forEach((place) => {
        const cleaned = place.replace(/\(.*\)/, "").trim();
        grouped[item.Date].push(cleaned);
      });
    });

    // 외부 JSON 로드 (상대 경로 기준)
    const response = await fetch("../listEx.json").catch((e) => {
      console.error("장소 데이터를 불러오는데 실패했습니다:", e);
      return { json: () => Promise.resolve({ items: [] }) };
    });
    const listData = await response.json();
    const items = listData.items || [];

    // 날짜별 상세 정보 매핑
    savedForEditTab5 = Object.entries(grouped).map(([date, names]) => {
      const uniqueNames = [...new Set(names)];
      const places = uniqueNames.map((name) => {
        const matched = items.find((item) => item.placeName === name);
        return {
          name,
          address: matched ? matched.address : "주소 없음",
          category: matched?.category || "기타",
        };
      });
      return { date, places };
    });

    renderEditMode();
  } catch (e) {
    console.error("편집 모드 초기화 중 오류:", e);
    showErrorState("일정을 불러오는 데 문제가 발생했습니다.");
  }
}

// 편집 모드 UI 렌더링
function renderEditMode() {
  const container = document.getElementById("editModeContainer");
  const contentArea =
    document.getElementById("editModeContent") || document.createElement("div");
  contentArea.id = "editModeContent";
  contentArea.innerHTML = ""; // 내용 초기화

  if (!savedForEditTab5 || savedForEditTab5.length === 0) {
    showEmptyState();
    return;
  }

  // 일차 박스들을 가로로 정렬할 wrapper
  const dayWrapper = document.createElement("div");
  dayWrapper.className = "day-wrapper";

  savedForEditTab5.forEach((day, index) => {
    const dayBox = document.createElement("div");
    dayBox.className = "edit-day-box";
    dayBox.setAttribute("data-index", index);

    // 날짜 헤더
    const header = document.createElement("h3");
    header.textContent = `${index + 1}일차`;
    header.className = "day-header";

    // 날짜 표시 추가
    const dateSpan = document.createElement("span");
    dateSpan.textContent = ` (${day.date})`;
    dateSpan.style.fontSize = "0.85rem";
    dateSpan.style.fontWeight = "normal";
    dateSpan.style.color = "#64748b";
    header.appendChild(dateSpan);

    dayBox.appendChild(header);

    // 장소 리스트 (세로 정렬)
    const placeList = document.createElement("div");
    placeList.className = "place-list";
    placeList.setAttribute("data-day-index", index);

    day.places.forEach((place, placeIndex) => {
      const placeBox = createPlaceBox(place, placeIndex, index);
      placeList.appendChild(placeBox);
    });

    dayBox.appendChild(placeList);
    dayWrapper.appendChild(dayBox);
  });

  contentArea.appendChild(dayWrapper);

  // 컨테이너에 콘텐츠 영역 추가 (이미 있으면 대체됨)
  if (!document.getElementById("editModeContent")) {
    container.appendChild(contentArea);
  }

  // Sortable 적용
  applySortable();

  // 가이드 메시지 표시
  showGuideMessage(
    "드래그하여 장소의 순서를 변경하거나 다른 날짜로 이동하세요."
  );
}

// 장소 박스 생성 함수 - 주소 표시하지 않음
function createPlaceBox(place, index, dayIndex) {
  //dayIndex는 일자, index는 장소 순서
  const placeBox = document.createElement("div");
  placeBox.className = "place-box";
  placeBox.setAttribute("data-place-index", index);

  // 순서 원형 UI 생성
  const orderSpan = document.createElement("span");
  orderSpan.className = "dayindex-index-circle";
  orderSpan.textContent = index + 1;

  // 일차별 배경색 설정 (예시: 1일차는 파랑, 2일차는 주황, 3일차는 빨강)
  const dayColors = ["#3ec6ec", "#ffb14b", "#ff4b7d"];
  const bgColor = dayColors[dayIndex % dayColors.length] || "#797979";
  orderSpan.style.backgroundColor = bgColor;

  // 장소 이름 요소 생성
  const nameEl = document.createElement("div");
  nameEl.textContent = place.name;
  nameEl.style.fontWeight = "500";

  // 숫자 UI와 장소 이름을 감싸는 컨테이너 생성
  const contentWrapper = document.createElement("div");
  contentWrapper.className = "place-content";
  contentWrapper.appendChild(orderSpan);
  contentWrapper.appendChild(nameEl);

  placeBox.appendChild(contentWrapper);

  return placeBox;
}

// Sortable 적용 함수
function applySortable() {
  const placeLists = document.querySelectorAll(".place-list");

  placeLists.forEach((placeList) => {
    new Sortable(placeList, {
      animation: 150,
      ghostClass: "sortable-ghost",
      chosenClass: "sortable-chosen",
      dragClass: "sortable-drag",
      group: "shared",

      // 드래그 시작 시
      onStart: function (evt) {
        isDragging = true;
        document.querySelectorAll(".place-list").forEach((list) => {
          list.classList.add("highlight-drop-area");
        });
      },

      // 드래그 종료 시
      onEnd: function (evt) {
        isDragging = false;
        document.querySelectorAll(".place-list").forEach((list) => {
          list.classList.remove("highlight-drop-area");
        });

        const fromIndex = evt.oldIndex;
        const toIndex = evt.newIndex;

        // 출발 일차와 도착 일차 확인
        const fromDayIndex = parseInt(evt.from.getAttribute("data-day-index"));
        const toDayIndex = parseInt(evt.to.getAttribute("data-day-index"));

        console.log(
          `이동: ${fromDayIndex + 1}일차 ${fromIndex + 1}번째 장소 -> ${
            toDayIndex + 1
          }일차 ${toIndex + 1}번째 위치`
        );

        // 이동할 장소 데이터를 추출
        const movedPlaceData = savedForEditTab5[fromDayIndex].places[fromIndex];

        // 출발 일차에서 해당 장소 제거
        savedForEditTab5[fromDayIndex].places.splice(fromIndex, 1);

        // 도착 일차의 해당 위치에 장소 추가
        savedForEditTab5[toDayIndex].places.splice(toIndex, 0, movedPlaceData);

        // 여기에 데이터 갱신 로그 추가
        console.log("데이터 갱신됨:", savedForEditTab5);

        // 순번 UI 갱신
        updatePlaceOrderUI();

        // 변경 알림
        showToast(`장소가 ${toDayIndex + 1}일차로 이동되었습니다.`);

        // 변경 사항 자동 저장 (선택적)
        // saveChanges();
      },
    });
  });
}
//순번 UI 갱신 함수
function updatePlaceOrderUI() {
  const dayBoxes = document.querySelectorAll(".edit-day-box");

  dayBoxes.forEach((dayBox, dayIndex) => {
    const placeList = dayBox.querySelector(".place-list");
    const placeBoxes = placeList.querySelectorAll(".place-box");

    placeBoxes.forEach((placeBox, index) => {
      // 순번 원형 UI 요소 선택
      const orderSpan = placeBox.querySelector(".dayindex-index-circle");
      if (orderSpan) {
        orderSpan.textContent = index + 1;
        // 일차별 배경색 설정
        const dayColors = ["#3ec6ec", "#ffb14b", "#ff4b7d"];
        const bgColor = dayColors[dayIndex % dayColors.length] || "#797979";
        orderSpan.style.backgroundColor = bgColor;
      }
    });
  });
}

// 컨트롤 패널 생성
function createControlPanel() {
  const container = document.getElementById("editModeContainer");

  // 기존 컨트롤 패널 확인
  let controlPanel = document.getElementById("editModeControlPanel");

  if (!controlPanel) {
    controlPanel = document.createElement("div");
    controlPanel.id = "editModeControlPanel";
    controlPanel.style.marginBottom = "20px";
    controlPanel.style.display = "flex";
    controlPanel.style.justifyContent = "space-between";
    controlPanel.style.alignItems = "center";

    // 제목 영역
    const titleArea = document.createElement("div");
    const title = document.createElement("h2");
    title.textContent = "여행 일정 편집";
    title.style.margin = "0";
    titleArea.appendChild(title);

    // 버튼 영역
    const buttonArea = document.createElement("div");
    buttonArea.style.display = "flex";
    buttonArea.style.gap = "10px";

    const resetBtn = document.createElement("button");
    resetBtn.textContent = "초기화";
    resetBtn.className = "edit-control-btn reset-btn";
    resetBtn.style.backgroundColor = "#f8f9fa";
    resetBtn.style.color = "#333";
    resetBtn.style.border = "1px solid #ddd";
    resetBtn.style.padding = "8px 16px";
    resetBtn.style.borderRadius = "6px";
    resetBtn.style.cursor = "pointer";
    resetBtn.onclick = resetChanges;

    buttonArea.appendChild(resetBtn);

    controlPanel.appendChild(titleArea);
    controlPanel.appendChild(buttonArea);

    container.innerHTML = ""; // 컨테이너 초기화
    container.appendChild(controlPanel);
  }

  // 알림 영역 (가이드 메시지용)
  let notificationArea = document.getElementById("editModeNotification");
  if (!notificationArea) {
    notificationArea = document.createElement("div");
    notificationArea.id = "editModeNotification";
    notificationArea.style.marginBottom = "20px";
    notificationArea.style.padding = "12px 16px";
    notificationArea.style.backgroundColor = "#f0f9ff";
    notificationArea.style.border = "1px solid #bae6fd";
    notificationArea.style.borderRadius = "8px";
    notificationArea.style.color = "#0369a1";
    notificationArea.style.fontSize = "0.95rem";
    notificationArea.style.display = "none";
    container.appendChild(notificationArea);
  }

  // 토스트 메시지 컨테이너
  if (!document.getElementById("toastContainer")) {
    const toastContainer = document.createElement("div");
    toastContainer.id = "toastContainer";
    toastContainer.style.position = "fixed";
    toastContainer.style.bottom = "20px";
    toastContainer.style.right = "20px";
    toastContainer.style.zIndex = "1000";
    document.body.appendChild(toastContainer);
  }
}

// 변경사항 저장
function saveChanges() {
  try {
    // 저장을 위해 원래 형식으로 변환
    const formattedSchedule = savedForEditTab5.flatMap((day) => {
      return day.places.map((place) => ({
        Date: day.date,
        Places: [place.name],
      }));
    });

    // 날짜별로 장소 합치기
    const combinedSchedule = [];
    formattedSchedule.forEach((item) => {
      const existingDay = combinedSchedule.find((d) => d.Date === item.Date);
      if (existingDay) {
        existingDay.Places.push(...item.Places);
      } else {
        combinedSchedule.push({
          Date: item.Date,
          Places: [...item.Places],
        });
      }
    });

    localStorage.setItem("travelSchedule", JSON.stringify(combinedSchedule));
    showToast("일정이 저장되었습니다.", "success");
  } catch (e) {
    console.error("저장 중 오류 발생:", e);
    showToast("저장 중 오류가 발생했습니다.", "error");
  }
}

// 변경사항 초기화
function resetChanges() {
  if (
    confirm(
      "편집 내용을 초기화하시겠습니까? 저장되지 않은 변경사항은 사라집니다."
    )
  ) {
    initializeEditMode();
    showToast("편집 내용이 초기화되었습니다.");
  }
}

// 빈 상태 표시
function showEmptyState() {
  const container = document.getElementById("editModeContainer");

  // 컨트롤 패널 유지
  let controlPanel = document.getElementById("editModeControlPanel");
  let notification = document.getElementById("editModeNotification");

  // 기존 콘텐츠 영역 초기화
  let contentArea = document.getElementById("editModeContent");
  if (contentArea) contentArea.remove();

  // 빈 상태 메시지 생성
  contentArea = document.createElement("div");
  contentArea.id = "editModeContent";

  const emptyState = document.createElement("div");
  emptyState.style.textAlign = "center";
  emptyState.style.padding = "60px 20px";
  emptyState.style.backgroundColor = "#f8fafc";
  emptyState.style.borderRadius = "12px";
  emptyState.style.margin = "20px 0";

  const icon = document.createElement("div");
  icon.innerHTML = "📝";
  icon.style.fontSize = "3rem";
  icon.style.marginBottom = "16px";

  const message = document.createElement("h3");
  message.textContent = "저장된 일정이 없습니다";
  message.style.margin = "0 0 8px 0";
  message.style.color = "#334155";

  const subMessage = document.createElement("p");
  subMessage.textContent = "먼저 일정을 계획하고 저장해주세요.";
  subMessage.style.margin = "0";
  subMessage.style.color = "#64748b";

  emptyState.appendChild(icon);
  emptyState.appendChild(message);
  emptyState.appendChild(subMessage);
  contentArea.appendChild(emptyState);

  // 컨테이너에 추가
  container.appendChild(contentArea);
}

// 오류 상태 표시
function showErrorState(message) {
  const container = document.getElementById("editModeContainer");
  let contentArea = document.getElementById("editModeContent");
  if (contentArea) contentArea.remove();

  contentArea = document.createElement("div");
  contentArea.id = "editModeContent";

  const errorState = document.createElement("div");
  errorState.style.textAlign = "center";
  errorState.style.padding = "40px 20px";
  errorState.style.backgroundColor = "#fef2f2";
  errorState.style.borderRadius = "12px";
  errorState.style.margin = "20px 0";
  errorState.style.border = "1px solid #fecaca";

  const icon = document.createElement("div");
  icon.innerHTML = "⚠️";
  icon.style.fontSize = "2.5rem";
  icon.style.marginBottom = "16px";

  const messageEl = document.createElement("h3");
  messageEl.textContent = message || "오류가 발생했습니다";
  messageEl.style.margin = "0 0 8px 0";
  messageEl.style.color = "#b91c1c";

  const retryBtn = document.createElement("button");
  retryBtn.textContent = "다시 시도";
  retryBtn.style.marginTop = "16px";
  retryBtn.style.padding = "8px 16px";
  retryBtn.style.backgroundColor = "#ef4444";
  retryBtn.style.color = "white";
  retryBtn.style.border = "none";
  retryBtn.style.borderRadius = "6px";
  retryBtn.style.cursor = "pointer";
  retryBtn.onclick = initializeEditMode;

  errorState.appendChild(icon);
  errorState.appendChild(messageEl);
  errorState.appendChild(retryBtn);
  contentArea.appendChild(errorState);

  container.appendChild(contentArea);
}

// 가이드 메시지 표시
function showGuideMessage(message) {
  const notification = document.getElementById("editModeNotification");
  if (notification) {
    notification.textContent = message;
    notification.style.display = "block";
  }
}

// 토스트 메시지 표시
function showToast(message, type = "info") {
  const toastContainer = document.getElementById("toastContainer");

  const toast = document.createElement("div");
  toast.className = "toast-message";
  toast.textContent = message;

  // 스타일 설정
  toast.style.padding = "12px 16px";
  toast.style.marginBottom = "10px";
  toast.style.borderRadius = "8px";
  toast.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)";
  toast.style.transition = "all 0.3s ease";
  toast.style.opacity = "0";
  toast.style.transform = "translateY(20px)";

  // 타입에 따른 스타일
  switch (type) {
    case "success":
      toast.style.backgroundColor = "#10b981";
      toast.style.color = "white";
      break;
    case "error":
      toast.style.backgroundColor = "#ef4444";
      toast.style.color = "white";
      break;
    default:
      toast.style.backgroundColor = "#3498db";
      toast.style.color = "white";
  }

  toastContainer.appendChild(toast);

  // 애니메이션
  setTimeout(() => {
    toast.style.opacity = "1";
    toast.style.transform = "translateY(0)";
  }, 10);

  // 3초 후 제거
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(20px)";

    setTimeout(() => {
      toastContainer.removeChild(toast);
    }, 300);
  }, 3000);
}

// 취소 버튼 클릭 시 tab3로 돌아가기 (편집 취소)
document.getElementById("cancelButton").addEventListener("click", function () {
  const tab4Btn = document.getElementById("tab4Btn");
  tab4Btn.click();
  if (tab4Btn) {
    tab4Btn.style.display = "block";
    tab4Btn.click();
  }
});

// 적용 버튼 클릭 시 (변경 적용)
document.getElementById("applyButton").addEventListener("click", function () {
  saveChanges();
  const tab4Btn = document.getElementById("tab4Btn");
  tab4Btn.click();
  if (tab4Btn) {
    tab4Btn.style.display = "block";
    tab4Btn.click();
  }
});

// ------------------------ 리사이즈 랜들러 ------------------------
// 전역 변수로 isResizing 추가
let isResizing = false;

// 리사이즈 핸들러 초기화 함수
function initializeResizeHandler() {
  // 리사이즈 핸들 요소 생성 및 추가
  const tabContainer = document.getElementById("tab-container");
  const resizeHandle = document.createElement("div");
  resizeHandle.id = "resize-handle";
  tabContainer.appendChild(resizeHandle);

  let initialX;
  let initialWidth;

  // 드래그 시작 처리
  resizeHandle.addEventListener("mousedown", function (e) {
    isResizing = true;
    initialX = e.clientX;
    initialWidth = parseInt(window.getComputedStyle(tabContainer).width, 10);

    resizeHandle.classList.add("active");

    // 드래그 중 텍스트 선택 방지
    document.body.style.userSelect = "none";
    document.body.style.cursor = "col-resize";
  });

  // 드래그 중 처리
  document.addEventListener("mousemove", function (e) {
    if (!isResizing) return;

    const deltaX = e.clientX - initialX;
    const newWidth = initialWidth + deltaX;

    // 최소/최대 너비 제한
    const mainContainer = document.getElementById("main-container");
    const minWidth = 250; // 최소 너비 (픽셀)
    const maxWidth = mainContainer.offsetWidth * 0.8; // 최대 너비 (메인 컨테이너의 80%)

    // 너비 범위 내에서만 적용
    if (newWidth >= minWidth && newWidth <= maxWidth) {
      tabContainer.style.width = `${newWidth}px`;

      // 지도 리레이아웃 실행
      if (typeof map !== "undefined") {
        map.relayout();
      }
    }
  });

  // 드래그 종료 처리
  document.addEventListener("mouseup", function () {
    if (isResizing) {
      isResizing = false;
      resizeHandle.classList.remove("active");
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    }
  });

  // 창을 벗어났을 때도 드래그 종료
  document.addEventListener("mouseleave", function () {
    if (isResizing) {
      isResizing = false;
      resizeHandle.classList.remove("active");
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    }
  });
}

// 페이지 로드 시 리사이즈 핸들러 초기화
document.addEventListener("DOMContentLoaded", function () {
  initializeResizeHandler();
});
