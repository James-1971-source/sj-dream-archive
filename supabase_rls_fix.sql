-- [!] 수파베이스 대시보드의 SQL Editor에 아래 스크립트를 복사하여 실행해 주세요.
-- 이 스크립트는 프로필 테이블에 대한 보안 정책(RLS)을 설정하여, 사용자가 자신의 프로필을 생성하고 수정할 수 있도록 허용합니다.

-- 1. 프로필 테이블에 RLS 활성화 (이미 되어 있을 수 있습니다)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 2. 모든 사용자가 타인의 프로필을 읽을 수 있도록 허용 (갤러리 등에서 필요)
CREATE POLICY "Public profiles are viewable by everyone" 
ON profiles FOR SELECT 
USING (true);

-- 3. 인증된 사용자가 자신의 프로필을 생성(INSERT)할 수 있도록 허용
CREATE POLICY "Users can insert their own profile" 
ON profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- 4. 인증된 사용자가 자신의 프로필을 수정(UPDATE)할 수 있도록 허용
CREATE POLICY "Users can update their own profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = id);

-- 5. 인증된 사용자가 자신의 프로필을 저장/수정(UPSERT)할 수 있도록 허용
CREATE POLICY "Users can upsert their own profile" 
ON profiles FOR ALL 
USING (auth.uid() = id);

-- [참고] 저장소(Storage) 권한 설정 (프로필 사진 업로드 용)
-- Storage -> Buckets -> "works-storage"가 공개(Public)로 설정되어 있는지 확인해 주세요.
