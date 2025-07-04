
import { Search, Handshake, Rocket } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      icon: Search,
      step: "01",
      title: "Discover Opportunities",
      description: "Our AI bot analyzes your skills and preferences to find perfect project matches or ideal freelancers.",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: Handshake,
      step: "02", 
      title: "Connect & Collaborate",
      description: "Smart communication tools help you negotiate terms, set expectations, and establish working relationships.",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: Rocket,
      step: "03",
      title: "Deliver & Grow",
      description: "Complete projects with automated workflows, secure payments, and build your reputation for future opportunities.",
      color: "from-green-500 to-green-600"
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
            How FreelanceBot Works
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Three simple steps to transform your freelancing experience
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, index) => (
            <div key={index} className="relative group">
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <div className="flex items-center justify-between mb-6">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${step.color} flex items-center justify-center shadow-lg`}>
                    <step.icon className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-6xl font-bold text-gray-100 group-hover:text-gray-200 transition-colors">
                    {step.step}
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {step.title}
                </h3>
                
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
              
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-6 transform -translate-y-1/2">
                  <div className="w-12 h-0.5 bg-gradient-to-r from-gray-300 to-gray-400"></div>
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-gray-400 rounded-full"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
