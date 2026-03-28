-- pgvector 확장 활성화
create extension if not exists vector;

-- 사용자 프로필
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  nickname text,
  plan text default 'free',
  created_at timestamptz default now()
);

-- 꿈 테이블
create table dreams (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  title text,
  content text not null,
  interpretation text,
  emotions text[],
  keywords text[],
  image_url text,
  visibility text default 'private',
  embedding vector(1536),
  created_at timestamptz default now()
);

-- 꿈 연결 테이블
create table dream_connections (
  id uuid default gen_random_uuid() primary key,
  dream_a uuid references dreams(id) on delete cascade,
  dream_b uuid references dreams(id) on delete cascade,
  similarity float,
  created_at timestamptz default now()
);

-- pgvector 인덱스
create index on dreams
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- 유사 꿈 검색 함수
create or replace function match_dreams(
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  exclude_id uuid
)
returns table(id uuid, similarity float)
language sql stable
as $$
  select
    dreams.id,
    1 - (dreams.embedding <=> query_embedding) as similarity
  from dreams
  where
    dreams.id != exclude_id
    and dreams.visibility != 'private'
    and 1 - (dreams.embedding <=> query_embedding) > match_threshold
  order by similarity desc
  limit match_count;
$$;

-- RLS 설정
alter table profiles enable row level security;
alter table dreams enable row level security;
alter table dream_connections enable row level security;

create policy "본인 프로필 관리" on profiles
  for all using (auth.uid() = id);

create policy "본인 꿈 관리" on dreams
  for all using (auth.uid() = user_id);

create policy "공개 꿈 읽기" on dreams
  for select using (visibility != 'private');

create policy "연결 읽기" on dream_connections
  for select using (true);
