
import React, { useState, useEffect, useMemo } from 'react';
import Card from '@/components/base/Card';
import Button from '@/components/base/Button';
import Modal from '@/components/base/Modal';

interface JobPlacement {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'Full-time' | 'Internship' | 'Part-time' | 'Contract';
  domain: string;
  salary: string;
  requirements: string[];
  description: string;
  posted: string;
  deadline: string;
  logo: string;
  experience: string;
  remote: boolean;
  applyUrl?: string;
  benefits?: string[];
  companySize?: string;
  industry?: string;
}

const StudentJobPlacements: React.FC = () => {
  const [placements, setPlacements] = useState<JobPlacement[]>([]);
  const [typeFilter, setTypeFilter] = useState('all');
  const [domainFilter, setDomainFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [experienceFilter, setExperienceFilter] = useState('all');
  const [selectedPlacement, setSelectedPlacement] = useState<JobPlacement | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [savedOpportunities, setSavedOpportunities] = useState<Set<string>>(new Set());

  useEffect(() => {
    // In a real application, this would fetch from a job placements API
    // For now, we'll create some sample data
    const samplePlacements: JobPlacement[] = [
      {
        id: '1',
        title: 'Frontend Developer Intern',
        company: 'TechStart Inc.',
        location: 'San Francisco, CA',
        type: 'Internship',
        domain: 'Web Development',
        salary: '₹2,000/hour',
        requirements: ['React', 'JavaScript', 'CSS', 'Git'],
        description: 'Join our dynamic team to build modern web applications using React and JavaScript. Perfect opportunity for recent graduates to gain real-world experience.',
        posted: '2024-01-10',
        deadline: '2024-01-25',
        logo: 'https://readdy.ai/api/search-image?query=modern%20tech%20startup%20company%20logo%2C%20clean%20minimal%20design%2C%20blue%20and%20white%20colors%2C%20professional%20business%20branding&width=100&height=100&seq=4&orientation=squarish',
        experience: 'Entry-level',
        remote: true,
        benefits: ['Mentorship Program', 'Learning Budget', 'Flexible Schedule', 'Potential Full-time Offer'],
        companySize: 'Medium (51-500)',
        industry: 'Technology'
      },
      {
        id: '2',
        title: 'Full Stack Developer',
        company: 'Digital Solutions LLC',
        location: 'New York, NY',
        type: 'Full-time',
        domain: 'Web Development',
        salary: '₹6,25,000 - ₹7,10,000',
        requirements: ['Node.js', 'React', 'MongoDB', 'AWS'],
        description: 'We\'re looking for a passionate full-stack developer to join our growing team and work on exciting client projects.',
        posted: '2024-01-12',
        deadline: '2024-01-30',
        logo: 'https://readdy.ai/api/search-image?query=digital%20technology%20company%20logo%2C%20geometric%20design%2C%20modern%20corporate%20branding%2C%20green%20and%20gray%20colors&width=100&height=100&seq=5&orientation=squarish',
        experience: 'Mid-level',
        remote: false,
        benefits: ['Health Insurance', 'Remote Work', 'Learning Budget', 'Flexible Hours'],
        companySize: 'Large (500+)',
        industry: 'Technology'
      }
    ];
    
    setPlacements(samplePlacements);
  }, []);

  // Filter, search and sort placements
  const filteredPlacements = useMemo(() => {
    let filtered = placements;

    // Filter by type
    if (typeFilter !== 'all') {
      filtered = filtered.filter(p => p.type === typeFilter);
    }

    // Filter by domain
    if (domainFilter !== 'all') {
      filtered = filtered.filter(p => p.domain === domainFilter);
    }

    // Filter by experience level
    if (experienceFilter !== 'all') {
      filtered = filtered.filter(p => p.experience === experienceFilter);
    }

    // Filter by location
    if (locationFilter !== 'all') {
      if (locationFilter === 'remote') {
        filtered = filtered.filter(p => p.remote);
      } else {
        filtered = filtered.filter(p => p.location.includes(locationFilter));
      }
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.requirements.some(req => req.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Sort placements
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.posted).getTime() - new Date(a.posted).getTime();
        case 'oldest':
          return new Date(a.posted).getTime() - new Date(b.posted).getTime();
        case 'deadline':
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        case 'company':
          return a.company.localeCompare(b.company);
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return filtered;
  }, [placements, typeFilter, domainFilter, experienceFilter, locationFilter, searchTerm, sortBy]);

  const uniqueDomains = [...new Set(placements.map(p => p.domain))];
  const uniqueLocations = [...new Set(placements.map(p => p.location.split(',')[1]?.trim() || p.location))];
  const uniqueExperience = [...new Set(placements.map(p => p.experience))];

  const stats = [
    { label: 'Total Opportunities', value: placements.length.toString(), icon: 'ri-briefcase-line', color: 'blue' },
    { label: 'Full-time Jobs', value: placements.filter(p => p.type === 'Full-time').length.toString(), icon: 'ri-building-line', color: 'green' },
    { label: 'Internships', value: placements.filter(p => p.type === 'Internship').length.toString(), icon: 'ri-graduation-cap-line', color: 'purple' },
    { label: 'Saved Opportunities', value: savedOpportunities.size.toString(), icon: 'ri-bookmark-line', color: 'orange' }
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTypeColor = (type: string) => {
    const colors = {
      'Full-time': 'bg-green-100 text-green-800',
      'Internship': 'bg-blue-100 text-blue-800',
      'Part-time': 'bg-yellow-100 text-yellow-800',
      'Contract': 'bg-purple-100 text-purple-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getExperienceColor = (experience: string) => {
    const colors = {
      'Entry-level': 'bg-green-100 text-green-800',
      'Mid-level': 'bg-blue-100 text-blue-800',
      'Senior': 'bg-purple-100 text-purple-800'
    };
    return colors[experience as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const toggleSaveOpportunity = (placementId: string) => {
    setSavedOpportunities(prev => {
      const newSet = new Set(prev);
      if (newSet.has(placementId)) {
        newSet.delete(placementId);
      } else {
        newSet.add(placementId);
      }
      return newSet;
    });
  };

  const clearAllFilters = () => {
    setTypeFilter('all');
    setDomainFilter('all');
    setLocationFilter('all');
    setExperienceFilter('all');
    setSearchTerm('');
    setSortBy('newest');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Job Placements & Internships</h1>
          <p className="text-gray-600 mt-1">Discover full-time positions and internship opportunities from our partner companies</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.location.reload()}>
            <i className="ri-refresh-line mr-2"></i>
            Refresh
          </Button>
          <Button onClick={() => console.log('Saved opportunities:', Array.from(savedOpportunities))}>
            <i className="ri-bookmark-line mr-2"></i>
            View Saved ({savedOpportunities.size})
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="text-center hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => {
                  if (stat.label === 'Full-time Jobs') setTypeFilter('Full-time');
                  else if (stat.label === 'Internships') setTypeFilter('Internship');
                  else if (stat.label === 'Saved Opportunities') {
                    // Show saved opportunities filter
                    console.log('Show saved opportunities');
                  }
                }}>
            <div className={`w-12 h-12 mx-auto mb-4 rounded-full bg-${stat.color}-100 flex items-center justify-center`}>
              <i className={`${stat.icon} text-2xl text-${stat.color}-600`}></i>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </Card>
        ))}
      </div>

      {/* Search and Filters */}
      <Card>
        <div className="space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <i className="ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                <input
                  type="text"
                  placeholder="Search by title, company, skills, location..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="w-48">
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="newest">Sort: Newest First</option>
                <option value="oldest">Sort: Oldest First</option>
                <option value="deadline">Sort: Deadline</option>
                <option value="company">Sort: Company A-Z</option>
                <option value="title">Sort: Title A-Z</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-48">
              <label className="block text-sm font-medium text-gray-700 mb-1">Position Type</label>
              <select 
                value={typeFilter} 
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="all">All Types</option>
                <option value="Full-time">Full-time Jobs</option>
                <option value="Internship">Internships</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
              </select>
            </div>

            <div className="flex-1 min-w-48">
              <label className="block text-sm font-medium text-gray-700 mb-1">Domain</label>
              <select 
                value={domainFilter} 
                onChange={(e) => setDomainFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="all">All Domains</option>
                {uniqueDomains.map((domain) => (
                  <option key={domain} value={domain}>{domain}</option>
                ))}
              </select>
            </div>

            <div className="flex-1 min-w-48">
              <label className="block text-sm font-medium text-gray-700 mb-1">Experience Level</label>
              <select 
                value={experienceFilter} 
                onChange={(e) => setExperienceFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="all">All Levels</option>
                {uniqueExperience.map((exp) => (
                  <option key={exp} value={exp}>{exp}</option>
                ))}
              </select>
            </div>

            <div className="flex-1 min-w-48">
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <select 
                value={locationFilter} 
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="all">All Locations</option>
                <option value="remote">Remote</option>
                {uniqueLocations.map((location) => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <Button variant="outline" size="sm" onClick={clearAllFilters}>
                <i className="ri-refresh-line mr-2"></i>
                Clear All
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          Showing {filteredPlacements.length} of {placements.length} opportunities
        </span>
        {(searchTerm || typeFilter !== 'all' || domainFilter !== 'all' || locationFilter !== 'all' || experienceFilter !== 'all') && (
          <Button variant="outline" size="sm" onClick={clearAllFilters}>
            <i className="ri-close-line mr-2"></i>
            Clear Filters
          </Button>
        )}
      </div>

      {/* Placements List */}
      <div className="space-y-4">
        {filteredPlacements.map((placement) => {
          const isSaved = savedOpportunities.has(placement.id);
          const daysUntilDeadline = Math.ceil((new Date(placement.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
          
          return (
            <Card key={placement.id} className="hover:shadow-lg transition-all group">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="flex-shrink-0">
                    <img 
                      src={placement.logo} 
                      alt={`${placement.company} logo`}
                      className="w-16 h-16 rounded-lg object-cover bg-gray-100"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                          {placement.title}
                        </h3>
                        <p className="text-gray-600 font-medium">{placement.company}</p>
                      </div>
                      <div className="flex flex-col items-end space-y-1">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(placement.type)}`}>
                          {placement.type}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getExperienceColor(placement.experience)}`}>
                          {placement.experience}
                        </span>
                        {daysUntilDeadline <= 7 && daysUntilDeadline > 0 && (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                            <i className="ri-time-line mr-1"></i>
                            {daysUntilDeadline} days left
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center">
                        <i className="ri-map-pin-line mr-1 text-gray-400"></i>
                        {placement.location}
                        {placement.remote && <span className="ml-1 text-green-600">(Remote Available)</span>}
                      </div>
                      <div className="flex items-center">
                        <i className="ri-money-dollar-circle-line mr-1 text-gray-400"></i>
                        {placement.salary}
                      </div>
                      <div className="flex items-center">
                        <i className="ri-building-line mr-1 text-gray-400"></i>
                        {placement.domain}
                      </div>
                    </div>

                    <p className="text-gray-700 text-sm mb-3 line-clamp-2">{placement.description}</p>

                    <div className="flex flex-wrap gap-2 mb-3">
                      {placement.requirements.slice(0, 4).map((req, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md">
                          {req}
                        </span>
                      ))}
                      {placement.requirements.length > 4 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
                          +{placement.requirements.length - 4} more
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Posted: {formatDate(placement.posted)}</span>
                      <span className={daysUntilDeadline <= 7 ? 'text-red-600 font-medium' : ''}>
                        Deadline: {formatDate(placement.deadline)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col space-y-2 ml-4 flex-shrink-0">
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => toggleSaveOpportunity(placement.id)}
                    className={isSaved ? 'text-orange-600 border-orange-300 hover:bg-orange-50' : ''}
                  >
                    <i className={`${isSaved ? 'ri-bookmark-fill' : 'ri-bookmark-line'} mr-2`}></i>
                    {isSaved ? 'Saved' : 'Save'}
                  </Button>
                  <Button 
                    onClick={() => {
                      setSelectedPlacement(placement);
                      setShowDetailsModal(true);
                    }}
                    variant="outline"
                    size="sm"
                  >
                    <i className="ri-eye-line mr-2"></i>
                    View Details
                  </Button>
                  <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    <i className="ri-external-link-line mr-2"></i>
                    Apply Now
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {filteredPlacements.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-briefcase-line text-2xl text-gray-400"></i>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No opportunities found</h3>
          <p className="text-gray-600 mb-4">Try adjusting your search or filter criteria</p>
          <Button onClick={clearAllFilters}>
            <i className="ri-refresh-line mr-2"></i>
            Clear All Filters
          </Button>
        </div>
      )}

      {/* Job Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedPlacement(null);
        }}
        title="Job Details"
      >
        {selectedPlacement && (
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <img 
                src={selectedPlacement.logo} 
                alt={`${selectedPlacement.company} logo`}
                className="w-16 h-16 rounded-lg object-cover bg-gray-100"
              />
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-1">{selectedPlacement.title}</h3>
                <p className="text-gray-600 font-medium mb-2">{selectedPlacement.company}</p>
                <div className="flex flex-wrap gap-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(selectedPlacement.type)}`}>
                    {selectedPlacement.type}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getExperienceColor(selectedPlacement.experience)}`}>
                    {selectedPlacement.experience}
                  </span>
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                    {selectedPlacement.companySize}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Location:</span>
                <p className="text-gray-600 mt-1">
                  {selectedPlacement.location}
                  {selectedPlacement.remote && <span className="text-green-600 block">Remote Work Available</span>}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Salary:</span>
                <p className="text-gray-600 mt-1">{selectedPlacement.salary}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Industry:</span>
                <p className="text-gray-600 mt-1">{selectedPlacement.industry}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Domain:</span>
                <p className="text-gray-600 mt-1">{selectedPlacement.domain}</p>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Job Description</h4>
              <p className="text-gray-700 text-sm leading-relaxed">{selectedPlacement.description}</p>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Requirements</h4>
              <div className="flex flex-wrap gap-2">
                {selectedPlacement.requirements.map((req, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-md">
                    {req}
                  </span>
                ))}
              </div>
            </div>

            {selectedPlacement.benefits && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Benefits</h4>
                <div className="grid grid-cols-2 gap-2">
                  {selectedPlacement.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center text-sm text-gray-600">
                      <i className="ri-check-line text-green-600 mr-2"></i>
                      {benefit}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-200">
              <span>Posted: {formatDate(selectedPlacement.posted)}</span>
              <span className="text-red-600">Apply by: {formatDate(selectedPlacement.deadline)}</span>
            </div>

            <div className="flex justify-end space-x-3">
              <Button 
                variant="outline" 
                onClick={() => toggleSaveOpportunity(selectedPlacement.id)}
                className={savedOpportunities.has(selectedPlacement.id) ? 'text-orange-600 border-orange-300' : ''}
              >
                <i className={`${savedOpportunities.has(selectedPlacement.id) ? 'ri-bookmark-fill' : 'ri-bookmark-line'} mr-2`}></i>
                {savedOpportunities.has(selectedPlacement.id) ? 'Saved' : 'Save Opportunity'}
              </Button>
              <Button variant="outline" onClick={() => setShowDetailsModal(false)}>
                Close
              </Button>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <i className="ri-external-link-line mr-2"></i>
                Apply Now
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default StudentJobPlacements;
