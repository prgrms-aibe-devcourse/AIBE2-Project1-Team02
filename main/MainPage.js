document.querySelectorAll(".tab").forEach((btn) => {
  btn.addEventListener("click", () => {
    document
      .querySelectorAll(".tabContent")
      .forEach((c) => (c.style.display = "none"));
    const target = document.getElementById(btn.dataset.tab);
    target.style.display = "block";
  });
});

let currentPage = 1;
let totalPages = 1; // 전체 페이지 수 초기화
let selectedAreaCode = ""; // 기본값은 빈 문자열 (전체 지역)
let selectedCategory = ""; // 선택된 카테고리
let filteredItems = []; // 필터링된 데이터 저장
const jsonFilePath = "../listEx.json"; // 로컬 파일 경로

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

document.addEventListener("DOMContentLoaded", () => {
  // 페이지 데이터 로딩 및 더보기 버튼 처리
  loadFestivalData(currentPage);

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
      currentPage = 1; // 페이지를 첫 번째 페이지로 초기화
      loadFestivalData(currentPage); // 지역에 맞는 데이터 로드

      // 버튼 스타일 변경 (활성화된 버튼에 스타일 추가)
      document
        .querySelectorAll(".area-btn")
        .forEach((btn) => btn.classList.remove("active"));
      event.target.classList.add("active"); // 클릭한 버튼에 active 클래스 추가
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

  // 모달 처리
  modalHandler();
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
        const imageHtml = imageUrl
          ? `<img src="${imageUrl}" alt="${f.placeName}" />`
          : "";

        // 각 장소의 정보 처리
        const id = f.id || "";
        const placeName = f.placeName || ""; // 장소 이름
        const category = f.category || ""; // 카테고리
        const address = f.address || ""; // 주소
        const operationHours = f.operationHours || "";
        const contact = f.contact || ""; // 연락처
        const description = f.description || "";
        const likes = f.likes || 0;

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

            // 이미지 src, title, description 추출
            const imgSrc = placeItem.querySelector("img").src;
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
            newLi.innerHTML = ` <div class="placeImg">
                                <img src="${imgSrc}">
                            </div>
                            <div class="placeDesc">
                                <p>${placeName}</p>
                                <p>${description}</p>
                            </div>
                            <button class="deletePlace">-</button>`;

            selectedPlaces.appendChild(newLi);

            // deleteBtn
            const deleteBtn = newLi.querySelector(".deletePlace");
            deleteBtn.addEventListener("click", () => {
              newLi.remove();
            });
            return;
          }
          // 모달열기기
          if (e.target.closest("li")) {
            handleLocationDetail({
              id,
              placeName,
              category,
              address,
              description,
              operationHours,
              contact,
              likes,
            });
          }
        });

        // 리스트에 HTML 삽입
        li.innerHTML = `
          <div class="placeImg">${imageHtml}</div>
          <div>
            <p>${placeName}<br/><span class="info-addr">${address}</span></p>
            <p><strong>좋아요:</strong> ${likes}</p>
          </div>
          <button class="addPlace">+</button>
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
  const imageEl = document.getElementById("modal-image");
  const contactEl = document.getElementById("modal-contact");
  const operationHoursEl = document.getElementById("modal-operationHours");
  const descriptionEl = document.getElementById("modal-description");

  placeNameEl.textContent = data.placeName || "정보 없음";
  imageEl.src = data.image || "";
  imageEl.alt = data.placeName || "축제 이미지";
  addressEl.textContent = data.address || "정보 없음";
  contactEl.textContent = data.contact || "정보 없음";
  operationHoursEl.textContent = data.operationHours || "운영 시간 정보 없음";
  descriptionEl.textContent = data.description || "상세 정보 없음";

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

// 오늘 날짜를 YYYYMMDD 형식으로 반환하는 함수
// function getTodayDate() {
//     const today = new Date();
//     const year = today.getFullYear();
//     const month = String(today.getMonth() + 1).padStart(2, "0");
//     const day = String(today.getDate()).padStart(2, "0");
//
//     return `${year}${month}${day}`;
// }
// 로드시, 날짜를 오늘 날짜로 초기화하는 함수
// function initializeDates() {
//     const dateInput = document.getElementById("daterange");
//
//     // 오늘 날짜를 YYYYMMDD 형식으로 설정
//     const todayDate = getTodayDate();
//
//     if (!dateInput.value) {
//         dateInput.value = todayDate;
//     }
//
//     globalStartDate = todayDate;
//     globalEndDate = todayDate;
// }
// 제이쿼리와 daterangepicker 라이브러리를 사용하여 날짜 선택 기능을 추가하는 함수
// $(function () {
// $("#daterange").daterangepicker({
//     opens: "center",
//     startDate: moment(),
//     endDate: moment(),
//     showDropdowns: true,
//     minDate: moment(),
//     locale: {
//         format: "YYYYMMDD",
//         applyLabel: "적용",
//         cancelLabel: "취소",
//     },
//     linkedCalendars: true,
//     showWeekNumbers: false,
// });

// $("#daterange").on("apply.daterangepicker", function (ev, picker) {
//     globalStartDate = picker.startDate.format("YYYYMMDD");
//     globalEndDate = picker.endDate.format("YYYYMMDD");
//
//     console.log("선택된 시작 날짜:", globalStartDate);
//     console.log("선택된 종료 날짜:", globalEndDate);
//
//     // 날짜가 변경되었으므로 데이터를 다시 로드
//     currentPage = 1; // 페이지를 첫 번째 페이지로 초기화
//     loadFestivalData(currentPage); // 날짜를 기반으로 데이터를 로드
// });