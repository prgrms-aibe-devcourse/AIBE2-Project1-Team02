document.addEventListener('DOMContentLoaded', function () {
    const deleteBtn = document.querySelector('.delete-account');
  
    if (deleteBtn) {
      deleteBtn.addEventListener('click', function () {
        const confirmDelete = confirm('정말 회원탈퇴하시겠습니까? 모든 정보가 삭제됩니다.');
        if (confirmDelete) {
          localStorage.removeItem('userInfo');        // 회원 정보 삭제
          localStorage.setItem('isLoggedIn', 'false'); // 로그인 상태도 false로
          alert('회원탈퇴가 완료되었습니다.');
          window.location.href = '../login/login.html'; // 로그인 페이지로 이동
        }
      });
    }
  });