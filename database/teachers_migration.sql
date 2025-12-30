-- Create teachers table
create table if not exists public.teachers (
  id uuid references auth.users (id) on delete cascade primary key,
  teacher_id text unique not null,
  full_name text not null,
  email text not null,
  created_at timestamp with time zone default timezone ('utc'::text, now()) not null
);

-- Enable RLS
alter table public.teachers enable row level security;

-- Policies for teachers
-- (Assuming admins table exists and has RLS set up, but for now we trust service role in actions)
-- But for frontend querying:
create policy "Admins can do everything on teachers"
  on public.teachers
  for all
  using (
    exists (
      select 1 from public.admins where id = auth.uid()
    )
  );

create policy "Teachers can view own profile"
  on public.teachers
  for select
  using (
    auth.uid() = id
  );

-- Update students table to link to teachers
alter table public.students 
add column if not exists teacher_id uuid references public.teachers(id);

-- Update students policies to allow assigned teacher to view/edit
create policy "Teachers can view assigned students"
  on public.students
  for select
  using (
    teacher_id = auth.uid() 
    or 
    exists ( select 1 from public.admins where id = auth.uid() ) -- Admins can see all
    or
    auth.uid() = id -- Students can see themselves
  );

-- Allow teachers to update their students (e.g. grades? or just details?)
-- User said "view and edit those students"
create policy "Teachers can update assigned students"
  on public.students
  for update
  using (
    teacher_id = auth.uid()
  );

-- RPC to generate teacher ID? Or just let admin type it?
-- Let's create an RPC for auto-generating teacher IDs for consistency like students
create or replace function public.generate_new_teacher_id()
returns text
language plpgsql
as $$
declare
  new_id text;
  count_val integer;
begin
  -- Example format: T-{YYYY}-{SEQUENCE} or just T-{SEQUENCE}
  -- Let's stick to T-1000, T-1001 etc.
  select count(*) into count_val from public.teachers;
  new_id := 'T-' || (1000 + count_val + 1)::text;
  
  -- Check uniqueness just in case (simple loop)
  while exists (select 1 from public.teachers where teacher_id = new_id) loop
    count_val := count_val + 1;
    new_id := 'T-' || (1000 + count_val + 1)::text;
  end loop;
  
  return new_id;
end;
$$;
