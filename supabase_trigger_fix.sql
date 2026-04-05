-- 1. 사용자 가입 시 profiles 테이블에 프로필을 자동 생성하는 함수
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, role, status)
  values (new.id, new.raw_user_meta_data->>'full_name', 'USER', 'ACTIVE');
  return new;
end;
$$ language plpgsql security definer;

-- 2. 새 사용자가 가입할 때마다 함수를 실행하도록 auth.users 테이블에 트리거 추가
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 3. (선택) 이미 가입했지만 profiles 테이블에 레코드가 생성되지 않은 기존 사용자 복구
insert into public.profiles (id, name, role, status)
select id, raw_user_meta_data->>'full_name', 'USER', 'ACTIVE'
from auth.users
where id not in (select id from public.profiles);
