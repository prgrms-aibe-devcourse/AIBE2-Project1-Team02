// header.js
export function initHeaderLogic() {
  const profileBtn = document.querySelector('.header-profile-btn');
  const dropdown = document.querySelector('.profile-dropdown');
  const logoutBtn = document.getElementById('logoutBtn');
  const profileContainer = document.querySelector('.header-profile-container');
  const loginBtn = document.querySelector('.loginBtn'); // 페이지 내 존재 시 숨김 처리

  // 로그인 상태 확인 및 UI 조정
  const isLoggedIn = localStorage.getItem('isLoggedIn');

  if (isLoggedIn === 'true') {
    if (loginBtn) loginBtn.style.display = 'none';
    if (profileContainer) profileContainer.style.display = 'block';
  } else {
    if (profileContainer) profileContainer.style.display = 'none';
  }

  // 프로필 버튼 클릭 시 드롭다운 표시
  if (profileBtn && dropdown) {
    profileBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.toggle('hidden');
    });

    // 바깥 클릭 시 드롭다운 닫기
    document.addEventListener('click', (e) => {
      if (!dropdown.contains(e.target) && !profileBtn.contains(e.target)) {
        dropdown.classList.add('hidden');
      }
    });
  }

  // 로그아웃 기능
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('isLoggedIn');
      alert('로그아웃 되었습니다.');
      location.href = '/welcome.html';
    });
  }
}
