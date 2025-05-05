fetch('../sidebar/sidebar.html')
.then(res => res.text())
.then(data => {
  document.getElementById('sidebar-container').innerHTML = data;
});

const signupButton = document.querySelector('.signupBtn');

signupButton.addEventListener('click', function(event) {
  event.preventDefault();  // form 기본 제출 막기

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const email = document.getElementById('email').value;
  const normal_profile = {
    type : "normal", // 기본 프로필 이미지 URL
    profile_message : "나를 설명하는 한 줄!" // 기본 프로필 메시지
  }


  if (!username || !password) {
    alert('아이디와 비밀번호를 모두 입력하세요!');
    return;
  }

  const userData = {
    username: username,
    password: password,
    email : email,
    profile : normal_profile,
    login : true
  };

  localStorage.setItem('normal_user', JSON.stringify(userData));

  alert('회원가입이 완료되었습니다!');
  window.location.href = '../login/login.html'; 
});
