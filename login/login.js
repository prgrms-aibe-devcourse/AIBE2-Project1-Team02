// login.js
const loginButton = document.querySelector('.loginBtn');

loginButton.addEventListener('click', function () {
  const inputUsername = document.getElementById('username').value;
  const inputPassword = document.getElementById('password').value;

  // localStorage에서 회원가입 정보 불러오기
  const savedUserData = JSON.parse(localStorage.getItem('userInfo'));

  if (!savedUserData) {
    alert('회원가입된 정보가 없습니다. 먼저 회원가입 해주세요.');
    return;
  }

  // 아이디와 비밀번호 일치 확인
  if (inputUsername === savedUserData.username && inputPassword === savedUserData.password) {
    // 로그인 성공 처리
    localStorage.setItem('isLoggedIn', 'true'); // 로그인 상태 저장
    window.location.href = '/main.html';  // 로그인 후 메인 페이지로 이동
  } else {
    alert('아이디 또는 비밀번호가 올바르지 않습니다.');
  }
});
