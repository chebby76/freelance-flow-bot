
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Search, Filter, DollarSign, Calendar, MapPin, Bot, Send } from 'lucide-react';
import { toast } from 'sonner';

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
  profiles?: {
    full_name: string;
    location?: string;
  };
}

const Projects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [budgetRange, setBudgetRange] = useState<[number, number]>([0, 10000]);
  const [loading, setLoading] = useState(true);
  const [applicationData, setApplicationData] = useState({
    proposal: '',
    proposedRate: '',
    estimatedDuration: ''
  });
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchProjects();
  }, [user, navigate]);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          profiles!projects_client_id_fkey (
            full_name,
            location
          )
        `)
        .eq('status', 'open')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching projects:', error);
        toast.error('Error loading projects');
      } else {
        setProjects(data || []);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Error loading projects');
    } finally {
      setLoading(false);
    }
  };

  const generateAIProposal = async (project: Project) => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-proposal', {
        body: {
          projectTitle: project.title,
          projectDescription: project.description,
          skills: project.skills_required,
          budget: project.budget
        }
      });

      if (error) throw error;

      setApplicationData(prev => ({
        ...prev,
        proposal: data.proposal
      }));
      toast.success('AI proposal generated!');
    } catch (error) {
      console.error('Error generating AI proposal:', error);
      toast.error('Failed to generate AI proposal');
    }
  };

  const submitApplication = async (projectId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('applications')
        .insert({
          project_id: projectId,
          freelancer_id: user.id,
          proposal: applicationData.proposal,
          proposed_rate: parseFloat(applicationData.proposedRate),
          estimated_duration: parseInt(applicationData.estimatedDuration)
        });

      if (error) throw error;

      // Send notification to client
      await supabase.functions.invoke('send-notification', {
        body: {
          type: 'application',
          projectId,
          message: 'New application received for your project'
        }
      });

      toast.success('Application submitted successfully!');
      setApplicationData({ proposal: '', proposedRate: '', estimatedDuration: '' });
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error('Failed to submit application');
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSkills = selectedSkills.length === 0 || 
                         selectedSkills.some(skill => project.skills_required?.includes(skill));
    const matchesBudget = project.budget >= budgetRange[0] && project.budget <= budgetRange[1];
    
    return matchesSearch && matchesSkills && matchesBudget;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Bot className="h-8 w-8 text-blue-600 mx-auto mb-4 animate-spin" />
          <p>Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Button variant="ghost" onClick={() => navigate('/dashboard')}>
              ← Back to Dashboard
            </Button>
            <h1 className="text-xl font-semibold">Browse Projects</h1>
            <div></div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>

        <div className="grid gap-6">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{project.title}</CardTitle>
                    <CardDescription className="mt-2">
                      Posted by {project.profiles?.full_name || 'Anonymous'}
                      {project.profiles?.location && (
                        <span className="inline-flex items-center ml-2">
                          <MapPin className="h-3 w-3 mr-1" />
                          {project.profiles.location}
                        </span>
                      )}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    ${project.budget}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{project.description}</p>
                
                {project.skills_required && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {project.skills_required.map((skill, index) => (
                        <Badge key={index} variant="secondary">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-1" />
                      Budget: ${project.budget}
                    </span>
                    {project.deadline && (
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        Due: {new Date(project.deadline).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>Apply Now</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Apply to Project</DialogTitle>
                        <DialogDescription>
                          Submit your proposal for "{project.title}"
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="proposedRate">Proposed Rate ($)</Label>
                          <Input
                            id="proposedRate"
                            type="number"
                            value={applicationData.proposedRate}
                            onChange={(e) => setApplicationData(prev => ({
                              ...prev,
                              proposedRate: e.target.value
                            }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="estimatedDuration">Estimated Duration (days)</Label>
                          <Input
                            id="estimatedDuration"
                            type="number"
                            value={applicationData.estimatedDuration}
                            onChange={(e) => setApplicationData(prev => ({
                              ...prev,
                              estimatedDuration: e.target.value
                            }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="proposal">Proposal</Label>
                          <Textarea
                            id="proposal"
                            placeholder="Describe your approach to this project..."
                            value={applicationData.proposal}
                            onChange={(e) => setApplicationData(prev => ({
                              ...prev,
                              proposal: e.target.value
                            }))}
                            rows={4}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={() => generateAIProposal(project)}
                          >
                            <Bot className="h-4 w-4 mr-2" />
                            Generate AI Proposal
                          </Button>
                        </div>
                        <Button
                          className="w-full"
                          onClick={() => submitApplication(project.id)}
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Submit Application
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {filteredProjects.length === 0 && (
            <div className="text-center py-12">
              <Bot className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
              <p className="text-gray-500">Try adjusting your search criteria.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Projects;
