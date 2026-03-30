-- 1. profiles 테이블에 권한(role) 컬럼 추가
-- 기본값은 'USER'이며, 관리자는 'ADMIN'으로 설정합니다.
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'USER';

-- 2. 기존 RLS 정책을 관리자 권한을 포함하도록 보완

-- 작품(works) 테이블: 관리자는 모든 작품을 삭제(DELETE)할 수 있음
DROP POLICY IF EXISTS "Admins can delete any work" ON public.works;
CREATE POLICY "Admins can delete any work" 
ON public.works
FOR DELETE 
USING (
  auth.uid() IN (
    SELECT id FROM public.profiles WHERE role = 'ADMIN'
  )
);

-- 작품(works) 테이블: 관리자는 모든 작품을 수정(UPDATE)할 수 있음
DROP POLICY IF EXISTS "Admins can update any work" ON public.works;
CREATE POLICY "Admins can update any work" 
ON public.works
FOR UPDATE 
USING (
  auth.uid() IN (
    SELECT id FROM public.profiles WHERE role = 'ADMIN'
  )
);

-- 사용자(profiles) 테이블: 관리자는 다른 사용자의 프로필 정보를 볼 수 있음 (이미 공개됨)
-- 관리자 전용 정책 추가 가능 (생략)


-- [사용 가이드]
-- 웹페이지에서 회원가입한 특정 이메일 계정을 관리자로 승격시키려면 
-- 아래 쿼리의 '이메일주소' 부분을 수정해서 한 번 더 실행해 주세요.
-- 3. 회원 정지(ban) 기능을 위한 컬럼 추가
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'ACTIVE'; -- ACTIVE, BANNED, INACTIVE

-- 4. 관리자가 모든 프로필을 삭제(DELETE)할 수 있도록 정책 추가 (강제 탈퇴 기능용)
DROP POLICY IF EXISTS "Admins can delete any profile" ON public.profiles;
CREATE POLICY "Admins can delete any profile" 
ON public.profiles
FOR DELETE 
USING (
  auth.uid() IN (
    SELECT id FROM public.profiles WHERE role = 'ADMIN'
  )
);
