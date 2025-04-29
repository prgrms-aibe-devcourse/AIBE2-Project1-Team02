document.addEventListener('DOMContentLoaded', function() {
  const findpwBtn = document.querySelector('.findpwBtn');

  document.querySelector('.findpw-form').addEventListener('submit', function(event) {
    event.preventDefault();  // 기본 제출 이벤트 방지

    const username = document.getElementById('userid').value;
    const email = document.getElementById('email').value;
    const userData = JSON.parse(localStorage.getItem('userInfo'));

    if (userData && userData.username === username && userData.email === email) {
      alert(`등록된 비밀번호는: ${userData.password}`);
      window.location.href = '../login/login.html'; 
    } else {
      alert('아이디나 이메일이 일치하지 않습니다.');
    }
  });
});
