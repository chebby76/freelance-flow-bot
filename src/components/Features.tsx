
import { Brain, MessageSquare, Shield, Zap, Clock, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Features = () => {
  const features = [
    {
      icon: Brain,
      title: "Smart Matching",
      description: "AI-powered algorithm matches freelancers with perfect projects based on skills, experience, and preferences.",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: MessageSquare,
      title: "Intelligent Communication",
      description: "Built-in chat assistant helps negotiate terms, clarify requirements, and maintain professional communication.",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: Clock,
      title: "Automated Workflows",
      description: "Streamline project management with automated milestones, progress tracking, and deadline reminders.",
      color: "from-green-500 to-green-600"
    },
    {
      icon: Shield,
      title: "Secure Payments",
      description: "Protected escrow system ensures secure transactions and timely payments for completed work.",
      color: "from-orange-500 to-orange-600"
    },
    {
      icon: TrendingUp,
      title: "Performance Analytics",
      description: "Track your success rate, earnings, and growth with detailed analytics and insights.",
      color: "from-pink-500 to-pink-600"
    },
    {
      icon: Zap,
      title: "Instant Notifications",
      description: "Stay updated with real-time notifications about new opportunities, messages, and project updates.",
      color: "from-indigo-500 to-indigo-600"
    }
  ];

  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
            Powerful Features for Modern Freelancing
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our AI-powered platform provides everything you need to succeed in the freelance economy
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-md hover:scale-105">
              <CardHeader className="pb-4">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl font-semibold text-gray-900">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
