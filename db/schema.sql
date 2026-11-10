-- solvd. database schema (PostgreSQL: Neon or Supabase)
-- Follows the draft data model in 01_PROJECT_CONTEXT.md, section 9.2.
-- Run this once in the Neon/Supabase SQL editor, then run seed.sql.

create table if not exists users (
  id           text primary key,
  name         text not null,
  email        text unique,
  avatar_url   text,
  role         text not null default 'user' check (role in ('user', 'developer')),
  skills       text[] not null default '{}',
  created_at   timestamptz not null default now()
);

create table if not exists niches (
  id     serial primary key,
  slug   text unique not null,          -- student, hosteller, shop_owner, ...
  label  text not null,
  icon   text
);

create table if not exists user_niches (
  user_id  text references users(id) on delete cascade,
  niche_id int  references niches(id) on delete cascade,
  primary key (user_id, niche_id)
);

create table if not exists apps (
  id              text primary key,      -- the slug, e.g. 'messmate'
  developer_id    text references users(id),
  name            text not null,
  tagline         text,
  description     text,
  icon_url        text,                  -- emoji in the demo
  preview_urls    text[] not null default '{}',
  repo_url        text,
  live_url        text,
  status          text not null default 'beta' check (status in ('beta', 'live', 'removed')),
  pricing_type    text not null default 'free' check (pricing_type in ('free', 'per_use', 'monthly')),
  price_inr       int  not null default 0,
  security_score  int,
  licence         text,
  last_updated    timestamptz default now(),
  users_count     int  not null default 0,
  rating_avg      numeric(2,1) not null default 0,
  verified        boolean not null default false,
  new_developer   boolean not null default false,
  keywords        text[] not null default '{}'
);

create table if not exists app_niches (
  app_id   text references apps(id) on delete cascade,
  niche_id int  references niches(id) on delete cascade,
  primary key (app_id, niche_id)
);

create table if not exists requests (
  id             text primary key,
  author_id      text references users(id),
  title          text not null,
  description    text,
  bounty_inr     int  not null default 0,
  status         text not null default 'open' check (status in ('open', 'building', 'live')),
  linked_app_id  text references apps(id),
  upvotes_count  int  not null default 0,
  created_at     timestamptz not null default now()
);

create table if not exists request_niches (
  request_id text references requests(id) on delete cascade,
  niche_id   int  references niches(id) on delete cascade,
  primary key (request_id, niche_id)
);

create table if not exists upvotes (
  request_id text references requests(id) on delete cascade,
  user_id    text references users(id) on delete cascade,
  primary key (request_id, user_id)
);

create table if not exists request_builders (   -- "3 devs building"
  request_id   text references requests(id) on delete cascade,
  developer_id text references users(id) on delete cascade,
  primary key (request_id, developer_id)
);

create table if not exists trials (
  id         serial primary key,
  user_id    text references users(id) on delete cascade,
  app_id     text references apps(id) on delete cascade,
  uses_left  int not null default 3,
  started_at timestamptz not null default now(),
  unique (user_id, app_id)
);

create table if not exists subscriptions (
  id         serial primary key,
  user_id    text references users(id) on delete cascade,
  app_id     text references apps(id) on delete cascade,
  plan       text not null,              -- free | per_use | monthly
  price_inr  int  not null default 0,
  status     text not null default 'active',
  started_at timestamptz not null default now()
);

create table if not exists reviews (
  id          serial primary key,
  app_id      text references apps(id) on delete cascade,
  user_id     text references users(id) on delete cascade,
  rating      int not null check (rating between 1 and 5),
  text        text,
  verified_use boolean not null default true,
  created_at  timestamptz not null default now()
);

create table if not exists feedback (
  id         serial primary key,
  app_id     text references apps(id) on delete cascade,
  user_id    text references users(id) on delete cascade,
  solved     boolean not null,
  reasons    text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists notifications (
  id         serial primary key,
  user_id    text references users(id) on delete cascade,
  type       text not null,
  title      text not null,
  body       text,
  link       text,
  read       boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists security_checks (
  id            serial primary key,
  app_id        text references apps(id) on delete cascade,
  deps_ok       boolean,
  secrets_ok    boolean,
  licence_found text,
  score         int,
  checked_at    timestamptz not null default now()
);
