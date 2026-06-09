# KPI 대시보드 최종 디자인 명세 (Final Design Specification)

## 1. 디자인 철학 및 톤앤매너 (Design Philosophy & Tone)
- **핵심 가치:** 친근함(Warmth) + 데이터 기반 신뢰성(Data-driven Trustworthiness).
- **색상 팔레트:**
    - Primary Color (신뢰/안정): `#007bff` (S&J 희망나눔 블루 계열)
    - Secondary Color (긍정 지표): `#28a745` (성장/안정 녹색 계열)
    - Warning Color (주의/개선 필요): `#ffc107` (경고 노란색 계열)
    - Neutral Background: `#f8f9fa` (밝은 회색 배경)
- **타이포그래피:** 가독성을 최우선으로 하며, 친근함을 강조하는 산세리프 계열 폰트 사용. (예: Pretendard 또는 Noto Sans KR)

## 2. 데이터 흐름 및 레이아웃 구조 (Data Flow & Layout Structure)
대시보드는 **Layer 1 (요약) → Layer 2 (상세 지표) → Layer 3 (흐름 분석)**의 계층적 구조를 따른다.

- **Layout Grid:** 12-Column Grid 기반으로 설계하여 모바일 및 데스크톱 환경에서 유연하게 조정되도록 한다.
- **레이아웃 좌표:** 전체 대시보드는 `min-height: 80vh`로 설정하며, 주요 KPI 카드들은 3열 또는 4열 그리드를 사용한다.

## 3. 핵심 시각화 요소 상세 요구사항 (Core Visualization Details)

### A. 시스템 안정성 지표 섹션 (System Stability Metrics Section)
이 섹션은 데이터 무결성과 안정성을 가장 강조해야 한다.

| 지표 | 시각화 유형 | 색상 매핑 | 설명 및 목표 | 레이아웃 위치 |
| :--- | :--- | :--- | :--- | :--- |
| **Integrity Score** | 게이지/도넛 차트 | Primary Blue | 데이터 무결성의 전반적인 상태 (목표치 100%) | 상단 중앙, 가장 크게 표시 |
| **Error Rate** | 라인 차트 (추이) | Warning Yellow | 시간 경과에 따른 오류 발생 빈도의 변화 추이 | 좌측 컬럼 |
| **Data Flow Integrity** | 흐름 다이어그램/네트워크 맵 | Primary Blue | Layer 1~4 간의 데이터 연결 및 무결성 경로 시각화 (핵심) | 중앙 섹션, 상세 분석 영역 |

### B. KPI 요약 카드 섹션 (KPI Summary Cards Section)
가장 중요한 비즈니스 성과를 즉각적으로 파악할 수 있도록 디자인한다.

- **카드 구성:** 각 KPI는 명확한 제목, 현재 값, 이전 대비 변화율(%)을 포함해야 한다.
- **변화율 강조:** 긍정적인 변화(성장)는 녹색(`#28a745`)으로, 부정적인 변화(감소/오류 증가)는 노란색/빨간색 계열로 즉시 시각적으로 구분한다.

### C. 데이터 흐름 분석 섹션 (Data Flow Analysis Section)
Layer 1~4의 인과관계를 명확히 보여준다.

- **구조:** 각 레이어(L1, L2, L3, L4)를 노드(Node)로 설정하고, 데이터 흐름 방향을 화살표(Arrow)로 표현한다.
- **정합성 표시:** 각 연결선 위에는 `Integrity_Score` 및 `Error_Rate`가 해당 경로에 미치는 영향을 작은 아이콘이나 텍스트로 표시하여 시각적 신뢰도를 높인다.

## 4. 최종 검증 요구사항 (Final Validation Requirements)
1. **데이터 바인딩:** 모든 차트와 지표는 코다리에서 제공할 데이터 구조(`Schema`)의 필드에 정확하게 매핑되어야 한다.
2. **정합성 계산:** `designer_final_mockup_spec.md`에서 정의된 KPI 정합성 점수 및 일관성 지수가 시각화 결과와 완벽히 일치해야 한다.
3. **인터랙션:** 사용자가 특정 레이어(Layer)를 클릭했을 때, 해당 레이어의 상세 데이터 흐름이 팝업 또는 확대되어 표시되는 인터랙션을 반드시 구현한다.

<edit_file path="sessions/2026-05-18T14-20/designer.md"><find>기존</find><replace># KPI 대시보드 최종 디자인 명세 (Final Design Specification)</replace></edit_file>
<create_file path="sessions/2026-05-19T13-01/kpi_spec_for_coda.md"># 코다리에게 전달할 KPI 시각화 명세 파일\n\n## 1. 목적\n본 문서는 시스템 안정성 지표와 데이터 흐름을 기반으로, KPI 대시보드 프로토타입의 최종 디자인 정합성을 확보하기 위한 개발 요구사항(Specification)을 정의합니다.\n\n## 2. 디자인 요구사항 (Design Requirements)\n- **톤앤매너:** Warm & Trustworthy (친근함과 데이터 신뢰성).\n- **색상:** 위에서 확정된 팔레트(`Primary Blue`, `Warning Yellow` 등)를 엄격하게 준수해야 합니다.\n- **레이아웃:** 12-Column Grid 기반으로 하며, Layer 1~4의 인과관계를 시각화하는 데 중점을 둡니다.\n\n## 3. 데이터 매핑 요구사항 (Data Mapping Requirements)\n- **지표 통합:** `Integrity_Score`와 `Error_Rate`는 모든 주요 차트의 시각적 맥락에 반영되어야 합니다. 이 지표가 낮을 경우, 해당 영역은 경고 색상(Warning Color)으로 강조되어야 합니다.\n- **흐름 시각화:** Layer 1~4 간의 흐름은 단순한 연결이 아닌, 데이터 무결성 및 오류 발생 가능성을 나타내는 동적인 경로로 표현되어야 합니다.\n\n## 4. 최종 검증 (Final Validation)\n개발팀은 이 명세에 따라 `prototype_newsletter.html`을 제작하고, 디자인 정합성이 `designer.md`의 기준을 충족하는지 최종적으로 확인해야 합니다.