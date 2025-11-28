
import Card from '@/components/base/Card';

const features = [
  {
    icon: 'ri-code-s-slash-line',
    title: 'Expert-Led Courses',
    description: 'Learn from industry professionals with years of real-world experience in top tech companies.',
    color: 'text-brand-primary'
  },
  {
    icon: 'ri-user-star-line',
    title: 'Personal Mentorship',
    description: 'Get one-on-one guidance from dedicated mentors who care about your success and career growth.',
    color: 'text-brand-accent'
  },
  {
    icon: 'ri-trophy-line',
    title: 'Job Placement',
    description: 'Our career services team helps you land your dream job with interview prep and industry connections.',
    color: 'text-brand-primary'
  },
  {
    icon: 'ri-team-line',
    title: 'Community Support',
    description: 'Join a vibrant community of learners, share projects, and collaborate on exciting challenges.',
    color: 'text-brand-accent'
  },
  {
    icon: 'ri-certificate-line',
    title: 'Industry Certifications',
    description: 'Earn recognized certifications that validate your skills and boost your professional credibility.',
    color: 'text-brand-primary'
  },
  {
    icon: 'ri-rocket-line',
    title: 'Career Acceleration',
    description: 'Fast-track your career with intensive programs designed to make you job-ready in months.',
    color: 'text-brand-accent'
  }
];

export default function Features() {
  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="heading-primary text-brand-primary mb-4">
            Why Choose DCODE?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We combine cutting-edge curriculum with personalized support to accelerate your coding journey
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              variant="feature"
              className="text-center group cursor-pointer"
              hover
            >
              <div className={`w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center group-hover:from-purple-100 group-hover:to-orange-100 transition-all duration-300`}>
                <i className={`${feature.icon} text-2xl ${feature.color} group-hover:scale-110 transition-transform duration-300`}></i>
              </div>
              <h3 className="heading-tertiary text-gray-900 mb-4 group-hover:text-brand-primary transition-colors duration-300">
                {feature.title}
              </h3>
              <p className="text-body text-gray-600 group-hover:text-gray-700 transition-colors duration-300">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-purple-600 to-orange-500 rounded-3xl p-12 text-white">
            <h3 className="text-3xl font-bold mb-4">Ready to Transform Your Career?</h3>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of successful developers who started their journey with DCODE
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="btn-brand-secondary bg-white/20 hover:bg-white/30 text-white border-white/30 px-8 py-3 rounded-lg font-semibold transition-all duration-300 hover:transform hover:scale-105">
                View Success Stories
                <i className="ri-arrow-right-line ml-2"></i>
              </button>
              <button className="bg-white text-purple-600 hover:bg-gray-50 px-8 py-3 rounded-lg font-semibold transition-all duration-300 hover:transform hover:scale-105">
                Start Free Trial
                <i className="ri-play-circle-line ml-2"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
