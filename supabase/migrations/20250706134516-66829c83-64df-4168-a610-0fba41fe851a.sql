
-- Add applications table for project applications
CREATE TABLE public.applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  freelancer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  proposal TEXT,
  proposed_rate DECIMAL(10,2),
  estimated_duration INTEGER, -- in days
  status TEXT CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, freelancer_id)
);

-- Add messages table for communication
CREATE TABLE public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  recipient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add notifications table
CREATE TABLE public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT CHECK (type IN ('application', 'message', 'project_update', 'payment')) NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE,
  related_id UUID, -- can reference projects, applications, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add payments table
CREATE TABLE public.payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  payer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  recipient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  stripe_payment_intent_id TEXT,
  status TEXT CHECK (status IN ('pending', 'completed', 'failed', 'refunded')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for all new tables
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- RLS policies for applications
CREATE POLICY "Users can view applications for their projects or applications they made"
  ON public.applications FOR SELECT
  USING (
    freelancer_id = auth.uid() OR 
    project_id IN (SELECT id FROM public.projects WHERE client_id = auth.uid())
  );

CREATE POLICY "Freelancers can create applications" 
  ON public.applications FOR INSERT 
  WITH CHECK (freelancer_id = auth.uid());

CREATE POLICY "Users can update their own applications or applications to their projects"
  ON public.applications FOR UPDATE
  USING (
    freelancer_id = auth.uid() OR 
    project_id IN (SELECT id FROM public.projects WHERE client_id = auth.uid())
  );

-- RLS policies for messages
CREATE POLICY "Users can view messages they sent or received"
  ON public.messages FOR SELECT
  USING (sender_id = auth.uid() OR recipient_id = auth.uid());

CREATE POLICY "Users can send messages"
  ON public.messages FOR INSERT
  WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users can update messages they sent"
  ON public.messages FOR UPDATE
  USING (sender_id = auth.uid());

-- RLS policies for notifications
CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "System can create notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE
  USING (user_id = auth.uid());

-- RLS policies for payments
CREATE POLICY "Users can view payments they're involved in"
  ON public.payments FOR SELECT
  USING (payer_id = auth.uid() OR recipient_id = auth.uid());

CREATE POLICY "Users can create payments they're paying for"
  ON public.payments FOR INSERT
  WITH CHECK (payer_id = auth.uid());

CREATE POLICY "System can update payment status"
  ON public.payments FOR UPDATE
  USING (true);

-- Add indexes for better performance
CREATE INDEX idx_applications_project_id ON public.applications(project_id);
CREATE INDEX idx_applications_freelancer_id ON public.applications(freelancer_id);
CREATE INDEX idx_messages_project_id ON public.messages(project_id);
CREATE INDEX idx_messages_sender_recipient ON public.messages(sender_id, recipient_id);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX idx_payments_project_id ON public.payments(project_id);
