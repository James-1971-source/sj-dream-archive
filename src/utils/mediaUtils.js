/**
 * 미디어 관련 유틸리티 함수
 */

// 음악 작품을 위한 로컬 기본 이미지 리스트 (AI 생성 프리미엄 이미지)
const MUSIC_THUMBNAILS = [
  '/assets/images/defaults/music_default_1.png',
  '/assets/images/defaults/music_default_2.png',
  '/assets/images/defaults/music_default_3.png',
  '/assets/images/defaults/music_default_4.png',
  '/assets/images/defaults/music_default_5.png',
  '/assets/images/defaults/music_default_6.png',
  '/assets/images/defaults/music_default_7.png',
  '/assets/images/defaults/music_default_8.png',
  '/assets/images/defaults/music_default_9.png',
  '/assets/images/defaults/music_default_10.png',
  '/assets/images/defaults/music_default_11.png',
  '/assets/images/defaults/music_default_12.png',
  '/assets/images/defaults/music_default_13.png'
];

/**
 * 작품 ID를 기반으로 일관된 랜덤 썸네일을 반환합니다.
 * @param {Object} work 작품 데이터
 * @returns {string} 썸네일 URL
 */
export const getThumbnailUrl = (work) => {
  if (!work) return 'https://via.placeholder.com/600x400?text=S%26J+Archive';

  // 1. 유효한 이미지 URL 판별
  const imgPattern = /\.(jpg|jpeg|png|webp|gif|svg|avif)/i;
  const hasValidThumbnail = work.thumbnail_url && imgPattern.test(work.thumbnail_url);
  
  if (hasValidThumbnail) return work.thumbnail_url;

  // 2. 비디오 카테고리의 경우 (별도 비디오 태그 처리를 위해 원본 반환)
  if (work.category === 'VIDEO' && work.file_url) {
    return work.thumbnail_url || work.file_url;
  }

  // 3. 웹툰, 동화책 등의 외부 링크 업로드 시 임시 제목 썸네일 제공 (한글 폰트 깨짐 방지를 위해 영어 전용 사용)
  if (!work.thumbnail_url || !imgPattern.test(work.thumbnail_url)) {
    if (work.category === 'WEBTOON') {
      return `https://placehold.co/600x600/7C3AED/FFFFFF/png?font=Montserrat&text=WEBTOON`;
    }
    if (work.category === 'EBOOK') {
      return `https://placehold.co/600x600/F59E0B/FFFFFF/png?font=Montserrat&text=E-BOOK`;
    }
  }

  // 4. 음악 카테고리이거나 구버전 이미지가 없는 경우 -> ID 기반 고정 레트로 이미지 할당
  const seed = String(work.id || work.title || 'sj-archive');
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
      hash = ((hash << 5) - hash) + seed.charCodeAt(i);
      hash = hash & hash; // Convert to 32bit integer
  }
  
  const index = Math.abs(hash) % MUSIC_THUMBNAILS.length;
  return MUSIC_THUMBNAILS[index];
};

/**
 * YouTube URL에서 Video ID를 추출합니다.
 * @param {string} url YouTube 동영상 URL
 * @returns {string|null} Video ID 또는 null
 */
export const getYoutubeVideoId = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

/**
 * YouTube Video ID로 고화질 썸네일 URL을 생성합니다.
 * @param {string} videoId YouTube Video ID
 * @returns {string|null} 썸네일 URL
 */
export const getYoutubeThumbnail = (videoId) => {
  if (!videoId) return null;
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
};
