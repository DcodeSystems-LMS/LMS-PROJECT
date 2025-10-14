
import Header from '@/components/feature/Header';
import Footer from '@/components/feature/Footer';
import Card from '@/components/base/Card';
import Button from '@/components/base/Button';
import Modal from '@/components/base/Modal';

export default function CoursesPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedCourse, setSelectedCourse] = useState<any>(null);

  const categories = [
    { id: 'all', label: 'All Courses' },
    { id: 'frontend', label: 'Frontend' },
    { id: 'backend', label: 'Backend' },
    { id: 'fullstack', label: 'Full Stack' },
    { id: 'mobile', label: 'Mobile' },
    { id: 'data-science', label: 'Data Science' },
    { id: 'devops', label: 'DevOps' }
  ];

  const levels = [
    { id: 'all', label: 'All Levels' },
    { id: 'beginner', label: 'Beginner' },
    { id: 'intermediate', label: 'Intermediate' },
    { id: 'advanced', label: 'Advanced' }
  ];

  const courses = [
    {
      id: 1,
      title: 'Complete React Development',
      description: 'Master React from basics to advanced concepts including hooks, context, and state management.',
      category: 'frontend',
      level: 'intermediate',
      price: 'Free',
      duration: '40 hours',
      students: '15,420',
      rating: 4.8,
      image: 'https://readdy.ai/api/search-image?query=React%20development%20course%20cover%20with%20modern%20JavaScript%20React%20components%20coding%20interface%20clean%20professional%20design%20bright%20background&width=400&height=250&seq=reactcourse&orientation=landscape',
      instructor: 'Sarah Johnson',
      syllabus: ['React Fundamentals', 'Components & Props', 'State & Lifecycle', 'Hooks', 'Context API', 'Testing'],
      preview: 'https://www.youtube.com/embed/dGcsHMXbSOA'
    },
    {
      id: 2,
      title: 'Node.js Backend Mastery',
      description: 'Build scalable backend applications with Node.js, Express, and MongoDB.',
      category: 'backend',
      level: 'intermediate',
      price: '$99',
      duration: '35 hours',
      students: '12,800',
      rating: 4.9,
      image: 'https://readdy.ai/api/search-image?query=Node.js%20backend%20development%20course%20cover%20with%20server%20code%20database%20connections%20API%20endpoints%20clean%20professional%20design%20bright%20background&width=400&height=250&seq=nodecourse&orientation=landscape',
      instructor: 'Michael Chen',
      syllabus: ['Node.js Basics', 'Express Framework', 'Database Integration', 'Authentication', 'API Design', 'Deployment'],
      preview: 'https://www.youtube.com/embed/dGcsHMXbSOA'
    },
    {
      id: 3,
      title: 'Full Stack Web Development',
      description: 'Complete web development bootcamp covering frontend, backend, and deployment.',
      category: 'fullstack',
      level: 'beginner',
      price: '$199',
      duration: '80 hours',
      students: '25,600',
      rating: 4.7,
      image: 'https://readdy.ai/api/search-image?query=Full%20stack%20web%20development%20course%20cover%20with%20frontend%20backend%20code%20databases%20deployment%20pipeline%20clean%20professional%20design%20bright%20background&width=400&height=250&seq=fullstackcourse&orientation=landscape',
      instructor: 'Emily Rodriguez',
      syllabus: ['HTML/CSS/JS', 'React Frontend', 'Node.js Backend', 'Database Design', 'Deployment', 'Project Portfolio'],
      preview: 'https://www.youtube.com/embed/dGcsHMXbSOA'
    },
    {
      id: 4,
      title: 'Python Data Science',
      description: 'Learn data analysis, visualization, and machine learning with Python.',
      category: 'data-science',
      level: 'intermediate',
      price: '$149',
      duration: '50 hours',
      students: '18,900',
      rating: 4.8,
      image: 'https://readdy.ai/api/search-image?query=Python%20data%20science%20course%20cover%20with%20data%20analysis%20charts%20graphs%20machine%20learning%20algorithms%20clean%20professional%20design%20bright%20background&width=400&height=250&seq=pythoncourse&orientation=landscape',
      instructor: 'Dr. Alex Kumar',
      syllabus: ['Python Basics', 'NumPy & Pandas', 'Data Visualization', 'Statistics', 'Machine Learning', 'Real Projects'],
      preview: 'https://www.youtube.com/embed/dGcsHMXbSOA'
    },
    {
      id: 5,
      title: 'React Native Mobile Apps',
      description: 'Build cross-platform mobile applications using React Native.',
      category: 'mobile',
      level: 'intermediate',
      price: '$129',
      duration: '45 hours',
      students: '9,750',
      rating: 4.6,
      image: 'https://readdy.ai/api/search-image?query=React%20Native%20mobile%20app%20development%20course%20cover%20with%20smartphone%20interface%20mobile%20UI%20components%20clean%20professional%20design%20bright%20background&width=400&height=250&seq=reactnativecourse&orientation=landscape',
      instructor: 'Lisa Park',
      syllabus: ['React Native Setup', 'Navigation', 'Native Components', 'API Integration', 'State Management', 'App Store Deployment'],
      preview: 'https://www.youtube.com/embed/dGcsHMXbSOA'
    },
    {
      id: 6,
      title: 'DevOps & Cloud Engineering',
      description: 'Master containerization, CI/CD, and cloud deployment strategies.',
      category: 'devops',
      level: 'advanced',
      price: '$179',
      duration: '60 hours',
      students: '7,340',
      rating: 4.9,
      image: 'https://readdy.ai/api/search-image?query=DevOps%20cloud%20engineering%20course%20cover%20with%20containers%20CI%20CD%20pipeline%20cloud%20infrastructure%20deployment%20clean%20professional%20design%20bright%20background&width=400&height=250&seq=devopscourse&orientation=landscape',
      instructor: 'David Wilson',
      syllabus: ['Docker & Kubernetes', 'CI/CD Pipelines', 'AWS/Azure', 'Infrastructure as Code', 'Monitoring', 'Security'],
      preview: 'https://www.youtube.com/embed/dGcsHMXbSOA'
    }
  ];

  const filteredCourses = courses.filter(course => {
    const categoryMatch = selectedCategory === 'all' || course.category === selectedCategory;
    const levelMatch = selectedLevel === 'all' || course.level === selectedLevel;
    return categoryMatch && levelMatch;
  });

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-20">
          <div className="container mx-auto px-6 text-center text-white">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Explore Our Courses
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
              Discover world-class programming courses designed to take you from beginner to professional.
            </p>
          </div>
        </section>

        {/* Filters */}
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-6">
            <div className="flex flex-wrap gap-4 justify-center mb-8">
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                      selectedCategory === category.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-blue-50'
                    }`}
                  >
                    {category.label}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {levels.map(level => (
                  <button
                    key={level.id}
                    onClick={() => setSelectedLevel(level.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                      selectedLevel === level.id
                        ? 'bg-purple-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-purple-50'
                    }`}
                  >
                    {level.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Courses Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCourses.map(course => (
                <Card key={course.id} className="hover:shadow-xl transition-shadow cursor-pointer">
                  <img 
                    src={course.image} 
                    alt={course.title}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                  
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      course.level === 'beginner' ? 'bg-green-100 text-green-800' :
                      course.level === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
                    </span>
                    <span className="text-lg font-bold text-blue-600">{course.price}</span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{course.title}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">{course.description}</p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span>⭐ {course.rating}</span>
                    <span>{course.students} students</span>
                    <span>{course.duration}</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      className="flex-1"
                      onClick={() => setSelectedCourse(course)}
                    >
                      View Details
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Course Detail Modal */}
      <Modal
        isOpen={!!selectedCourse}
        onClose={() => setSelectedCourse(null)}
        title={selectedCourse?.title}
        size="xl"
      >
        {selectedCourse && (
          <div className="space-y-6">
            <div className="aspect-video">
              <iframe
                src={selectedCourse.preview}
                className="w-full h-full rounded-lg"
                allowFullScreen
              />
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-bold mb-3">Course Overview</h3>
                <p className="text-gray-600 mb-4">{selectedCourse.description}</p>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Instructor:</span>
                    <span className="font-medium">{selectedCourse.instructor}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span className="font-medium">{selectedCourse.duration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Students:</span>
                    <span className="font-medium">{selectedCourse.students}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rating:</span>
                    <span className="font-medium">⭐ {selectedCourse.rating}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-bold mb-3">Course Syllabus</h3>
                <ul className="space-y-2">
                  {selectedCourse.syllabus.map((topic: string, index: number) => (
                    <li key={index} className="flex items-center">
                      <i className="ri-check-line text-green-600 mr-2"></i>
                      {topic}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="flex gap-4 pt-4 border-t">
              <Button size="lg" className="flex-1">
                Enroll Now - {selectedCourse.price}
              </Button>
              <Button variant="outline" size="lg">
                Add to Wishlist
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
