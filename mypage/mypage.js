// 로그인 여부 체크
document.addEventListener("DOMContentLoaded", () => {
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  if (isLoggedIn !== "true") {
    window.location.replace("../login/login.html");
    return;
  }

  document.body.style.display = "block";
  document.querySelector(".main-container").style.display = "block";

  fetch("../header/header.html")
    .then((res) => res.text())
    .then((html) => {
      const headerContainer = document.getElementById("header-container");
      headerContainer.innerHTML = html;

      import("../header/header.js").then((module) => {
        module.initHeaderLogic();
      });
    });
});

// 장소 긁어오는 기능
document.addEventListener("DOMContentLoaded", async function () {
  const currentDate = new Date();
  const savedSchedules = JSON.parse(
    localStorage.getItem("savedSchedule")
  );

  if (!savedSchedules || !Array.isArray(savedSchedules)) {
    console.log("여행 일정이 없습니다.");
    return;
  }

  // 장소 데이터 로드
  let placeDataItems = [];
  try {
    const response = await fetch("../listEx.json");
    if (!response.ok)
      throw new Error("장소 데이터를 불러오는 데 실패했습니다.");
    const placeData = await response.json();
    placeDataItems = Array.isArray(placeData)
      ? placeData
      : placeData.items;
  } catch (error) {
    console.error("장소 데이터를 불러오는 중 오류 발생:", error);
  }

  const upcomingTourSection = document.querySelector(
    ".tour-section .tour-list.upcoming"
  );
  const completedTourSection = document.querySelector(
    ".tour-section .tour-list.completed"
  );

  const upcomingTours = savedSchedules.filter(
    (tour) => new Date(tour.startDate) >= currentDate
  );
  const completedTours = savedSchedules.filter(
    (tour) => new Date(tour.endDate) < currentDate
  );

  upcomingTours.sort(
    (a, b) => new Date(a.startDate) - new Date(b.startDate)
  );
  completedTours.sort((a, b) => b.index - a.index);

  function getImageForPlace(placeName) {
    const matched = placeDataItems.find(
      (place) => place.placeName === placeName
    );
    return (
      matched?.images?.[0] ||
      "https://api.cdn.visitjeju.net/photomng/imgpath/202409/20/b2087c57-7cb6-420d-a840-c6e7e581072e.png"
    );
  }

  function createTourCard(tour) {
    const { startDate, endDate, schedule, index } = tour;
    const firstPlace = schedule[0]?.places?.[0] || "여행지 미정";
    const displayTitle = tour.title?.trim() || firstPlace;

    const tourCard = document.createElement("div");
    tourCard.classList.add("tour-card");

    const tourImage = document.createElement("img");
    tourImage.classList.add("tour-image");
    tourImage.src = getImageForPlace(firstPlace);
    tourImage.alt = `${firstPlace} 여행`;

    const tourInfo = document.createElement("div");
    tourInfo.classList.add("tour-info");

    const tourTitleContainer = document.createElement("div");
    tourTitleContainer.style.display = "flex";
    tourTitleContainer.style.alignItems = "center";
    tourTitleContainer.style.gap = "8px";

    const tourTitle = document.createElement("h4");
    tourTitle.textContent = displayTitle;

    const editButton = document.createElement("button");
    editButton.textContent = "✏️";
    editButton.style.fontSize = "14px";
    editButton.style.cursor = "pointer";
    editButton.style.padding = "2px 6px";
    editButton.style.border = "1px solid #ccc";
    editButton.style.borderRadius = "4px";
    editButton.style.backgroundColor = "#f0f0f0";

    editButton.addEventListener("click", () => {
      const newTitle = prompt(
        "여행 제목을 입력하세요:",
        tourTitle.textContent
      );
      if (newTitle && newTitle.trim() !== "") {
        tourTitle.textContent = newTitle.trim();

        const allSchedules = JSON.parse(
          localStorage.getItem("savedSchedule")
        );
        const updateIndex = allSchedules.findIndex(
          (item) => item.index === index
        );
        if (updateIndex !== -1) {
          allSchedules[updateIndex].title = newTitle.trim();
          localStorage.setItem(
            "savedSchedule",
            JSON.stringify(allSchedules)
          );
        }
      }
    });

    tourTitleContainer.appendChild(tourTitle);
    tourTitleContainer.appendChild(editButton);

    const tourDate = document.createElement("p");
    tourDate.classList.add("tour-date");
    tourDate.textContent = `${startDate} ~ ${endDate}`;

    const tourPlan = document.createElement("p");
    tourPlan.classList.add("tour-plan");
    tourPlan.innerHTML = schedule
      .map((day) => {
        const date = day.date;
        const places = day.places.join(", ");
        return `<strong>${date}</strong>: ${places}`;
      })
      .join("<br />");

    tourInfo.appendChild(tourTitleContainer);
    tourInfo.appendChild(tourDate);
    tourInfo.appendChild(tourPlan);

    tourCard.appendChild(tourImage);
    tourCard.appendChild(tourInfo);

    return tourCard;
  }

  upcomingTours.forEach((tour) => {
    const card = createTourCard(tour);
    upcomingTourSection.appendChild(card);
  });

  completedTours.forEach((tour) => {
    const card = createTourCard(tour);
    completedTourSection.appendChild(card);
  });
});

// 프로필 메시지 편집 기능
document.addEventListener('DOMContentLoaded', function () {
  const profileMessageEl = document.querySelector(".profile-message");

  // 현재 로그인된 사용자 정보를 가져오는 함수
  function getActiveUser() {
    const kakaoUser = JSON.parse(localStorage.getItem("kakao_user"));
    const naverUser = JSON.parse(localStorage.getItem("naver_user"));
    const normalUser = JSON.parse(localStorage.getItem("normal_user"));
    if (naverUser && naverUser.login === true) {

      const userData = JSON.parse(localStorage.getItem("naver_user"));
      // 닉네임
      const nickname = userData.nickname;
      // 이메일
      const email = userData.email;
      // 프로필 이미지
      const profileImg = userData.profileImg;

      // 요소에 정보 삽입
      document.querySelector(
        ".whose-profile"
      ).textContent = `${nickname} 님의 투어스`;
      document.querySelector(".profile-image").src = profileImg;
      document.querySelector(
        ".username"
      ).innerHTML = `${nickname} <span class="userid">@${email}</span>`;

      return { user: naverUser, key: "naver_user" };
    }
    else if (kakaoUser && kakaoUser.login === true) {

      const userData = JSON.parse(localStorage.getItem("kakao_user"));
      // 닉네임
      const nickname = userData.nickname;
      // 이메일
      const email = userData.email;
      // 프로필 이미지
      const profileImg = userData.profileImg;

      // 요소에 정보 삽입
      document.querySelector(
        ".whose-profile"
      ).textContent = `${nickname} 님의 투어스`;
      document.querySelector(".profile-image").src = profileImg;
      document.querySelector(
        ".username"
      ).innerHTML = `${nickname} <span class="userid">@${email}</span>`;
      return { user: kakaoUser, key: "kakao_user" };
    }
    else if (normalUser && normalUser.login === true) {
      const userData = JSON.parse(localStorage.getItem("normal_user"));
      // 닉네임
      const nickname = "김기현";
      // 이메일
      const email = "watergon1126";
      // 프로필 이미지
      const profileImg = "../mypage/mypage_img/김기현_증명사진1.jpg";

      // 요소에 정보 삽입
      document.querySelector(
        ".whose-profile"
      ).textContent = `${nickname} 님의 투어스`;
      document.querySelector(".profile-image").src = profileImg;
      document.querySelector(
        ".username"
      ).innerHTML = `${nickname} <span class="userid">@${email}</span>`;

      return { user: normalUser, key: "normal_user" };
    }
  }
  // 초기 프로필 메시지 로드 함수
  function loadProfileMessage() {
    const { user } = getActiveUser();
    const message = user?.profile?.profile_message || "프로필 문구 없음";
    profileMessageEl.textContent = message;
  }

  const tourCountElement = document.querySelector(".tour-count");

  const savedSchedules = JSON.parse(localStorage.getItem("savedSchedule"));
  const tourCount = Array.isArray(savedSchedules) ? savedSchedules.length : 0;

  if (tourCountElement) {
    tourCountElement.innerHTML = `<strong style="text-align:center">나의 투어스<br />${tourCount}</strong>`;
  }

  // 페이지 로드 시 메시지 출력
  loadProfileMessage();

  // ✏️ 편집 기능
  const editButton = document.querySelector(".edit-profile");
  if (!editButton) {
    console.error("편집 버튼을 찾을 수 없습니다.");
  } else {
    editButton.addEventListener("click", () => {
      const { user: activeUser, key: activeKey } = getActiveUser();

      if (!activeUser || !activeKey) {
        alert("로그인된 사용자가 없습니다.");
        return;
      }

      const currentMsg = activeUser.profile?.profile_message || "";
      const newMessage = prompt("새 프로필 문구를 입력하세요:", currentMsg);

      if (newMessage !== null && newMessage.trim() !== "") {
        const trimmed = newMessage.trim();
        activeUser.profile.profile_message = trimmed;

        // 로컬스토리지 갱신
        localStorage.setItem(activeKey, JSON.stringify(activeUser));

        // 최신 메시지 다시 로드
        loadProfileMessage();
        alert("프로필 문구가 업데이트 되었습니다.");
      }
    });
  }
});
// 좋아요 목록 긁어오기 기능능
document.addEventListener('DOMContentLoaded', function () {
  const viewLikedPlacesButton = document.getElementById('view-liked-places');
  const modalContainer = document.getElementById('modal-container');

  const likedPlacesElement = document.getElementById("view-liked-places");
  const likePlaces = JSON.parse(localStorage.getItem("likePlaces"));
  const likedCount = likePlaces ? likePlaces.length : 0;

  if (likedPlacesElement) {
    likedPlacesElement.innerHTML = `좋아요<br /><strong style="text-align:center">${likedCount}</span>`;
  }

  // 모달 HTML 파일을 동적으로 불러오기
  fetch('modal.html')
    .then(response => response.text())
    .then(data => {
      modalContainer.innerHTML = data;
      const modal = document.getElementById('likedPlacesModal');
      const closeModal = document.querySelector('.close');
      const likedPlacesList = document.getElementById('likedPlacesList');

      // 좋아요 버튼 클릭 시 처리
      viewLikedPlacesButton.addEventListener('click', function () {
        console.log('좋아요 버튼 클릭됨');

        // 로컬 스토리지에서 좋아요 장소 목록 가져오기 (ID만 저장된 배열)
        const likedPlaceIds = JSON.parse(localStorage.getItem('likePlaces')) || [];
        console.log(likedPlaceIds);

        // 좋아요 목록이 없으면 경고 메시지 출력
        if (likedPlaceIds.length === 0) {
          alert('좋아요 장소가 없습니다!');
          return;
        }

        // listEx.json 파일에서 장소 데이터를 불러오기
        fetch('../listEx.json')
          .then(response => response.json())
          .then(data => {
            const places = data.items;
            const likedPlaces = places.filter(place => likedPlaceIds.includes(place.id));

            if (likedPlaces.length === 0) {
              alert('저장된 장소가 없습니다!');
              return;
            }

            // 모달에 좋아요 장소 목록을 표시
            likedPlacesList.innerHTML = likedPlaces.map(place =>
              `<li class="liked-place-item"><img src="${place.images[0]}" 
                alt="${place.placeName}" /> <h4>${place.placeName}</h4> </li>`).join('');

            // 모달을 화면에 보이게 하기
            modal.style.display = 'block';
          });
      });

      // 모달 닫기 버튼 클릭 시 처리
      closeModal.addEventListener('click', function () {
        modal.style.display = 'none';
      });

      // 모달 바깥 클릭 시 모달 닫기
      window.addEventListener('click', function (event) {
        if (event.target === modal) {
          modal.style.display = 'none';
        }
      });
    });
});
// 회원 탈퇴 기능
document.addEventListener("DOMContentLoaded", function () {
  const deleteBtn = document.querySelector(".delete-account");
  // 회원탈퇴 버튼 이벤트
  if (deleteBtn) {
    deleteBtn.addEventListener("click", function () {
      const confirmDelete = confirm(
        "정말 회원탈퇴하시겠습니까? 모든 정보가 삭제됩니다."
      );

      // 네이버 탈퇴
      if (localStorage.getItem("naver_user")) {
        if (confirmDelete) {
          const naverUser = JSON.parse(localStorage.getItem("naver_user"));
          const accessToken = naverUser.naverTokken;

          // access_token이 존재할 경우 탈퇴 요청
          if (accessToken) {
            fetch("https://nid.naver.com/oauth2.0/token", {
              method: "POST",
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
              body: new URLSearchParams({
                grant_type: "delete", // 토큰 삭제를 위한 grant_type
                client_id: "QcJXrtQ1k8vdMQwpLBsR",
                client_secret: "oyoHY22OMW",
                access_token: accessToken,
                service_provider: "NAVER",
              }),
            })
              .then((response) => response.json())
              .then((data) => {
                if (data.result === "success") {
                  // 연동 해제가 완료되면 로컬스토리지 정보 삭제 후 로그인 상태 초기화
                  localStorage.removeItem("naver_user");
                  localStorage.setItem("isLoggedIn", "false");
                  alert("네이버 연동 해제가 완료되었습니다.");
                  window.location.href = "../login/login.html";
                } else {
                  // 연동 해제 실패 시 오류 메시지 출력
                  console.error("네이버 연동 해제 실패:", data);
                  alert("네이버 연동 해제 중 오류가 발생했습니다.");
                }
              })
              .catch((err) => {
                // 네트워크 오류가 발생한 경우 로컬에서 강제로 연동 해제 처리
                console.error("네이버 연동 해제 실패:", err);
                localStorage.removeItem("naver_user");
                localStorage.setItem("isLoggedIn", "false");
                alert("네이버 연동 해제가 완료되었습니다.");
                window.location.href = "../login/login.html";
              });
          } else {
            // access_token이 없는 경우 처리
            alert(
              "access_token이 존재하지 않아 탈퇴 처리를 진행할 수 없습니다."
            );
          }
        }
      }

      // 카카오 탈퇴
      else if (localStorage.getItem("kakao_user")) {
        if (confirmDelete) {
          const kakaoUser = JSON.parse(localStorage.getItem("kakao_user"));
          const accessToken = kakaoUser.kakaoAccessToken;

          if (accessToken) {
            fetch("https://kapi.kakao.com/v1/user/unlink", {
              method: "POST",
              headers: {
                Authorization: "Bearer " + accessToken,
              },
            })
              .then((response) => {
                if (response.ok) {
                  localStorage.removeItem("kakao_user");
                  localStorage.setItem("isLoggedIn", "false");
                  alert("카카오 회원탈퇴가 완료되었습니다.");
                  window.location.href = "../login/login.html";
                } else {
                  return response.json().then((err) => {
                    throw err;
                  });
                }
              })
              .catch((error) => {
                console.error("카카오 연결 해제 실패:", error);
                alert("카카오 연동 해제 중 오류가 발생했습니다.");
              });
          } else {
            alert(
              "access_token이 존재하지 않아 탈퇴 처리를 진행할 수 없습니다."
            );
          }
        }
      }

      // 일반 탈퇴
      else {
        if (confirmDelete) {
          localStorage.removeItem("userInfo");
          localStorage.setItem("isLoggedIn", "false");
          alert("회원탈퇴가 완료되었습니다.");
          window.location.href = "../login/login.html";
        }
      }
    });
  }
});
