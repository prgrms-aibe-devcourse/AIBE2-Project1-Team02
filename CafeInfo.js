import React from 'react';
import './CafeInfo.css'; // 스타일을 위한 CSS 파일

function CafeInfo() {
  return (
    <div className="cafe-info">
      <h2>카페정보</h2>
      <div className="cafe-profile">
        <div className="profile-img-container">
          <img src={process.env.PUBLIC_URL + "/img/profile-img.png"} alt="카페 이미지" />
        </div>
        <div className="cafe-details">
          <h3>매니저</h3>
          <p>2025.04.03.</p><br></br>
          <p>취뽀6남매</p>
        </div>
      </div>
      <button className="join-btn">카페 가입하기</button>
    </div>
  );
}

export default CafeInfo; 