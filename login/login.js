// login.js
const loginButton = document.querySelector(".loginBtn");

loginButton.addEventListener("click", function () {
  const inputUsername = document.getElementById("username").value;
  const inputPassword = document.getElementById("password").value;

  // localStorage에서 회원가입 정보 불러오기
  const savedUserData = JSON.parse(localStorage.getItem("userInfo"));

  if (!savedUserData) {
    alert("회원가입된 정보가 없습니다. 먼저 회원가입 해주세요.");
    return;
  }

  // 아이디와 비밀번호 일치 확인
  if (
    inputUsername === savedUserData.username &&
    inputPassword === savedUserData.password
  ) {
    // 로그인 성공 처리
    localStorage.setItem("isLoggedIn", "true"); // 로그인 상태 저장

    // 만일, 임시저장한 스케쥴 데이터가 있다면, 로그인 후에 마이페이로 가서 저장된걸 보여줘야한다.
    let tempSchedule = JSON.parse(sessionStorage.getItem("tempSchedule"));
    if (tempSchedule) {
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
      return;
    }

    window.location.href = "/main.html";
  } else {
    alert("아이디 또는 비밀번호가 올바르지 않습니다.");
  }
});
