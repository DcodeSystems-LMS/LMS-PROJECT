
import Header from '@/components/feature/Header';
import Footer from '@/components/feature/Footer';
import Card from '@/components/base/Card';

export default function LeaderboardPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('all-time');
  const [selectedCategory, setSelectedCategory] = useState('overall');

  const periods = [
    { id: 'weekly', label: 'This Week' },
    { id: 'monthly', label: 'This Month' },
    { id: 'all-time', label: 'All Time' }
  ];

  const categories = [
    { id: 'overall', label: 'Overall' },
    { id: 'frontend', label: 'Frontend' },
    { id: 'backend', label: 'Backend' },
    { id: 'fullstack', label: 'Full Stack' },
    { id: 'data-science', label: 'Data Science' }
  ];

  const leaders = [
    {
      rank: 1,
      name: 'Alex Chen',
      avatar: 'https://readdy.ai/api/search-image?query=Professional%20headshot%20young%20Asian%20male%20software%20developer%20confident%20smile%20modern%20tech%20background%20clean%20bright%20lighting&width=80&height=80&seq=leader1&orientation=squarish',
      xp: 15420,
      level: 28,
      badge: 'Elite Coder',
      completedCourses: 12,
      streak: 45
    },
    {
      rank: 2,
      name: 'Sarah Wilson',
      avatar: 'https://readdy.ai/api/search-image?query=Professional%20headshot%20young%20female%20software%20engineer%20confident%20smile%20modern%20tech%20background%20clean%20bright%20lighting&width=80&height=80&seq=leader2&orientation=squarish',
      xp: 14850,
      level: 27,
      badge: 'React Master',
      completedCourses: 10,
      streak: 38
    },
    {
      rank: 3,
      name: 'Michael Rodriguez',
      avatar: 'https://readdy.ai/api/search-image?query=Professional%20headshot%20young%20Hispanic%20male%20developer%20confident%20smile%20modern%20tech%20background%20clean%20bright%20lighting&width=80&height=80&seq=leader3&orientation=squarish',
      xp: 13920,
      level: 26,
      badge: 'Full Stack Pro',
      completedCourses: 11,
      streak: 42
    },
    {
      rank: 4,
      name: 'Emma Thompson',
      avatar: 'https://readdy.ai/api/search-image?query=Professional%20headshot%20young%20female%20programmer%20confident%20smile%20modern%20tech%20background%20clean%20bright%20lighting&width=80&height=80&seq=leader4&orientation=squarish',
      xp: 12750,
      level: 24,
      badge: 'Data Wizard',
      completedCourses: 9,
      streak: 31
    },
    {
      rank: 5,
      name: 'David Kim',
      avatar: 'https://readdy.ai/api/search-image?query=Professional%20headshot%20young%20Korean%20male%20software%20engineer%20confident%20smile%20modern%20tech%20background%20clean%20bright%20lighting&width=80&height=80&seq=leader5&orientation=squarish',
      xp: 11680,
      level: 23,
      badge: 'Backend Expert',
      completedCourses: 8,
      streak: 29
    }
  ];

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-purple-600 to-blue-600 py-20">
          <div className="container mx-auto px-6 text-center text-white">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Global Leaderboard
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
              See where you stand among thousands of coding enthusiasts worldwide.
            </p>
          </div>
        </section>

        {/* Filters */}
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-6">
            <div className="flex flex-wrap gap-4 justify-center mb-8">
              <div className="flex flex-wrap gap-2">
                {periods.map(period => (
                  <button
                    key={period.id}
                    onClick={() => setSelectedPeriod(period.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                      selectedPeriod === period.id
                        ? 'bg-purple-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-purple-50'
                    }`}
                  >
                    {period.label}
                  </button>
                ))}
              </div>
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
            </div>

            {/* Leaderboard */}
            <div className="max-w-4xl mx-auto">
              <Card>
                <div className="space-y-4">
                  {leaders.map((leader, index) => (
                    <div 
                      key={leader.rank}
                      className={`flex items-center p-6 rounded-lg transition-colors ${
                        leader.rank <= 3 
                          ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200' 
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="text-2xl font-bold min-w-[60px] text-center">
                          {getRankIcon(leader.rank)}
                        </div>
                        
                        <img 
                          src={leader.avatar} 
                          alt={leader.name}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                        
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900">{leader.name}</h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                              {leader.badge}
                            </span>
                            <span>Level {leader.level}</span>
                            <span>{leader.completedCourses} courses</span>
                            <span>{leader.streak} day streak</span>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-2xl font-bold text-purple-600">
                            {leader.xp.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-500">XP</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Your Rank */}
              <Card className="mt-6 bg-blue-50 border-2 border-blue-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-xl font-bold text-blue-600">#127</div>
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold">J</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Your Rank</h3>
                      <p className="text-sm text-gray-600">Keep learning to climb higher!</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-blue-600">2,450</div>
                    <div className="text-sm text-gray-500">XP</div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
