const loginButton = document.querySelector(".loginBtn");

loginButton.addEventListener("click", function () {
  const inputUsername = document.getElementById("username").value;
  const inputPassword = document.getElementById("password").value;

  // localStorage에서 회원가입 정보 불러오기
  const savedUserData = JSON.parse(localStorage.getItem("normal_user"));

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
    localStorage.setItem("isLoggedIn", "true");

    // 기존 프로필 메시지를 가져오거나 기본 문구 설정
    const currentProfileMessage =
      savedUserData.profile?.profile_message || "나를 설명하는 한 줄!";

    // 프로필 객체 생성
    const updatedProfile = {
      type: "normal",
      profile_message: currentProfileMessage
    };

    // 사용자 데이터 갱신
    savedUserData.profile = updatedProfile;         // 공통 접근용 키 추가
    savedUserData.login = true;                     // 로그인 상태 true

    // 로컬스토리지에 저장
    localStorage.setItem("normal_user", JSON.stringify(savedUserData));

    // 임시 스케줄 처리
    let tempSchedule = JSON.parse(sessionStorage.getItem("tempSchedule"));
    if (tempSchedule) {
      const savedRaw = localStorage.getItem("savedSchedule");
      let savedSchedules = [];

      if (savedRaw) {
        savedSchedules = JSON.parse(savedRaw);
      }

      const newIndex =
        savedSchedules.length > 0
          ? Math.max(...savedSchedules.map((item) => item.index)) + 1
          : 0;

      tempSchedule.index = newIndex;
      savedSchedules.push(tempSchedule);

      localStorage.setItem("savedSchedule", JSON.stringify(savedSchedules));
      sessionStorage.removeItem("tempSchedule");
      localStorage.removeItem("travelSchedule");

      // 마이페이지로 이동
      window.location.href = "../mypage/mypage.html";
      return;
    }

    // 일반 로그인 성공 시 메인 페이지 이동
    window.location.href = "/main.html";
  } else {
    alert("아이디 또는 비밀번호가 올바르지 않습니다.");
  }
});
