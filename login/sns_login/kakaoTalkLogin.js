// kakaoTalkLogin.js
import { KAKAO_API } from './config.js';  // config.js에서 API 키 불러오기

// 카카오 초기화
if (!Kakao.isInitialized()) {
  Kakao.init(KAKAO_API);  // KAKAO_API 변수로 초기화
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
          const email = res.kakao_account.email; // 이메일 정보
          const profileImg = res.kakao_account.profile.profile_image_url;
          const kakaoAccessToken = authObj.access_token; // 액세스 토큰

          const userInfo = {
            nickname: nickname,
            email: email,
            profileImg: profileImg,
            kakaoAccessToken: kakaoAccessToken // 액세스 토큰 저장
        };

          alert(`${nickname}님 환영합니다!`);
          localStorage.setItem('isLoggedIn', 'true'); // 로그인 상태 저장
          localStorage.setItem('kakao_user', JSON.stringify(userInfo));
          location.href = 'http://127.0.0.1:5500/main.html'; // 로그인 성공 후 이동
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
