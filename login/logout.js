// logout.js
document.addEventListener('DOMContentLoaded', function () {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
  
    if (isLoggedIn === 'true') {
      localStorage.setItem('isLoggedIn', 'false');
      localStorage.removeItem('naver_user');
      localStorage.removeItem('kakao_user');
      alert('로그아웃 되었습니다.');
      window.location.replace('/main.html');  // 메인 페이지로 리다이렉션
    } else {
      alert('로그인 해주세요.');
      window.location.replace('../login/login.html');  // 로그인 페이지로 리다이렉션
    }
  });
  