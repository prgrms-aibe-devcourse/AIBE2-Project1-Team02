document.addEventListener('DOMContentLoaded', function() {
  const findidBtn = document.querySelector('.findidBtn');

  document.querySelector('.findid-form').addEventListener('submit', function(event) {
    event.preventDefault();  // 기본 제출 이벤트 방지

    const email = document.getElementById('email').value;
    const userData = JSON.parse(localStorage.getItem('userInfo'));

    if (userData && userData.email === email) {
      alert(`등록된 아이디는: ${userData.username}`);
      window.location.href = '../login/login.html'; 
    } else {
      alert('해당 이메일에 대한 아이디가 존재하지 않습니다.');
    }
  });
});
