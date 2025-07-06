
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bot, LogOut, Plus, Users, Briefcase, DollarSign, MessageCircle, Bell } from 'lucide-react';
import { toast } from 'sonner';
import NotificationCenter from '@/components/NotificationCenter';
import MessageCenter from '@/components/MessageCenter';
import PaymentForm from '@/components/PaymentForm';

interface Profile {
  id: string;
  email: string;
  full_name: string;
  user_type: string;
  avatar_url?: string;
  skills?: string[];
  hourly_rate?: number;
  bio?: string;
  location?: string;
}

interface Project {
  id: string;
  title: string;
  description: string;
  budget: number;
  status: string;
  client_id: string;
  freelancer_id?: string;
  skills_required?: string[];
  deadline?: string;
  created_at: string;
}

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (!session) {
          navigate('/auth');
        } else {
          // Fetch user profile and projects when authenticated
          setTimeout(() => {
            fetchProfile(session.user.id);
            fetchProjects();
            fetchApplications();
          }, 0);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session) {
        navigate('/auth');
      } else {
        fetchProfile(session.user.id);
        fetchProjects();
        fetchApplications();
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching projects:', error);
      } else {
        setProjects(data || []);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchApplications = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          projects (title, budget),
          profiles!applications_freelancer_id_fkey (full_name)
        `)
        .or(`freelancer_id.eq.${user.id},project_id.in.(${projects.filter(p => p.client_id === user.id).map(p => p.id).join(',') || 'null'})`);

      if (error) {
        console.error('Error fetching applications:', error);
      } else {
        setApplications(data || []);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error('Error signing out');
    } else {
      toast.success('Signed out successfully');
      navigate('/');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Bot className="h-8 w-8 text-blue-600 mx-auto mb-4 animate-spin" />
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  const openProjects = projects.filter(p => p.status === 'open');
  const myProjects = projects.filter(p => 
    p.client_id === user.id || p.freelancer_id === user.id
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Bot className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                FreelanceBot
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={() => navigate('/projects')}>
                Browse Projects
              </Button>
              <span className="text-sm text-gray-600">
                Welcome, {profile.full_name}
              </span>
              <Badge variant={profile.user_type === 'freelancer' ? 'default' : 'secondary'}>
                {profile.user_type}
              </Badge>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">
            {profile.user_type === 'freelancer' 
              ? 'Find amazing projects and grow your business' 
              : 'Post projects and find talented freelancers'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {profile.user_type === 'freelancer' ? 'Available Projects' : 'Active Projects'}
              </CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{openProjects.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Projects</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{myProjects.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Applications</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{applications.length}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="projects" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="messages">
              <MessageCircle className="h-4 w-4 mr-2" />
              Messages
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
          </TabsList>

          <TabsContent value="projects" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {profile.user_type === 'freelancer' ? 'Available Projects' : 'My Posted Projects'}
                    <Button size="sm" onClick={() => navigate('/projects')}>
                      <Plus className="h-4 w-4 mr-2" />
                      {profile.user_type === 'freelancer' ? 'Browse All' : 'Post Project'}
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    {profile.user_type === 'freelancer' 
                      ? 'Find projects that match your skills' 
                      : 'Manage your posted projects'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {openProjects.slice(0, 3).map((project) => (
                    <div key={project.id} className="p-4 border rounded-lg">
                      <h4 className="font-semibold">{project.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                      <div className="flex justify-between items-center mt-3">
                        <Badge variant="outline">{project.status}</Badge>
                        <span className="text-sm font-medium">${project.budget}</span>
                      </div>
                    </div>
                  ))}
                  {openProjects.length === 0 && (
                    <p className="text-center text-gray-500 py-8">
                      No projects available at the moment
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Applications</CardTitle>
                  <CardDescription>Your latest project applications</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {applications.slice(0, 3).map((app) => (
                      <div key={app.id} className="p-4 bg-blue-50 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{app.projects?.title}</h4>
                            <p className="text-sm text-gray-600">
                              {profile.user_type === 'client' ? 
                                `Application from ${app.profiles?.full_name}` : 
                                `Your application - $${app.proposed_rate}`}
                            </p>
                          </div>
                          <Badge variant={
                            app.status === 'pending' ? 'secondary' : 
                            app.status === 'accepted' ? 'default' : 'destructive'
                          }>
                            {app.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    {applications.length === 0 && (
                      <p className="text-center text-gray-500 py-8">
                        No applications yet
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="messages">
            <NotificationCenter />
          </TabsContent>

          <TabsContent value="notifications">
            <NotificationCenter />
          </TabsContent>

          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle>Payment Center</CardTitle>
                <CardDescription>Manage your payments and invoices</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Payment integration ready</p>
                  <p className="text-sm text-gray-400">Process payments securely with Stripe</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
