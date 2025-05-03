document.addEventListener("DOMContentLoaded", function () {
  // 네이버
  if (localStorage.getItem("naver_user")) {
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
  }
  // 카카오
  else if (localStorage.getItem("kakao_user")) {
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
  }

  const deleteBtn = document.querySelector(".delete-account");

   // 회원탈퇴 버튼 이벤트
   if (deleteBtn) {
    deleteBtn.addEventListener("click", function () {
      const confirmDelete = confirm("정말 회원탈퇴하시겠습니까? 모든 정보가 삭제됩니다.");

      if (confirmDelete) {
        const kakaoUser = JSON.parse(localStorage.getItem("kakao_user"));
        const accessToken = kakaoUser.kakaoAccessToken;

        if (accessToken) {
          fetch('https://kapi.kakao.com/v1/user/unlink', {
            method: 'POST',
            headers: {
              'Authorization': 'Bearer ' + accessToken
            }
          })
            .then(response => {
              if (response.ok) {
                localStorage.removeItem("kakao_user");
                localStorage.setItem("isLoggedIn", "false");
                alert("카카오 회원탈퇴가 완료되었습니다.");
                window.location.href = "../login/login.html";
              } else {
                return response.json().then(err => { throw err; });
              }
            })
            .catch(error => {
              console.error("카카오 연결 해제 실패:", error);
              alert("카카오 연동 해제 중 오류가 발생했습니다.");
            });
        } else {
          alert("access_token이 존재하지 않아 탈퇴 처리를 진행할 수 없습니다.");
        }
      }
    });
  }
  
});
