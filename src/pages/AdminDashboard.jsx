import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  FileText, 
  Eye, 
  Trash2, 
  Search, 
  Filter, 
  MoreVertical, 
  AlertCircle,
  TrendingUp,
  ChevronRight,
  UserX,
  ShieldCheck,
  HardDrive,
  Image as ImageIcon,
  Video,
  Music,
  File as FileIcon,
  Edit2
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalWorks: 0,
    totalViews: 0,
  });
  const [storageStats, setStorageStats] = useState({
    totalSize: 0,
    fileCount: 0,
    types: {
      image: { count: 0, size: 0 },
      video: { count: 0, size: 0 },
      audio: { count: 0, size: 0 },
      other: { count: 0, size: 0 }
    }
  });
  const [users, setUsers] = useState([]);
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [storageLoading, setStorageLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('storage'); // 'storage', 'users', 'works'
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (!profile || profile.role !== 'ADMIN') {
        alert('관리자만 접근 가능한 페이지입니다.');
        navigate('/');
        return;
      }

      fetchAllData();
      fetchStorageData();
    } catch (error) {
      console.error('Admin verification failed:', error);
      navigate('/');
    }
  };

  const fetchStorageData = async () => {
    setStorageLoading(true);
    try {
      let allFiles = [];
      let imgCount = 0, imgSize = 0;
      let vidCount = 0, vidSize = 0;
      let audCount = 0, audSize = 0;
      let othCount = 0, othSize = 0;
      let totalSize = 0;

      // 재귀적으로 폴더 내의 파일들을 모두 가져오는 함수
      const getFilesRecursively = async (path = '') => {
        const { data: items, error } = await supabase.storage.from('works-storage').list(path, {
          limit: 1000,
          offset: 0,
        });

        if (error) {
          console.error(`Error fetching storage path "${path}":`, error);
          return;
        }

        for (const item of items || []) {
          // Supabase Storage API에서 폴더는 metadata가 null로 반환됩니다.
          if (!item.metadata) {
            const nextPath = path ? `${path}/${item.name}` : item.name;
            await getFilesRecursively(nextPath);
          } else if (item.name !== '.emptyFolderPlaceholder') {
            allFiles.push(item);
            
            const size = item.metadata.size || 0;
            totalSize += size;
            const mime = item.metadata.mimetype || '';

            if (mime.startsWith('image/')) {
              imgCount++; imgSize += size;
            } else if (mime.startsWith('video/')) {
              vidCount++; vidSize += size;
            } else if (mime.startsWith('audio/')) {
              audCount++; audSize += size;
            } else {
              othCount++; othSize += size;
            }
          }
        }
      };

      await getFilesRecursively('');

      setStorageStats({
        totalSize,
        fileCount: allFiles.length,
        types: {
          image: { count: imgCount, size: imgSize },
          video: { count: vidCount, size: vidSize },
          audio: { count: audCount, size: audSize },
          other: { count: othCount, size: othSize }
        }
      });

    } catch (error) {
      console.error('Storage fetching failed:', error);
    } finally {
      setStorageLoading(false);
    }
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // 1. 전체 통계 조회
      const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      const { data: worksData } = await supabase.from('works').select('views');
      
      const totalViews = worksData?.reduce((acc, curr) => acc + (curr.views || 0), 0) || 0;
      const totalWorks = worksData?.length || 0;

      setStats({
        totalUsers: userCount || 0,
        totalWorks: totalWorks,
        totalViews: totalViews
      });

      // 2. 사용자 목록 조회
      const { data: userData } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      setUsers(userData || []);

      // 3. 최근 작품 목록 조회 (profiles와 join)
      const { data: recentWorks } = await supabase
        .from('works')
        .select('*, profiles(name)')
        .order('created_at', { ascending: false });
      setWorks(recentWorks || []);

    } catch (error) {
      console.error('Data fetching failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`${userName} 회원을 강제 탈퇴시키겠습니까? 모든 관련 데이터가 삭제될 수 있습니다.`)) return;

    try {
      const { error } = await supabase.from('profiles').delete().eq('id', userId);
      if (error) throw error;
      
      alert('회원이 정상적으로 삭제되었습니다.');
      setUsers(users.filter(u => u.id !== userId));
      // 통계 업데이트
      setStats(prev => ({ ...prev, totalUsers: prev.totalUsers - 1 }));
    } catch (error) {
      alert(`회원 삭제 실패: ${error.message}`);
    }
  };

  const handleDeleteWork = async (workId) => {
    if (!window.confirm('이 작품을 관리자 권한으로 삭제하시겠습니까?')) return;

    try {
      const { error } = await supabase.from('works').delete().eq('id', workId);
      if (error) throw error;

      alert('작품이 삭제되었습니다.');
      setWorks(works.filter(w => w.id !== workId));
      setStats(prev => ({ ...prev, totalWorks: prev.totalWorks - 1 }));
    } catch (error) {
      alert(`작품 삭제 실패: ${error.message}`);
    }
  };

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    user.id?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredWorks = works.filter(work => 
    work.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    work.profiles?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatBytes = (bytes, decimals = 2) => {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  };

  const STROAGE_LIMIT_MB = 1024;
  const STORAGE_LIMIT_BYTES = STROAGE_LIMIT_MB * 1024 * 1024;
  const usagePercent = Math.min(((storageStats.totalSize / STORAGE_LIMIT_BYTES) * 100), 100).toFixed(1);

  const renderStorageTab = () => {
    if (storageLoading) return <div className="dashboard-loading">저장소 정보를 계산 중입니다...</div>;

    return (
      <div className="storage-dashboard">
        <div className="storage-overview-card">
          <div className="storage-header">
            <HardDrive size={24} className="storage-icon" />
            <div>
              <h3>저장소 사용량</h3>
              <p>무료 한도 (1GB) 대비 사용 비율입니다.</p>
            </div>
          </div>
          <div className="progress-container">
            <div className="progress-labels">
              <span>{formatBytes(storageStats.totalSize)} / {STROAGE_LIMIT_MB} MB (무료 한도)</span>
              <span className="percent">{usagePercent}%</span>
            </div>
            <div className="progress-bar-bg">
              <div 
                className={`progress-bar-fill ${usagePercent > 90 ? 'danger' : usagePercent > 70 ? 'warning' : ''}`}
                style={{ width: `${usagePercent}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="storage-types-grid">
          <div className="type-card total">
            <div className="type-icon"><FileIcon size={20} /></div>
            <div className="type-info">
              <span className="type-name">전체 파일</span>
              <span className="type-count">{storageStats.fileCount}개</span>
              <span className="type-size">{formatBytes(storageStats.totalSize)}</span>
            </div>
          </div>
          <div className="type-card image">
            <div className="type-icon"><ImageIcon size={20} /></div>
            <div className="type-info">
              <span className="type-name">이미지</span>
              <span className="type-count">{storageStats.types.image.count}개</span>
              <span className="type-size">{formatBytes(storageStats.types.image.size)}</span>
            </div>
          </div>
          <div className="type-card video">
            <div className="type-icon"><Video size={20} /></div>
            <div className="type-info">
              <span className="type-name">영상</span>
              <span className="type-count">{storageStats.types.video.count}개</span>
              <span className="type-size">{formatBytes(storageStats.types.video.size)}</span>
            </div>
          </div>
          <div className="type-card audio">
            <div className="type-icon"><Music size={20} /></div>
            <div className="type-info">
              <span className="type-name">음악 및 오디오</span>
              <span className="type-count">{storageStats.types.audio.count}개</span>
              <span className="type-size">{formatBytes(storageStats.types.audio.size)}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="admin-dashboard container">
      <header className="admin-header">
        <div className="header-title">
          <ShieldCheck size={32} className="admin-icon" />
          <div>
            <h1>시스템 관리자 대시보드</h1>
            <p>꿈 아카이브의 모든 활동을 실시간으로 모니터링하고 관리합니다.</p>
          </div>
        </div>
        <button className="refresh-btn" onClick={() => { fetchAllData(); fetchStorageData(); }}>새로고침</button>
      </header>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon users"><Users size={24} /></div>
          <div className="stat-info">
            <span className="label">총 회원수</span>
            <span className="value">{stats.totalUsers.toLocaleString()} 명</span>
          </div>
          <TrendingUp size={16} className="trend-icon" />
        </div>
        <div className="stat-card">
          <div className="stat-icon works"><FileText size={24} /></div>
          <div className="stat-info">
            <span className="label">총 작품수</span>
            <span className="value">{stats.totalWorks.toLocaleString()} 개</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon views"><Eye size={24} /></div>
          <div className="stat-info">
            <span className="label">누적 조회수</span>
            <span className="value">{stats.totalViews.toLocaleString()} 회</span>
          </div>
        </div>
      </div>

      {/* Management Tabs & Content */}
      <div className="management-section">
        <div className="section-tools">
          <div className="tabs">
            <button 
              className={`tab-btn ${activeTab === 'storage' ? 'active' : ''}`}
              onClick={() => { setActiveTab('storage'); setSearchQuery(''); }}
            >
              스토리지
            </button>
            <button 
              className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => { setActiveTab('users'); setSearchQuery(''); }}
            >
              회원 관리
            </button>
            <button 
              className={`tab-btn ${activeTab === 'works' ? 'active' : ''}`}
              onClick={() => { setActiveTab('works'); setSearchQuery(''); }}
            >
              작품 관리
            </button>
          </div>
          <div className="search-box">
            <Search size={18} />
            <input 
              type="text" 
              placeholder={activeTab === 'users' ? "회원 이름 검색..." : "작품 제목 또는 작가 검색..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {loading || storageLoading ? (
          <div className="dashboard-loading">데이터를 불러오는 중입니다...</div>
        ) : (
          <div className="table-container">
            {activeTab === 'storage' ? (
              renderStorageTab()
            ) : activeTab === 'users' ? (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>회원명</th>
                    <th>권한</th>
                    <th>가입일</th>
                    <th>상태</th>
                    <th>액션</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(user => (
                    <tr key={user.id}>
                      <td className="user-cell">
                        <div className="mini-avatar">
                          {user.avatar_url ? <img src={user.avatar_url} alt="" /> : user.name?.charAt(0)}
                        </div>
                        <span>{user.name || '미설정'}</span>
                      </td>
                      <td><span className={`role-badge ${user.role}`}>{user.role}</span></td>
                      <td>{new Date(user.created_at).toLocaleDateString()}</td>
                      <td><span className="status-dot online">●</span> Active</td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="action-btn delete" 
                            onClick={() => handleDeleteUser(user.id, user.name)}
                            disabled={user.role === 'ADMIN'}
                            title="강제 탈퇴"
                          >
                            <UserX 
                              size={18} 
                              color={user.role === 'ADMIN' ? '#94a3b8' : '#ffffff'} 
                              strokeWidth={2.5} 
                              style={{ display: 'block', minWidth: '18px', minHeight: '18px' }} 
                            />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>작품 제목</th>
                    <th>분류</th>
                    <th>작가</th>
                    <th>조회수</th>
                    <th>액션</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredWorks.map(work => (
                    <tr key={work.id}>
                      <td className="work-cell" onClick={() => navigate(`/work/${work.id}`)}>
                        {work.title}
                      </td>
                      <td><span className="cat-badge">{work.category}</span></td>
                      <td>{work.profiles?.name || '익명'}</td>
                      <td>{work.views || 0}</td>
                      <td style={{ display: 'flex', gap: '8px', borderBottom: 'none' }}>
                        <button 
                          className="action-btn edit" 
                          onClick={() => navigate(`/edit/${work.id}`)}
                          title="작품 수정 및 미디어 URL 마이그레이션"
                          style={{ background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justify: 'center', width: '34px', height: '34px' }}
                        >
                          <Edit2 
                            size={16} 
                            color="#ffffff" 
                            strokeWidth={2.5} 
                            style={{ display: 'block', minWidth: '16px', minHeight: '16px', margin: 'auto' }} 
                          />
                        </button>
                        <button 
                          className="action-btn delete" 
                          onClick={() => handleDeleteWork(work.id)}
                          title="삭제"
                        >
                          <Trash2 
                            size={18} 
                            color="#ffffff" 
                            strokeWidth={2.5} 
                            style={{ display: 'block', minWidth: '18px', minHeight: '18px' }} 
                          />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {(activeTab === 'users' ? filteredUsers : filteredWorks).length === 0 && (
              <div className="no-results">검색 결과가 없습니다.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
