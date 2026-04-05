-- 1. profiles 테이블에 email 컬럼 추가
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- 2. 기존 가입된 사용자의 이메일 정보를 auth.users에서 가져와서 업데이트
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id;

-- 3. 향후 새로 가입하는 사용자의 이메일도 자동으로 저장되도록 트리거 함수 수정
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name, role, status)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', 'USER', 'ACTIVE');
  return new;
end;
$$ language plpgsql security definer;
