
-- Create a profiles table for additional user information
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  user_type TEXT CHECK (user_type IN ('freelancer', 'client')) NOT NULL,
  skills TEXT[],
  hourly_rate DECIMAL(10,2),
  bio TEXT,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Create a function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create projects table for freelance work
CREATE TABLE public.projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  budget DECIMAL(10,2),
  status TEXT CHECK (status IN ('draft', 'open', 'in_progress', 'completed', 'cancelled')) DEFAULT 'draft',
  client_id UUID REFERENCES public.profiles(id) NOT NULL,
  freelancer_id UUID REFERENCES public.profiles(id),
  skills_required TEXT[],
  deadline DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for projects
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Create policies for projects
CREATE POLICY "Users can view projects they're involved in"
  ON public.projects
  FOR SELECT
  USING (
    auth.uid() = client_id OR 
    auth.uid() = freelancer_id OR 
    status = 'open'
  );

CREATE POLICY "Clients can create projects"
  ON public.projects
  FOR INSERT
  WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Clients and freelancers can update their projects"
  ON public.projects
  FOR UPDATE
  USING (auth.uid() = client_id OR auth.uid() = freelancer_id);
