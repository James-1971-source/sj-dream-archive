import React, { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate, useSearchParams } from 'react-router-dom';
import { Search, User, Menu, LogOut, LogIn, ShieldCheck } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import logo from '../../assets/logo_official.png';
import './Navbar.css';

const Navbar = () => {
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState('USER');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // 1. 검색어 URL 파라미터 동기화
  useEffect(() => {
    const q = searchParams.get('q');
    if (q !== null) {
      setSearchQuery(q);
    } else {
      setSearchQuery('');
    }
  }, [searchParams]);

  // 2. 인증 및 프로필 로드
  useEffect(() => {
    // 1. 초기 사용자 세션 및 프로필 로드
    checkUser();

    // 2. 인증 상태 변화 감지 (로그인/로그아웃 등)
    const { data: { subscription: authListener } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth event:', event);
      if (session?.user) {
        setUser(session.user);
        fetchUserProfile(session.user.id);
      } else {
        setUser(null);
        setAvatarUrl(null);
      }
    });

    // 3. 프로필 테이블 실시간 변경 감지 (프로필 생성/수정 시 즉시 반영)
    const profileSubscription = supabase
      .channel('profile-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'profiles' 
      }, (payload) => {
        // 현재 로그인한 사용자의 프로필 변경사항만 처리
        if (user?.id && payload.new && payload.new.id === user.id) {
          setAvatarUrl(payload.new.avatar_url);
          setUserRole(payload.new.role || 'USER');
        }
      })
      .subscribe();

    return () => {
      authListener?.unsubscribe();
      supabase.removeChannel(profileSubscription);
    };
  }, [user?.id]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUser(user);
      fetchUserProfile(user.id);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const fetchUserProfile = async (userId = null) => {
    try {
      let targetId = userId;
      
      if (!targetId) {
        const { data: { user } } = await supabase.auth.getUser();
        targetId = user?.id;
      }

      if (targetId) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('avatar_url, role')
          .eq('id', targetId)
          .maybeSingle();
        
        if (profile) {
          setAvatarUrl(profile.avatar_url);
          setUserRole(profile.role || 'USER');
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter') {
      if (searchQuery.trim()) {
        navigate(`/?q=${encodeURIComponent(searchQuery.trim())}`);
      } else {
        navigate('/');
      }
    }
  };

  return (
    <nav className="navbar">
      <div className="container nav-content">
        <div className="nav-left">
          <Link to="/" className="logo">
            <img src={logo} alt="S&J희망나눔 로고" className="logo-img" />
          </Link>
          <ul className="nav-links">
            <li><NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>갤러리</NavLink></li>
            <li><NavLink to="/upload" className={({ isActive }) => isActive ? 'active' : ''}>작품 올리기</NavLink></li>
            <li><NavLink to="/about" className={({ isActive }) => isActive ? 'active' : ''}>소개</NavLink></li>
          </ul>
        </div>
        
        <div className="nav-right">
          <div className="search-bar">
            <Search size={18} className="search-icon" onClick={() => handleSearchSubmit({key: 'Enter'})} style={{cursor: 'pointer'}} />
            <input 
              type="text" 
              placeholder="작품이나 작가를 검색하세요..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchSubmit}
            />
          </div>
          <div className="nav-actions">
            {user ? (
              <>
                {userRole === 'ADMIN' && (
                  <Link to="/admin" className="admin-nav-link" title="관리자 대시보드">
                    <ShieldCheck size={20} />
                    <span>대시보드</span>
                  </Link>
                )}
                <Link to="/profile" className="user-profile">
                  {userRole === 'ADMIN' && <span className="admin-badge">ADMIN</span>}
                  <div className="avatar">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="프로필" className="avatar-img" />
                    ) : (
                      <User size={20} />
                    )}
                  </div>
                </Link>
                <button className="logout-btn" onClick={handleLogout} title="로그아웃">
                  <LogOut size={20} />
                </button>
              </>
            ) : (
              <Link to="/login" className="login-link">
                <LogIn size={20} />
                <span>로그인</span>
              </Link>
            )}
          </div>
          <button className="mobile-menu">
            <Menu size={24} />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
