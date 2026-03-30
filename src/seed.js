import { supabase } from './lib/supabase';

const seedProfile = async () => {
  const { data: existing } = await supabase.from('profiles').select('id').limit(1);
  
  if (existing && existing.length > 0) {
    console.log('Profile already exists.');
    return;
  }

  // Auth 유저가 없을 경우 직접 입력이 어려우므로, 
  // 실제로는 가입 기능이 필요하지만 테스트를 위해 수동으로 profiles 테이블에 
  // RLS 정책을 잠시 끄고 데이터를 넣어야 할 수도 있습니다.
  // 이 스크립트는 가이드용입니다.
};

// seedProfile();
