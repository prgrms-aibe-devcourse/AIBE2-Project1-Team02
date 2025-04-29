const loginBtn = document.getElementById('loginBtn');

loginBtn.addEventListener('click', function() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const message = document.getElementById('message');

  // 예시: 아이디는 admin, 비밀번호는 1234
  if (username === 'admin' && password === '1234') {
    message.textContent = '로그인 성공!';
    message.style.color = 'green';
  } else {
    message.textContent = '아이디 또는 비밀번호가 틀렸습니다.';
    message.style.color = 'red';
  }
});
