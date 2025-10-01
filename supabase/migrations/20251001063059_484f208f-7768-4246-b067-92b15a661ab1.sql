-- Harden RLS policies with WITH CHECK clauses for insert/update safety

-- Drop existing policies to recreate with WITH CHECK
drop policy if exists "Users can view their own profile" on profiles;
drop policy if exists "Users can update their own profile" on profiles;
drop policy if exists "Admins can view all profiles" on profiles;

drop policy if exists "Anyone can view published pages" on pages;
drop policy if exists "Authors can view their own pages" on pages;
drop policy if exists "Authors can create pages" on pages;
drop policy if exists "Authors can update their own pages" on pages;
drop policy if exists "Authors can delete their own pages" on pages;
drop policy if exists "Admins can view all pages" on pages;
drop policy if exists "Admins can update all pages" on pages;
drop policy if exists "Admins can delete all pages" on pages;

-- Profiles policies with WITH CHECK
create policy "Users can view their own profile" on profiles
for select using (
  auth.uid() = id
  or exists(select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
);

create policy "Users can update their own profile" on profiles
for update using (
  auth.uid() = id
  or exists(select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
) with check (
  auth.uid() = id
  or exists(select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
);

create policy "Admins can view all profiles" on profiles
for select using (
  exists(select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- Pages policies with WITH CHECK
create policy "Anyone can view published pages" on pages
for select using (
  published = true
  or author_id = auth.uid()
  or exists(select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
);

create policy "Authors can view their own pages" on pages
for select using (
  auth.uid() = author_id
  or exists(select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
);

create policy "Authors can create pages" on pages
for insert with check (
  auth.uid() = author_id
  or exists(select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
);

create policy "Authors can update their own pages" on pages
for update using (
  auth.uid() = author_id
  or exists(select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
) with check (
  auth.uid() = author_id
  or exists(select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
);

create policy "Authors can delete their own pages" on pages
for delete using (
  auth.uid() = author_id
  or exists(select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
);

create policy "Admins can view all pages" on pages
for select using (
  exists(select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
);

create policy "Admins can update all pages" on pages
for update using (
  exists(select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
) with check (
  exists(select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
);

create policy "Admins can delete all pages" on pages
for delete using (
  exists(select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
);