document.addEventListener("DOMContentLoaded", function () {
  const isLoggedIn = localStorage.getItem("isLoggedIn");

  if (isLoggedIn === "true") {
    const normalUser = JSON.parse(localStorage.getItem("normal_user"));
    const naverUser = JSON.parse(localStorage.getItem("naver_user"));
    const kakaoUser = JSON.parse(localStorage.getItem("kakao_user"));

    // 각 사용자 정보가 존재할 경우에만 login 상태 변경
    if (normalUser) {
      normalUser.login = false;
      localStorage.setItem("normal_user", JSON.stringify(normalUser));
    }

    if (naverUser) {
      naverUser.login = false;
      localStorage.setItem("naver_user", JSON.stringify(naverUser));
    }

    if (kakaoUser) {
      kakaoUser.login = false;
      localStorage.setItem("kakao_user", JSON.stringify(kakaoUser));
    }

    // 로그인 상태 전체 해제
    localStorage.setItem("isLoggedIn", "false");

    alert("로그아웃 되었습니다.");
    window.location.replace("/main.html");
  } else {
    alert("로그인 해주세요.");
    window.location.replace("../login/login.html");
  }
});
