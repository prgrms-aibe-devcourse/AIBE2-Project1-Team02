let currentPage = 1;
let totalPages = 1; // 전체 페이지 수 초기화

let isSearchMode = false; // 검색 상태 여부
let searchQuery = ""; // 검색 키워드 저장

// 화면 로드 됐을때, 메인 로직
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

  // 검색 버튼 클릭 이벤트 등록
  document
    .getElementById("search-btn")
    .addEventListener("click", searchKeyword);

  document
    .getElementById("reset-btn")
    .addEventListener("click", resetToInitialState);

  // 모달 처리
  modalHandler();
});

// 메인 행사 API 호출 및 데이터 로딩 함수
function loadFestivalData(page = 1) {
  const apiKey = window.__API_KEY__;
  const tourStartDate = "20250425";
  const tourEndDate = "20250430";
  const url = `https://apis.data.go.kr/B551011/KorService1/searchFestival1?numOfRows=10&pageNo=${page}&MobileOS=etc&MobileApp=team2&_type=json&arrange=O&eventStartDate=${tourStartDate}&eventEndDate=${tourEndDate}&serviceKey=${apiKey}`;

  fetch(url)
    .then((res) => res.json())
    .then((data) => {
      const items = data.response.body.items.item || [];
      const list = document.getElementById("festival-list");

      if (page === 1) {
        list.innerHTML = ""; // 첫 페이지일 때 목록 초기화
      }
      if (items.length === 0 && page === 1) {
        list.innerHTML = "<li>검색된 축제가 없습니다.</li>";
        return;
      }

      afterFetch(items, list); // items를 전달해줌

      // 전체 페이지 수 계산 (첫 번째 페이지 로딩 시 한 번만 계산)
      if (currentPage === 1) {
        const numOfRows = data.response.body.numOfRows;
        const totalCount = data.response.body.totalCount;
        totalPages = Math.ceil(totalCount / numOfRows); // 전체 페이지 수 계산

        console.log("전체 페이지 수:", totalPages);
      }
      console.log("현재 페이지:", currentPage);
      // 마지막 페이지라면 더보기 버튼 숨기기
      const moreBtn = document.getElementById("load-more-btn");
      if (currentPage >= totalPages) {
        moreBtn.style.display = "none"; // 버튼 숨기기
      }
    })
    .catch((err) => {
      const list = document.getElementById("festival-list");
      list.innerHTML = `<li>데이터 불러오기 실패: ${err.message}</li>`;
      console.error("API 호출 오류:", err);
    });
}
// 추가 상세정보
function handleLocationDetail(data) {
  const titleEl = document.getElementById("modal-title");
  const imageEl = document.getElementById("modal-image");
  const addrEl = document.getElementById("modal-addr");
  const telEl = document.getElementById("modal-tel");
  const periodEl = document.getElementById("modal-period");
  const mapLinkEl = document.getElementById("modal-map-link");

  titleEl.textContent = data.title ? data.title : "정보 없음";

  if (data.image) {
    imageEl.src = data.image;
    imageEl.alt = data.title || "축제 이미지";
  } else {
    imageEl.src = "";
    imageEl.alt = "축제 이미지 없음";
  }

  addrEl.textContent = data.addr ? data.addr : "정보 없음";
  telEl.textContent = data.tel ? data.tel : "정보 없음";

  periodEl.textContent =
    data.start && data.end ? `${data.start} ~ ${data.end}` : "기간 정보 없음";

  // 🗺 구글 지도 링크 설정
  if (data.lat && data.lng) {
    mapLinkEl.href = `https://www.google.com/maps?q=${data.lat},${data.lng}`;
  } else {
    mapLinkEl.href = "#";
    mapLinkEl.textContent = "위치 정보 없음";
  }

  fetchDetailInfo(data.contentId, data.contentTypeId);
  fetchDetailInfo2(data.contentId, data.contentTypeId);
}
// detailInfo(소개문) 가져오는 fetch 함수
function fetchDetailInfo(contentId, contentTypeId) {
  const modal = document.getElementById("festival-modal");
  const detailInfoEl = document.getElementById("modal-detail-info");
  const apiKey = window.__API_KEY__;
  const url = `https://apis.data.go.kr/B551011/KorService1/detailInfo1?MobileOS=etc&MobileApp=team2&_type=json&contentId=${contentId}&contentTypeId=${contentTypeId}&serviceKey=${apiKey}`;

  fetch(url)
    .then((res) => {
      if (!res.ok) {
        throw new Error(`HTTP 오류: ${res.status}`);
      }
      return res.json();
    })
    .then((data) => {
      const resultCode = data.response?.header?.resultCode;

      if (resultCode === "0000" || resultCode === "200") {
        const items = data.response.body.items.item || [];
        const infoText = items[0]?.infotext || "상세 정보 없음";
        detailInfoEl.textContent = infoText;
      } else {
        detailInfoEl.textContent = "상세 정보 없음 (API 오류)";
      }

      // 모달 열기
      modal.classList.remove("hidden");
    })
    .catch((err) => {
      detailInfoEl.textContent = `상세 정보를 불러오지 못했습니다: ${err.message}`;
      console.error("상세 정보 API 오류:", err);

      // 모달 열기 (실패해도 다른 정보는 보이게)
      modal.classList.remove("hidden");
    });
}
// detailInfo(운영시간 및 행사장안 위치) 가져오는 fetch 함수
function fetchDetailInfo2(contentId, contentTypeId) {
  const modal = document.getElementById("festival-modal");
  const placeEl = document.getElementById("modal-place");
  const playTimeEl = document.getElementById("modal-play-time");
  const apiKey = window.__API_KEY__;
  const url = `https://apis.data.go.kr/B551011/KorService1/detailIntro1?MobileOS=etc&MobileApp=team2&_type=json&contentId=${contentId}&contentTypeId=${contentTypeId}&serviceKey=${apiKey}`;

  fetch(url)
    .then((res) => {
      if (!res.ok) {
        throw new Error(`HTTP 오류: ${res.status}`);
      }
      return res.json();
    })
    .then((data) => {
      const resultCode = data.response?.header?.resultCode;

      if (resultCode === "0000" || resultCode === "200") {
        const items = data.response.body.items.item || [];
        const playTime = items[0]?.playtime || "정보 제공 없음";
        const place = items[0]?.eventplace || "정보 제공 없음";

        playTimeEl.innerHTML = sanitizeHTML(playTime);
        placeEl.textContent = place;
      } else {
        playTimeEl.textContent = "운영시간 정보 없음";
        placeEl.textContent = "행사장 위치 정보 없음";
      }

      // 모달 열기
      modal.classList.remove("hidden");
    })
    .catch((err) => {
      playTimeEl.textContent = `상세 정보를 불러오지 못했습니다: ${err.message}`;
      placeEl.textContent = `상세 정보를 불러오지 못했습니다: ${err.message}`;
      console.error("상세 정보 API 오류:", err);

      // 모달 열기 (실패해도 다른 정보는 보이게)
      modal.classList.remove("hidden");
    });
}
// 운영시간 및 행사장안 위치에 있는 \n을 <br>로 바꿔주는 함수
function sanitizeHTML(str) {
  const tempDiv = document.createElement("div");
  tempDiv.textContent = str;
  return tempDiv.innerHTML.replace(/\n/g, "<br>");
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

//fetch 함수에 공통적인 부분
function afterFetch(items, list) {
  items.forEach((f) => {
    const li = document.createElement("li");

    const imageUrl = f.firstimage || f.firstimage2;
    const imageHtml = imageUrl
      ? `<img src="${imageUrl}" alt="${f.title}" />`
      : "";
    const title = f.title || "";
    const tel = f.tel || "";
    const addr = f.addr1 + " " + f.addr2 || "";
    const contentId = f.contentid || "";
    const contentTypeId = f.contenttypeid || "";
    const eventStartDate = f.eventstartdate || "";
    const eventEndDate = f.eventenddate || "";
    const latitude = f.mapy || "";
    const longitude = f.mapx || "";

    li.dataset.title = title;
    li.dataset.tel = tel;
    li.dataset.addr = addr;
    li.dataset.start = eventStartDate;
    li.dataset.end = eventEndDate;
    li.dataset.lat = latitude;
    li.dataset.lng = longitude;
    li.dataset.image = imageUrl;
    li.dataset.contentId = contentId;
    li.dataset.contentTypeId = contentTypeId;

    li.addEventListener("click", () => {
      handleLocationDetail({
        title,
        tel,
        addr,
        start: eventStartDate,
        end: eventEndDate,
        lat: latitude,
        lng: longitude,
        image: imageUrl,
        contentId,
        contentTypeId,
      });
    });

    li.innerHTML = `
      ${imageHtml}
      <h2>${title} <span class="info-addr">${addr}</span></h2>
    `;
    list.appendChild(li);
  });
}

//키워드로 검색하는 로직
function searchKeyword() {
  const searchQuery = document.getElementById("search-input").value.trim(); // 입력된 검색어
  if (!searchQuery) {
    alert("검색어를 입력하세요.");
    return;
  }
  const apiKey = window.__API_KEY__;
  const url = `https://apis.data.go.kr/B551011/KorService1/searchKeyword1?numOfRows=10&MobileOS=etc&MobileApp=team2&_type=json&arrange=O&keyword=${searchQuery}&contentTypeId=15&serviceKey=${apiKey}`;

  fetch(url)
    .then((res) => res.json())
    .then((data) => {
      const items = data.response.body.items.item || [];
      const resultList = document.getElementById("festival-list");
      const moreBtn = document.getElementById("load-more-btn");

      resultList.innerHTML = "";

      if (items.length === 0) {
        resultList.innerHTML = "<li>검색된 축제가 없습니다.</li>";
        moreBtn.style.display = "none"; // ✨ 검색 결과 없을 때 더보기 버튼 숨기기
        return;
      }

      afterFetch(items, resultList);

      const numOfRows = data.response.body.numOfRows;
      const totalCount = data.response.body.totalCount;
      totalPages = Math.ceil(totalCount / numOfRows);

      console.log("전체 페이지 수:", totalPages);

      moreBtn.style.display = currentPage >= totalPages ? "none" : "block";
    })
    .catch((err) => {
      const list = document.getElementById("festival-list");
      list.innerHTML = `<li>데이터 불러오기 실패: ${err.message}</li>`;
      console.error("API 호출 오류:", err);
    });
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
