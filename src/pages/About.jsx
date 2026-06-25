import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Sparkles, Target, Users, BookOpen, Music } from 'lucide-react';
import SEO from '../components/SEO';
import './About.css';

const About = () => {
  return (
    <div className="about-page">
      <SEO
        title="S&J드림아카이브 소개"
        description="S&J드림아카이브는 S&J희망나눔이 운영하는 청소년 창작 지원 플랫폼입니다. 청소년들이 자신의 작품을 세상에 선보이고 서로 응원하는 공간입니다."
        url="/about"
      />
      <div className="about-hero">
        <div className="container">
          <span className="badge">ABOUT US</span>
          <h1>S&J 드림 아카이브<br/>우리의 이야기</h1>
          <p>청소년들의 무한한 잠재력을 발견하고, 그들의 꿈이 예술이 되는 공간입니다.</p>
        </div>
      </div>

      <div className="container about-content">
        <section className="about-section mission-section">
          <div className="section-text">
            <h2><Sparkles className="icon-main" /> 우리의 미션</h2>
            <p><strong>S&J 드림 아카이브(Dream Archive)</strong>는 S&J희망나눔이 주관하는 청소년 창작 지원 플랫폼입니다. 저희는 미래의 예술가, 기획자, 크리에이터를 꿈꾸는 청소년들이 자신의 작품을 세상에 당당하게 선보이고 서로 영감을 주고받을 수 있는 가장 안전하고 자유로운 디지털 놀이터를 제공합니다.</p>
            <p>누구에게나 주어지는 평등한 기회 속에서, 작은 호기심과 아이디어가 하나의 훌륭한 창작물로 폭발적으로 성장하는 기적을 함께 응원해 주세요.</p>
          </div>
        </section>

        <section className="about-section values-section">
          <h2>우리가 추구하는 핵심 가치</h2>
          <div className="value-cards">
            <div className="value-card">
              <div className="icon-wrapper"><Heart /></div>
              <h3>존중과 응원</h3>
              <p>모든 창작물은 그 자체로 소중합니다. 우리는 서로의 다름을 존중하고 따뜻한 격려로 동반 성장을 돕습니다.</p>
            </div>
            <div className="value-card">
              <div className="icon-wrapper"><Target /></div>
              <h3>무한한 가능성</h3>
              <p>실패를 두려워하지 않는 대담한 도전이 결국 혁신을 만듭니다. 우리는 조금 서툴더라도 당신의 시도 자체를 응원합니다.</p>
            </div>
            <div className="value-card">
              <div className="icon-wrapper"><Users /></div>
              <h3>함께하는 성장</h3>
              <p>혼자서 꾸는 꿈은 그저 하나의 꿈에 불과하지만, 함께 꾸는 꿈은 반드시 현실이 됩니다. 우리는 연대의 힘을 굳게 믿습니다.</p>
            </div>
          </div>
        </section>

        <section className="about-section features-section">
          <h2>드림 아카이브에서 할 수 있는 것들</h2>
          <div className="feature-grid">
            <div className="feature-item">
              <Music className="feature-icon" />
              <div>
                <h4>다채로운 미디어 생태계</h4>
                <p>영상 비디오부터 음원 트랙, 나만의 오리지널 창작 웹툰, 멋진 이미지와 동화책(e-book)까지 그 어떤 형태의 창작물도 업로드하고 전시할 수 있습니다.</p>
              </div>
            </div>
            <div className="feature-item">
              <BookOpen className="feature-icon" />
              <div>
                <h4>디지털 포트폴리오의 구축</h4>
                <p>내가 만든 소중한 작품들을 안전한 클라우드 스토리지에 영구적으로 보존하며, 훗날 내 커리어를 빛내줄 나만의 아카이브를 설계하세요.</p>
              </div>
            </div>
          </div>
        </section>

        <div className="about-footer-cta">
          <h2>지금 바로, 당신의 꿈을 세계와 공유할 시간입니다.</h2>
          <Link to="/upload" className="cta-button primary-btn">나의 첫 작품 올리러 가기</Link>
        </div>
      </div>
    </div>
  );
};

export default About;
