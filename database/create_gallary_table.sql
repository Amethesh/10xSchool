-- Create the gallary table if it does not exist
create table if not exists gallary (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  images text[] default array[]::text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table gallary enable row level security;

-- Create a policy that allows everyone to read
create policy "Public can view gallary"
  on gallary
  for select
  to public
  using (true);

-- Optional: Insert some dummy data if the table is empty
insert into gallary (title, description, images)
select 'Campus Life', 'Validating the vibrational energy of our students.', array['https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80', 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&q=80']
where not exists (select 1 from gallary limit 1);

insert into gallary (title, description, images)
select 'Science Fair 2024', 'Innovations from our brightest minds.', array['https://images.unsplash.com/photo-1564981797816-1043664bf78d?w=800&q=80', 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&q=80', 'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?w=800&q=80']
where not exists (select 1 from gallary limit 1);
