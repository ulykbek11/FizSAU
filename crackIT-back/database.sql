-- Run this script in the Supabase SQL Editor to create the required tables

-- Tasks Table
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    mode TEXT DEFAULT 'simulation',
    starter_path TEXT,
    solution_diff TEXT,
    evaluation_criteria JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Team Leaders Table
CREATE TABLE IF NOT EXISTS public.team_leaders (
    id UUID PRIMARY KEY,
    first_name TEXT,
    last_name TEXT,
    company_name TEXT,
    email TEXT,
    invite_code TEXT
);

-- Employees Table
CREATE TABLE IF NOT EXISTS public.employees (
    id UUID PRIMARY KEY,
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    invite_code TEXT,
    team_leader_id UUID REFERENCES public.team_leaders(id) ON DELETE SET NULL
);

-- Submissions Table
CREATE TABLE IF NOT EXISTS public.submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
    user_id TEXT,
    user_diff TEXT,
    score INTEGER,
    feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Messages Table for Chat
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id UUID NOT NULL,
    receiver_id UUID NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_leaders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all access (since this is an MVP without complex auth)
CREATE POLICY "Allow all operations for tasks" ON public.tasks FOR ALL USING (true);
CREATE POLICY "Allow all operations for submissions" ON public.submissions FOR ALL USING (true);
CREATE POLICY "Allow all operations for team_leaders" ON public.team_leaders FOR ALL USING (true);
CREATE POLICY "Allow all operations for employees" ON public.employees FOR ALL USING (true);
CREATE POLICY "Allow all operations for messages" ON public.messages FOR ALL USING (true);
