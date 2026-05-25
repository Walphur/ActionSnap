-- Si storage.sql da error, probá SOLO esto:
insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do update set public = true;

select id, name, public from storage.buckets where id = 'photos';
