import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function EventPopup() {
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();

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
          <p style={styles.headerBadge}>🏆 AWARDS ANNOUNCEMENT 🏆</p>
          <h2 style={styles.headerTitle}>🌟 드림 스타 챌린지 결과 발표</h2>
          <p style={styles.headerSub}>청소년 창작자들의 꿈을 빛내줄 수상작이 발표되었습니다!</p>
        </div>

        {/* 본문 */}
        <div style={styles.body}>

          {/* 축하 안내 박스 */}
          <div style={styles.infoBox}>
            🎉 <strong>축하합니다!</strong> 관람객 여러분들의 따뜻한 댓글과 응원 투표(조회수, 좋아요, 댓글)를 집계하여 선정된 영광의 <strong>1등~3등 수상작</strong> 및 <strong>참가자 명단</strong>이 지금 바로 공개되었습니다!
          </div>

          {/* 시상 내역 */}
          <p style={styles.sectionLabel}>🎁 시상 내용</p>
          <div style={styles.prizeList}>
            {/* 1등, 2등, 3등 가로 배열 */}
            <div style={styles.prizeGrid}>
              <div style={{ ...styles.prizeCol, ...styles.prizeGold }}>
                <span style={styles.prizeIcon}>🥇</span>
                <span style={{ ...styles.prizeRankCol, color: "#7a5800" }}>1등 (이예윤)</span>
                <span style={{ ...styles.prizeAmountCol, color: "#7a5800" }}>상금 10만원</span>
              </div>
              <div style={{ ...styles.prizeCol, ...styles.prizeSilver }}>
                <span style={styles.prizeIcon}>🥈</span>
                <span style={{ ...styles.prizeRankCol, color: "#4f5b66" }}>2등 (이혜정)</span>
                <span style={{ ...styles.prizeAmountCol, color: "#4f5b66" }}>상금 5만원</span>
              </div>
              <div style={{ ...styles.prizeCol, ...styles.prizeBronze }}>
                <span style={styles.prizeIcon}>🥉</span>
                <span style={{ ...styles.prizeRankCol, color: "#7e5233" }}>3등 (최수정)</span>
                <span style={{ ...styles.prizeAmountCol, color: "#7e5233" }}>상금 3만원</span>
              </div>
            </div>
            {/* 참가상 정보 */}
            <div style={{ ...styles.prizeRow, ...styles.prizeAll, flexDirection: "column", alignItems: "stretch", gap: 4 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={styles.prizeIcon}>🎀</span>
                <span style={{ ...styles.prizeRank, color: "#2d6e2d" }}>
                  아티스트 참가상 (6명)
                </span>
                <span style={{ ...styles.prizeAmount, color: "#2d6e2d" }}>
                  편의점 상품권 5천원
                </span>
              </div>
            </div>
          </div>

          {/* 버튼 및 하단 링크 */}
          <button onClick={() => { navigate('/awards'); setVisible(false); }} style={styles.ctaButton}>
            🏆 수상작 발표 보러가기
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
    maxHeight: "90vh",
    overflowY: "auto",
    boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
    fontFamily: "'Inter', 'Noto Sans KR', sans-serif",
  },
  header: {
    background: "#1a5fa8",
    padding: "1.25rem 1.5rem 1rem",
    textAlign: "center",
  },
  headerBadge: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#ffd54f", // 골드 색상으로 헤더의 'SPECIAL EVENT'를 강조
    letterSpacing: 2,
    margin: "0 0 6px",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 700,
    color: "#ffffff",
    margin: "0 0 6px",
  },
  headerSub: {
    fontSize: 12,
    color: "#cce4f7",
    margin: 0,
  },
  body: {
    padding: "1.25rem 1.25rem",
  },
  dateRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
    marginBottom: "1rem",
  },
  dateBoxBlue: {
    background: "#f0f6ff",
    borderRadius: 12,
    padding: "10px 12px",
    borderLeft: "3px solid #1a5fa8",
  },
  dateBoxOrange: {
    background: "#fff3e0",
    borderRadius: 12,
    padding: "10px 12px",
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
    marginBottom: 6,
  },
  criteriaRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 4,
    marginBottom: "0.5rem",
  },
  plusSign: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#888",
  },
  criteriaBox: {
    background: "#f8f9fa",
    borderRadius: 10,
    padding: "10px 6px",
    textAlign: "center",
    border: "1px solid #e9ecef",
    flex: 1,
  },
  criteriaText: {
    fontSize: 11,
    color: "#495057",
    lineHeight: 1.4,
    margin: "6px 0 0",
    whiteSpace: "pre-line",
    fontWeight: 500,
  },
  criteriaNote: {
    fontSize: 11,
    color: "#666",
    textAlign: "center",
    marginTop: -4,
    marginBottom: "1rem",
    fontWeight: 500,
  },
  prizeList: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    marginBottom: "1rem",
  },
  prizeGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 6,
  },
  prizeCol: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
    borderRadius: 10,
    padding: "10px 4px",
    border: "1px solid transparent",
    textAlign: "center",
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
  prizeRankCol: {
    fontSize: 11,
    fontWeight: 600,
    whiteSpace: "nowrap",
  },
  prizeAmountCol: {
    fontSize: 12,
    fontWeight: 700,
    whiteSpace: "nowrap",
  },
  infoBox: {
    background: "#eef5fc",
    borderRadius: 10,
    padding: "10px 14px",
    marginBottom: "1rem",
    fontSize: 11,
    color: "#1a5fa8",
    lineHeight: 1.6,
  },
  ctaButton: {
    width: "100%",
    padding: "11px",
    background: "#1a5fa8",
    color: "#fff",
    border: "none",
    borderRadius: 12,
    fontSize: 14,
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
    marginTop: 12,
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
