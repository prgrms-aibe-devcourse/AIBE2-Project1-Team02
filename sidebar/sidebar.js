document.addEventListener('DOMContentLoaded', function () {
  document.addEventListener('click', function (e) {
    if (e.target.classList.contains('sidebar-logOut')) {
      const isLoggedIn = localStorage.getItem('isLoggedIn');

      if (isLoggedIn === 'true') {
        localStorage.setItem('isLoggedIn', 'false');
        alert('로그아웃 되었습니다.');
        window.location.reload(); // 새로고침 → 위의 로그인 체크에서 막힘
      }
    }
  });
});
