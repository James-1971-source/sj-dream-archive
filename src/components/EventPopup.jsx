import { useState, useEffect } from "react";

export default function EventPopup() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const STORAGE_KEY = "sj_event_popup_closed_date";
    // 한국 표준시 기준의 로컬 날짜 문자열 사용 (예: "2026. 5. 19.")
    // UTC 변환 오류(시차로 인해 밤에 닫았을 때 다음날 오전까지 안 나오는 문제 등)를 완벽하게 방지합니다.
    const todayStr = new Date().toLocaleDateString("ko-KR");
    const lastClosed = localStorage.getItem(STORAGE_KEY);

    // 오늘 날짜로 닫은 기록이 없으면 팝업 표시
    if (lastClosed !== todayStr) {
      setVisible(true);
    }
  }, []);

  const handleDoNotShowToday = () => {
    const todayStr = new Date().toLocaleDateString("ko-KR");
    localStorage.setItem("sj_event_popup_closed_date", todayStr);
    setVisible(false);
  };

  const handleJustClose = () => {
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.popup}>

        {/* 헤더 */}
        <div style={styles.header}>
          <p style={styles.headerBadge}>✨ SPECIAL EVENT ✨</p>
          <h2 style={styles.headerTitle}>🌟 드림 스타 챌린지</h2>
          <p style={styles.headerSub}>S&amp;J 드림 아카이브 × 관람객 응원 이벤트</p>
        </div>

        {/* 본문 */}
        <div style={styles.body}>

          {/* 기간 + 수상자 발표 */}
          <div style={styles.dateRow}>
            <div style={styles.dateBoxBlue}>
              <p style={styles.dateLabel}>🗓️ 이벤트 기간</p>
              <p style={styles.dateValue}>
                5월 20일
                <br />
                ~ 5월 31일
              </p>
            </div>
            <div style={styles.dateBoxOrange}>
              <p style={styles.dateLabelOrange}>🏅 수상자 발표</p>
              <p style={styles.dateValueOrange}>
                6월 10일 (금)
                <br />
                사이트 공지
              </p>
            </div>
          </div>

          {/* 시상 기준 */}
          <p style={styles.sectionLabel}>🏆 시상 기준 (총 3개 부문)</p>
          <div style={styles.criteriaRow}>
            {[
              { icon: "👀", text: "조회수\n많은 작품" },
              { icon: "💬", text: "댓글\n많은 작품" },
              { icon: "❤️", text: "좋아요\n많은 작품" },
            ].map((item) => (
              <div key={item.icon} style={styles.criteriaBox}>
                <span style={{ fontSize: 22 }}>{item.icon}</span>
                <p style={styles.criteriaText}>{item.text}</p>
              </div>
            ))}
          </div>

          {/* 시상 내역 */}
          <p style={styles.sectionLabel}>🎁 시상 내역</p>
          <div style={styles.prizeList}>
            <div style={{ ...styles.prizeRow, ...styles.prizeGold }}>
              <span style={styles.prizeIcon}>🥇</span>
              <span style={{ ...styles.prizeRank, color: "#7a5800" }}>1등 (1명)</span>
              <span style={{ ...styles.prizeAmount, color: "#7a5800" }}>상금 10만원</span>
            </div>
            <div style={{ ...styles.prizeRow, ...styles.prizeSilver }}>
              <span style={styles.prizeIcon}>🥈</span>
              <span style={{ ...styles.prizeRank, color: "#4f5b66" }}>2등 (1명)</span>
              <span style={{ ...styles.prizeAmount, color: "#4f5b66" }}>상금 5만원</span>
            </div>
            <div style={{ ...styles.prizeRow, ...styles.prizeBronze }}>
              <span style={styles.prizeIcon}>🥉</span>
              <span style={{ ...styles.prizeRank, color: "#7e5233" }}>3등 (1명)</span>
              <span style={{ ...styles.prizeAmount, color: "#7e5233" }}>상금 3만원</span>
            </div>
            <div style={{ ...styles.prizeRow, ...styles.prizeAll }}>
              <span style={styles.prizeIcon}>🎀</span>
              <span style={{ ...styles.prizeRank, color: "#2d6e2d" }}>
                작품 등록자 전원
              </span>
              <span style={{ ...styles.prizeAmount, color: "#2d6e2d" }}>
                편의점 상품권 5천원
              </span>
            </div>
          </div>

          {/* 참여 방법 */}
          <div style={styles.infoBox}>
            💡 <strong>참여 방법</strong> : 갤러리를 둘러보며 마음에 드는 작품에{" "}
            <strong>좋아요</strong>를 누르고 <strong>응원 댓글</strong>을 남겨주세요!
            여러분의 관심이 청소년 창작자들에게 큰 힘이 됩니다 🙌
          </div>

          {/* 버튼 및 하단 링크 */}
          <button onClick={handleJustClose} style={styles.ctaButton}>
            🎨 갤러리 구경하러 가기
          </button>
          
          <div style={styles.footerLinks}>
            <span onClick={handleDoNotShowToday} style={styles.footerLink}>
              오늘 하루 보지 않기
            </span>
            <span style={styles.footerDivider}>|</span>
            <span onClick={handleJustClose} style={styles.footerLink}>
              닫기
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.55)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    padding: "1rem",
  },
  popup: {
    background: "#ffffff",
    borderRadius: 20,
    maxWidth: 440,
    width: "100%",
    overflow: "hidden",
    boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
    fontFamily: "'Inter', 'Noto Sans KR', sans-serif",
  },
  header: {
    background: "#1a5fa8",
    padding: "1.75rem 2rem 1.5rem",
    textAlign: "center",
  },
  headerBadge: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#ffd54f", // 골드 색상으로 헤더의 'SPECIAL EVENT'를 강조
    letterSpacing: 2,
    margin: "0 0 8px",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 700,
    color: "#ffffff",
    margin: "0 0 8px",
  },
  headerSub: {
    fontSize: 13,
    color: "#cce4f7",
    margin: 0,
  },
  body: {
    padding: "1.5rem 1.5rem",
  },
  dateRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
    marginBottom: "1.25rem",
  },
  dateBoxBlue: {
    background: "#f0f6ff",
    borderRadius: 12,
    padding: "12px 14px",
    borderLeft: "3px solid #1a5fa8",
  },
  dateBoxOrange: {
    background: "#fff3e0",
    borderRadius: 12,
    padding: "12px 14px",
    borderLeft: "3px solid #e67e22",
  },
  dateLabel: {
    fontSize: 11,
    fontWeight: 600,
    color: "#1a5fa8",
    margin: "0 0 4px",
  },
  dateLabelOrange: {
    fontSize: 11,
    fontWeight: 600,
    color: "#a04000",
    margin: "0 0 4px",
  },
  dateValue: {
    fontSize: 13,
    fontWeight: 600,
    color: "#0d3d6e",
    margin: 0,
    lineHeight: 1.4,
  },
  dateValueOrange: {
    fontSize: 13,
    fontWeight: 600,
    color: "#7a3000",
    margin: 0,
    lineHeight: 1.4,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: 600,
    color: "#b37d14", // 차분하고 고급스러운 골드/브라운 톤
    marginBottom: 8,
  },
  criteriaRow: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 8,
    marginBottom: "1.25rem",
  },
  criteriaBox: {
    background: "#f8f9fa",
    borderRadius: 10,
    padding: "10px 6px",
    textAlign: "center",
    border: "1px solid #e9ecef",
  },
  criteriaText: {
    fontSize: 11,
    color: "#495057",
    lineHeight: 1.4,
    margin: "6px 0 0",
    whiteSpace: "pre-line",
    fontWeight: 500,
  },
  prizeList: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    marginBottom: "1.25rem",
  },
  prizeRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    borderRadius: 10,
    padding: "10px 14px",
    border: "1px solid transparent",
  },
  prizeGold: {
    background: "#fffdf3",
    borderColor: "#fbe6a2",
  },
  prizeSilver: {
    background: "#f8f9fa",
    borderColor: "#e2e4e7",
  },
  prizeBronze: {
    background: "#f8f9fa",
    borderColor: "#e2e4e7",
  },
  prizeAll: {
    background: "#f2faf2",
    borderColor: "#cdeecd",
  },
  prizeIcon: { fontSize: 18 },
  prizeRank: {
    fontSize: 13,
    fontWeight: 600,
    whiteSpace: "nowrap",
  },
  prizeAmount: {
    marginLeft: "auto",
    fontSize: 13,
    fontWeight: 600,
    whiteSpace: "nowrap",
  },
  infoBox: {
    background: "#eef5fc",
    borderRadius: 10,
    padding: "10px 14px",
    marginBottom: "1.25rem",
    fontSize: 11,
    color: "#1a5fa8",
    lineHeight: 1.6,
  },
  ctaButton: {
    width: "100%",
    padding: "13px",
    background: "#1a5fa8",
    color: "#fff",
    border: "none",
    borderRadius: 12,
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(26, 95, 168, 0.2)",
    transition: "background 0.2s ease",
  },
  footerLinks: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    marginTop: 15,
    fontSize: 12,
    color: "#888",
  },
  footerLink: {
    cursor: "pointer",
    textDecoration: "underline",
    userSelect: "none",
    fontWeight: 500,
  },
  footerDivider: {
    color: "#ddd",
    userSelect: "none",
  },
};
