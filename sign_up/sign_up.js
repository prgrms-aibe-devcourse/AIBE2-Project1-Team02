const signupButton = document.querySelector('.signupBtn');

signupButton.addEventListener('click', function(event) {
  event.preventDefault();  // form 기본 제출 막기

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const email = document.getElementById('email').value;

  if (!username || !password) {
    alert('아이디와 비밀번호를 모두 입력하세요!');
    return;
  }

  const userData = {
    username: username,
    password: password,
    email : email
  };

  localStorage.setItem('userInfo', JSON.stringify(userData));

  alert('회원가입이 완료되었습니다!');
  window.location.href = '../login/login.html'; 
});
