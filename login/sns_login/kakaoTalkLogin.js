import { KAKAO_API } from './config.js';  // config.js에서 API 키 불러오기

// 카카오 초기화
if (!Kakao.isInitialized()) {
  Kakao.init(KAKAO_API);
  console.log('Kakao SDK Initialized:', Kakao.isInitialized());
}

// 전역 함수로 등록
window.loginWithKakao = function () {
  Kakao.Auth.login({
    success: function (authObj) {
      console.log('카카오 로그인 성공:', authObj);

      Kakao.API.request({
        url: '/v2/user/me',
        success: function (res) {
          const nickname = res.kakao_account.profile.nickname;
          const email = res.kakao_account.email;
          const profileImg = res.kakao_account.profile.profile_image_url;
          const kakaoAccessToken = authObj.access_token;

          // 기존 카카오 사용자 정보 불러오기
          const existingKakaoUser = JSON.parse(localStorage.getItem('kakao_user')) || {};

          // 기존 프로필 메시지 유지
          const currentProfileMessage =
            existingKakaoUser.profile?.profile_message || "나를 설명하는 한 줄!";

          // 프로필 객체 생성
          const kakao_profile = {
            type: "kakao",
            profile_message: currentProfileMessage
          };

          // 전체 사용자 정보 객체
          const userInfo = {
            nickname: nickname,
            email: email,
            profileImg: profileImg,
            kakaoAccessToken: kakaoAccessToken,
            profile: kakao_profile,
            login: true
          };

          // 로컬스토리지에 저장
          localStorage.setItem('isLoggedIn', 'true');
          localStorage.setItem('kakao_user', JSON.stringify(userInfo));

          alert(`${nickname}님 환영합니다!`);
          location.href = 'http://127.0.0.1:5500/main.html';
        },
        fail: function (error) {
          console.error('사용자 정보 요청 실패:', error);
        }
      });
    },
    fail: function (err) {
      console.error('카카오 로그인 실패:', err);
    }
  });
};
