
import { ArrowRight, Play, Users, Zap, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 rounded-full text-blue-700 text-sm font-medium">
              <Zap className="h-4 w-4 mr-2" />
              AI-Powered Freelance Platform
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Connect, Collaborate, and 
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {" "}Create Amazing Projects
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 leading-relaxed">
              Our intelligent bot streamlines the entire freelancing process - from finding the perfect match 
              to managing projects and ensuring seamless collaboration between freelancers and clients.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-4"
                onClick={() => navigate('/auth')}
              >
                Start as Freelancer
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg px-8 py-4 border-2"
                onClick={() => navigate('/auth')}
              >
                <Play className="mr-2 h-5 w-5" />
                Hire Talent
              </Button>
            </div>
            
            <div className="flex items-center space-x-8 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-600" />
                <span>50K+ Freelancers</span>
              </div>
              <div className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-purple-600" />
                <span>98% Success Rate</span>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="relative bg-white rounded-2xl shadow-2xl p-8 transform rotate-2 hover:rotate-0 transition-transform duration-300">
              <div className="absolute -top-4 -left-4 w-8 h-8 bg-blue-500 rounded-full"></div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-purple-500 rounded-full"></div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Project Matches</h3>
                  <span className="text-green-500 text-sm font-medium">+23% this week</span>
                </div>
                <div className="space-y-3">
                  {[
                    { name: "Web Development", match: "95%" },
                    { name: "UI/UX Design", match: "89%" },
                    { name: "Content Writing", match: "92%" }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">{item.name}</span>
                      <span className="text-sm font-bold text-blue-600">{item.match}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full opacity-20"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
