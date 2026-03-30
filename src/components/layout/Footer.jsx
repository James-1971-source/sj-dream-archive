import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';
import logo from '../../assets/logo_official.png';
import { Youtube, Instagram, BookOpen } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="footer-logo">
               <img src={logo} alt="S&J희망나눔 로고" className="footer-logo-img" />
            </div>
            <p className="footer-desc">
              청소년들의 무한한 잠재력을 응원하고,<br />
              그들의 꿈이 현실이 되는 공간입니다.
            </p>
          </div>
          
          <div className="footer-links-group">
            <div className="footer-links">
              <h4>서비스 바로가기</h4>
              <ul>
                <li><Link to="/">메인 갤러리 (Gallery)</Link></li>
                <li><Link to="/upload">작품 창작 및 업로드 (Upload)</Link></li>
                <li><Link to="/about">아카이브 소개 (About Us)</Link></li>
              </ul>
            </div>
            <div className="footer-links">
              <h4>S&J희망나눔</h4>
              <ul>
                <li><a href="https://www.sj-hs.or.kr/" target="_blank" rel="noopener noreferrer">공식 웹사이트</a></li>
                <li><a href="https://www.sj-hs.or.kr/recruitment" target="_blank" rel="noopener noreferrer">청소년 재능기부 사업</a></li>
                <li><a href="https://www.sj-hs.or.kr/donate" target="_blank" rel="noopener noreferrer">후원 안내 (Support)</a></li>
              </ul>
            </div>
            <div className="footer-links">
              <h4>공식 채널 (SOCIAL)</h4>
              <div className="social-icons">
                <a href="https://www.youtube.com/@SJ-lv4ft" target="_blank" rel="noopener noreferrer" title="공식 유튜브">
                  <Youtube size={20} />
                </a>
                <a href="https://www.instagram.com/sj_hopesharing" target="_blank" rel="noopener noreferrer" title="공식 인스타그램">
                  <Instagram size={20} />
                </a>
                <a href="https://blog.naver.com/sjhopesharing" target="_blank" rel="noopener noreferrer" title="공식 네이버 블로그">
                  <BookOpen size={20} />
                </a>
              </div>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>© 2026 S&J희망나눔 Dream Archive. All rights reserved.</p>
          <div className="footer-policy" style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
            <span>아카이브의 모든 저작물은 S&J희망나눔 소유이며 무단 영리적 도용을 금합니다.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
