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
