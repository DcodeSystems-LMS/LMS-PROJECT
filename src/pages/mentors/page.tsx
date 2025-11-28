
import React, { useState } from 'react';
import Card from '@/components/base/Card';
import Button from '@/components/base/Button';

const MentorsPage: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedLanguage, setSelectedLanguage] = useState('all');

  const mentors = [
    {
      id: 1,
      name: 'Sarah Johnson',
      expertise: ['React', 'JavaScript', 'Node.js'],
      experience: '8+ years',
      rating: 4.9,
      reviews: 127,
      students: 250,
      languages: ['English', 'Spanish'],
      hourlyRate: 75,
      image: 'https://readdy.ai/api/search-image?query=Professional%20female%20software%20engineer%20mentor%20smiling%20confidently%2C%20modern%20tech%20workspace%20background%2C%20clean%20lighting%2C%20business%20casual%20attire%2C%20approachable%20expression&width=300&height=300&seq=mentor1&orientation=squarish',
      bio: 'Senior Frontend Engineer at Google with expertise in React ecosystem. Passionate about helping students build production-ready applications.',
      availability: 'Available'
    },
    {
      id: 2,
      name: 'Mike Chen',
      expertise: ['Python', 'Django', 'Machine Learning'],
      experience: '10+ years',
      rating: 4.8,
      reviews: 89,
      students: 180,
      languages: ['English', 'Mandarin'],
      hourlyRate: 85,
      image: 'https://readdy.ai/api/search-image?query=Professional%20Asian%20male%20software%20engineer%20mentor%20confident%20smile%2C%20modern%20office%20background%2C%20clean%20lighting%2C%20business%20attire%2C%20friendly%20demeanor&width=300&height=300&seq=mentor2&orientation=squarish',
      bio: 'Full Stack Engineer specializing in Python and AI/ML. Former lead developer at Microsoft with a passion for data science education.',
      availability: 'Available'
    },
    {
      id: 3,
      name: 'Emily Rodriguez',
      expertise: ['Java', 'Spring Boot', 'AWS'],
      experience: '6+ years',
      rating: 4.9,
      reviews: 156,
      students: 320,
      languages: ['English', 'Spanish'],
      hourlyRate: 70,
      image: 'https://readdy.ai/api/search-image?query=Professional%20Hispanic%20female%20software%20engineer%20mentor%20warm%20smile%2C%20modern%20tech%20office%20background%2C%20clean%20lighting%2C%20professional%20attire%2C%20welcoming%20expression&width=300&height=300&seq=mentor3&orientation=squarish',
      bio: 'Backend specialist with deep expertise in Java ecosystem and cloud architecture. Currently working as Tech Lead at Amazon.',
      availability: 'Busy'
    },
    {
      id: 4,
      name: 'David Kumar',
      expertise: ['React Native', 'Flutter', 'Mobile Dev'],
      experience: '7+ years',
      rating: 4.7,
      reviews: 98,
      students: 195,
      languages: ['English', 'Hindi'],
      hourlyRate: 65,
      image: 'https://readdy.ai/api/search-image?query=Professional%20Indian%20male%20mobile%20app%20developer%20mentor%20confident%20expression%2C%20modern%20tech%20workspace%2C%20clean%20lighting%2C%20casual%20business%20attire%2C%20approachable%20demeanor&width=300&height=300&seq=mentor4&orientation=squarish',
      bio: 'Mobile app development expert with published apps on both iOS and Android. Specialized in cross-platform development.',
      availability: 'Available'
    },
    {
      id: 5,
      name: 'Lisa Park',
      expertise: ['UI/UX Design', 'Figma', 'Design Systems'],
      experience: '9+ years',
      rating: 4.9,
      reviews: 203,
      students: 410,
      languages: ['English', 'Korean'],
      hourlyRate: 80,
      image: 'https://readdy.ai/api/search-image?query=Professional%20Asian%20female%20UX%20designer%20mentor%20creative%20smile%2C%20modern%20design%20studio%20background%2C%20clean%20lighting%2C%20stylish%20attire%2C%20artistic%20workspace&width=300&height=300&seq=mentor5&orientation=squarish',
      bio: 'Lead UX Designer at Adobe with extensive experience in creating user-centered design solutions for major tech companies.',
      availability: 'Available'
    },
    {
      id: 6,
      name: 'James Wilson',
      expertise: ['DevOps', 'Kubernetes', 'Docker'],
      experience: '12+ years',
      rating: 4.8,
      reviews: 145,
      students: 275,
      languages: ['English'],
      hourlyRate: 90,
      image: 'https://readdy.ai/api/search-image?query=Professional%20male%20DevOps%20engineer%20mentor%20confident%20expression%2C%20server%20room%20background%2C%20clean%20lighting%2C%20technical%20attire%2C%20expert%20demeanor&width=300&height=300&seq=mentor6&orientation=squarish',
      bio: 'DevOps architect with expertise in cloud infrastructure and containerization. Currently working as Principal Engineer at Netflix.',
      availability: 'Available'
    }
  ];

  const expertiseAreas = ['All', 'Frontend', 'Backend', 'Mobile', 'DevOps', 'Design', 'Data Science'];
  const languages = ['All', 'English', 'Spanish', 'Hindi', 'Mandarin', 'Korean'];

  const filteredMentors = mentors.filter(mentor => {
    const expertiseMatch = selectedFilter === 'all' || 
      mentor.expertise.some(skill => 
        selectedFilter === 'frontend' && ['React', 'JavaScript', 'UI/UX Design'].some(tech => skill.includes(tech)) ||
        selectedFilter === 'backend' && ['Python', 'Java', 'Node.js', 'Django', 'Spring Boot'].some(tech => skill.includes(tech)) ||
        selectedFilter === 'mobile' && ['React Native', 'Flutter', 'Mobile Dev'].some(tech => skill.includes(tech)) ||
        selectedFilter === 'devops' && ['DevOps', 'AWS', 'Kubernetes', 'Docker'].some(tech => skill.includes(tech)) ||
        selectedFilter === 'design' && ['UI/UX Design', 'Figma', 'Design Systems'].some(tech => skill.includes(tech)) ||
        selectedFilter === 'data science' && ['Machine Learning', 'Python'].some(tech => skill.includes(tech))
      );
    
    const languageMatch = selectedLanguage === 'all' || 
      mentor.languages.some(lang => lang.toLowerCase().includes(selectedLanguage.toLowerCase()));
    
    return expertiseMatch && languageMatch;
  });

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Meet Our Expert Mentors</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Connect with industry professionals who will guide you through your coding journey
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Filter by Expertise
              </label>
              <div className="flex flex-wrap gap-2">
                {expertiseAreas.map((area) => (
                  <button
                    key={area}
                    onClick={() => setSelectedFilter(area.toLowerCase())}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                      selectedFilter === area.toLowerCase()
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {area}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Filter by Language
              </label>
              <div className="flex flex-wrap gap-2">
                {languages.map((language) => (
                  <button
                    key={language}
                    onClick={() => setSelectedLanguage(language.toLowerCase())}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                      selectedLanguage === language.toLowerCase()
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {language}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Mentors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredMentors.map((mentor) => (
            <Card key={mentor.id} className="hover:shadow-xl transition-shadow duration-300">
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <img
                    src={mentor.image}
                    alt={mentor.name}
                    className="w-24 h-24 rounded-full object-cover mx-auto mb-4 border-4 border-white shadow-lg"
                  />
                  <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white ${
                    mentor.availability === 'Available' ? 'bg-green-500' : 'bg-yellow-500'
                  }`}></div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-1">{mentor.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{mentor.experience} Experience</p>
                <div className="flex items-center justify-center mb-3">
                  <div className="flex items-center">
                    <i className="ri-star-fill text-yellow-500 mr-1"></i>
                    <span className="font-medium text-gray-900">{mentor.rating}</span>
                    <span className="text-sm text-gray-500 ml-1">({mentor.reviews} reviews)</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Expertise</h4>
                  <div className="flex flex-wrap gap-1">
                    {mentor.expertise.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Languages</h4>
                  <div className="flex flex-wrap gap-1">
                    {mentor.languages.map((language, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-purple-100 text-purple-800 text-xs rounded-full"
                      >
                        {language}
                      </span>
                    ))}
                  </div>
                </div>

                <p className="text-sm text-gray-600 leading-relaxed">{mentor.bio}</p>

                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span className="flex items-center">
                    <i className="ri-group-line mr-1"></i>
                    {mentor.students} students
                  </span>
                  <span className="font-semibold text-gray-900">
                    ${mentor.hourlyRate}/hour
                  </span>
                </div>

                <div className="pt-4 space-y-2">
                  <Button 
                    fullWidth 
                    className={mentor.availability === 'Available' ? '' : 'opacity-75'}
                    disabled={mentor.availability !== 'Available'}
                  >
                    <i className="ri-calendar-line mr-2"></i>
                    {mentor.availability === 'Available' ? 'Book Session' : 'Currently Busy'}
                  </Button>
                  <Button variant="outline" fullWidth size="sm">
                    <i className="ri-user-line mr-2"></i>
                    View Profile
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredMentors.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-search-line text-2xl text-gray-400"></i>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No mentors found</h3>
            <p className="text-gray-600">
              Try adjusting your filters to find the perfect mentor for you.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MentorsPage;
