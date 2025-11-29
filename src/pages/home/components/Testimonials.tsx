
import Card from '@/components/base/Card';

const testimonials = [
  {
    name: 'Priya Sharma',
    role: 'Software Engineer at Google',
    image: 'https://readdy.ai/api/search-image?query=Professional%20Indian%20woman%20software%20engineer%20smiling%20confidently%2C%20modern%20corporate%20headshot%2C%20clean%20background%2C%20professional%20lighting%2C%20business%20attire&width=150&height=150&seq=1&orientation=squarish',
    content: 'DCODE transformed my career completely. The personalized mentorship helped me land my dream job at Google. The practical approach and real-world projects made all the difference.',
    rating: 5
  },
  {
    name: 'Rahul Krishnan',
    role: 'Full Stack Developer at Microsoft',
    image: 'https://readdy.ai/api/search-image?query=Professional%20Indian%20man%20software%20developer%20confident%20smile%2C%20modern%20corporate%20headshot%2C%20clean%20background%2C%20professional%20lighting%2C%20business%20casual%20attire&width=150&height=150&seq=2&orientation=squarish',
    content: 'The mentor-guided learning at DCODE is exceptional. I went from zero programming knowledge to securing a position at Microsoft within 8 months. Highly recommend!',
    rating: 5
  },
  {
    name: 'Anita Reddy',
    role: 'Data Scientist at Amazon',
    image: 'https://readdy.ai/api/search-image?query=Professional%20Indian%20woman%20data%20scientist%20confident%20expression%2C%20modern%20corporate%20headshot%2C%20clean%20background%2C%20professional%20lighting%2C%20smart%20casual%20attire&width=150&height=150&seq=3&orientation=squarish',
    content: 'The curriculum is industry-relevant and the mentors are incredibly supportive. DCODE helped me transition from a non-tech background to a data science role at Amazon.',
    rating: 5
  }
];

export default function Testimonials() {
  return (
    <section className="py-12 sm:py-16 md:py-20 relative">
      {/* Background overlay for better contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-purple-900/80 to-slate-900/80"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        <div className="text-center mb-10 sm:mb-12 md:mb-16 px-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4 md:mb-6">
            Success Stories
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-100 max-w-3xl mx-auto leading-relaxed">
            Hear from our graduates who are now working at top tech companies
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={index} 
              variant="testimonial" 
              interactive
              className="bg-white/95 backdrop-blur-sm border border-white/20 shadow-xl"
            >
              <div className="flex items-center mb-4 sm:mb-6">
                <img 
                  src={testimonial.image} 
                  alt={testimonial.name}
                  className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full object-cover border-2 border-blue-200 mr-3 sm:mr-4 flex-shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 truncate">{testimonial.name}</h4>
                  <p className="text-xs sm:text-sm text-blue-600 font-medium truncate">{testimonial.role}</p>
                </div>
              </div>
              
              <div className="flex mb-3 sm:mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <i key={i} className="ri-star-fill text-yellow-500 text-base sm:text-lg"></i>
                ))}
              </div>
              
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed italic">
                "{testimonial.content}"
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
