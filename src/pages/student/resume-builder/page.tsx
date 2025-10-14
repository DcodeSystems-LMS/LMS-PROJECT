import React, { useState, useRef } from 'react';
import Button from '@/components/base/Button';
import Card from '@/components/base/Card';

interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  linkedin: string;
  github: string;
  website: string;
}

interface Education {
  id: number;
  level: string;
  institution: string;
  board: string;
  year: string;
  percentage: string;
}

interface Skill {
  id: number;
  name: string;
  proficiency: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
}

interface Project {
  id: number;
  title: string;
  description: string;
  techStack: string[];
  role: string;
  duration: string;
  link: string;
}

interface Internship {
  id: number;
  company: string;
  role: string;
  duration: string;
  description: string;
  outcome: string;
}

interface Achievement {
  id: number;
  type: 'Certification' | 'Award' | 'Publication' | 'Hackathon';
  title: string;
  description: string;
  date: string;
  link: string;
}

const sections = [
  { id: 'personal', label: 'Personal Info', icon: 'ri-user-line', completed: false },
  { id: 'education', label: 'Education', icon: 'ri-graduation-cap-line', completed: false },
  { id: 'skills', label: 'Skills', icon: 'ri-code-line', completed: false },
  { id: 'projects', label: 'Projects', icon: 'ri-folder-line', completed: false },
  { id: 'internships', label: 'Internships', icon: 'ri-briefcase-line', completed: false },
  { id: 'achievements', label: 'Achievements', icon: 'ri-award-line', completed: false },
];

const ResumeBuilderPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState('personal');
  const [completedSections, setCompletedSections] = useState<string[]>([]);
  const resumeRef = useRef<HTMLDivElement>(null);

  // Personal Info State
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    fullName: 'John Doe',
    email: 'john.doe@email.com',
    phone: '+1 (555) 123-4567',
    address: 'San Francisco, CA',
    linkedin: 'linkedin.com/in/johndoe',
    github: 'github.com/johndoe',
    website: 'johndoe.dev'
  });

  // Education State
  const [educationEntries, setEducationEntries] = useState<Education[]>([
    {
      id: 1,
      level: '10th Class',
      institution: 'ABC High School',
      board: 'CBSE',
      year: '2018',
      percentage: '85.5%'
    },
    {
      id: 2,
      level: 'Intermediate/12th',
      institution: 'XYZ Senior Secondary School',
      board: 'State Board',
      year: '2020',
      percentage: '88.2%'
    },
    {
      id: 3,
      level: 'Undergraduate',
      institution: 'University of California, Berkeley',
      board: 'UC System',
      year: '2024',
      percentage: '3.7 GPA'
    }
  ]);

  // Skills State
  const [skills, setSkills] = useState<Skill[]>([
    { id: 1, name: 'JavaScript', proficiency: 'Advanced' },
    { id: 2, name: 'React', proficiency: 'Advanced' },
    { id: 3, name: 'Node.js', proficiency: 'Intermediate' },
    { id: 4, name: 'Python', proficiency: 'Intermediate' },
    { id: 5, name: 'AWS', proficiency: 'Beginner' }
  ]);

  // Projects State
  const [projects, setProjects] = useState<Project[]>([
    {
      id: 1,
      title: 'E-commerce Platform',
      description: 'Built a full-stack e-commerce platform with React, Node.js, and MongoDB. Features include user authentication, product catalog, shopping cart, and payment integration.',
      techStack: ['React', 'Node.js', 'MongoDB', 'Stripe API'],
      role: 'Full Stack Developer',
      duration: '3 months',
      link: 'github.com/johndoe/ecommerce'
    },
    {
      id: 2,
      title: 'Task Management App',
      description: 'Developed a collaborative task management application with real-time updates using Socket.io and React.',
      techStack: ['React', 'Socket.io', 'Express', 'PostgreSQL'],
      role: 'Frontend Developer',
      duration: '2 months',
      link: 'github.com/johndoe/taskmanager'
    }
  ]);

  // Internships State
  const [internships, setInternships] = useState<Internship[]>([
    {
      id: 1,
      company: 'Tech Startup Inc.',
      role: 'Frontend Developer Intern',
      duration: 'June 2023 - August 2023',
      description: 'Worked on developing user interfaces for web applications using React and TypeScript. Collaborated with design team to implement responsive designs.',
      outcome: 'Improved page load speed by 40% and received offer for full-time position'
    }
  ]);

  // Achievements State
  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: 1,
      type: 'Certification',
      title: 'AWS Certified Developer Associate',
      description: 'Demonstrated expertise in developing and maintaining applications on AWS platform',
      date: '2024-01-15',
      link: 'aws.amazon.com/certification'
    },
    {
      id: 2,
      type: 'Hackathon',
      title: 'Winner - University Hackathon 2023',
      description: 'First place winner for developing an AI-powered study assistant application',
      date: '2023-11-20',
      link: 'devpost.com/software/study-assistant'
    }
  ]);

  const handleDownloadPDF = async () => {
    try {
      const jsPDF = (await import('jspdf')).jsPDF;
      const html2canvas = (await import('html2canvas')).default;
      
      if (resumeRef.current) {
        const canvas = await html2canvas(resumeRef.current, {
          scale: 2,
          useCORS: true,
          allowTaint: true
        });
        
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });
        
        const imgWidth = 210; // A4 width in mm
        const pageHeight = 297; // A4 height in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;
        
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        
        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }
        
        pdf.save(`${personalInfo.fullName.replace(/\s+/g, '_')}_Resume.pdf`);
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  const addEducationEntry = () => {
    const newEntry: Education = {
      id: Date.now(),
      level: '',
      institution: '',
      board: '',
      year: '',
      percentage: ''
    };
    setEducationEntries([...educationEntries, newEntry]);
  };

  const removeEducationEntry = (id: number) => {
    setEducationEntries(educationEntries.filter(entry => entry.id !== id));
  };

  const updateEducationEntry = (id: number, field: keyof Education, value: string) => {
    setEducationEntries(educationEntries.map(entry => 
      entry.id === id ? { ...entry, [field]: value } : entry
    ));
  };

  const addSkill = () => {
    const newSkill: Skill = {
      id: Date.now(),
      name: '',
      proficiency: 'Beginner'
    };
    setSkills([...skills, newSkill]);
  };

  const removeSkill = (id: number) => {
    setSkills(skills.filter(skill => skill.id !== id));
  };

  const updateSkill = (id: number, field: keyof Skill, value: any) => {
    setSkills(skills.map(skill => 
      skill.id === id ? { ...skill, [field]: value } : skill
    ));
  };

  const addProject = () => {
    const newProject: Project = {
      id: Date.now(),
      title: '',
      description: '',
      techStack: [],
      role: '',
      duration: '',
      link: ''
    };
    setProjects([...projects, newProject]);
  };

  const removeProject = (id: number) => {
    setProjects(projects.filter(project => project.id !== id));
  };

  const updateProject = (id: number, field: keyof Project, value: any) => {
    setProjects(projects.map(project => 
      project.id === id ? { ...project, [field]: value } : project
    ));
  };

  const addInternship = () => {
    const newInternship: Internship = {
      id: Date.now(),
      company: '',
      role: '',
      duration: '',
      description: '',
      outcome: ''
    };
    setInternships([...internships, newInternship]);
  };

  const removeInternship = (id: number) => {
    setInternships(internships.filter(internship => internship.id !== id));
  };

  const updateInternship = (id: number, field: keyof Internship, value: string) => {
    setInternships(internships.map(internship => 
      internship.id === id ? { ...internship, [field]: value } : internship
    ));
  };

  const addAchievement = () => {
    const newAchievement: Achievement = {
      id: Date.now(),
      type: 'Certification',
      title: '',
      description: '',
      date: '',
      link: ''
    };
    setAchievements([...achievements, newAchievement]);
  };

  const removeAchievement = (id: number) => {
    setAchievements(achievements.filter(achievement => achievement.id !== id));
  };

  const updateAchievement = (id: number, field: keyof Achievement, value: any) => {
    setAchievements(achievements.map(achievement => 
      achievement.id === id ? { ...achievement, [field]: value } : achievement
    ));
  };

  const renderPersonalInfoSection = () => (
    <div className="dashboard-content">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Personal Information</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="form-group">
          <label className="form-label">Full Name *</label>
          <input
            className="form-input"
            type="text"
            value={personalInfo.fullName}
            onChange={(e) => setPersonalInfo({...personalInfo, fullName: e.target.value})}
            placeholder="e.g., John Doe"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Email Address *</label>
          <input
            className="form-input"
            type="email"
            value={personalInfo.email}
            onChange={(e) => setPersonalInfo({...personalInfo, email: e.target.value})}
            placeholder="e.g., john.doe@email.com"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Phone Number *</label>
          <input
            className="form-input"
            type="tel"
            value={personalInfo.phone}
            onChange={(e) => setPersonalInfo({...personalInfo, phone: e.target.value})}
            placeholder="e.g., +1 (555) 123-4567"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Address *</label>
          <input
            className="form-input"
            type="text"
            value={personalInfo.address}
            onChange={(e) => setPersonalInfo({...personalInfo, address: e.target.value})}
            placeholder="e.g., San Francisco, CA"
          />
        </div>

        <div className="form-group">
          <label className="form-label">LinkedIn Profile</label>
          <input
            className="form-input"
            type="url"
            value={personalInfo.linkedin}
            onChange={(e) => setPersonalInfo({...personalInfo, linkedin: e.target.value})}
            placeholder="e.g., linkedin.com/in/johndoe"
          />
        </div>

        <div className="form-group">
          <label className="form-label">GitHub Profile</label>
          <input
            className="form-input"
            type="url"
            value={personalInfo.github}
            onChange={(e) => setPersonalInfo({...personalInfo, github: e.target.value})}
            placeholder="e.g., github.com/johndoe"
          />
        </div>

        <div className="form-group md:col-span-2">
          <label className="form-label">Personal Website</label>
          <input
            className="form-input"
            type="url"
            value={personalInfo.website}
            onChange={(e) => setPersonalInfo({...personalInfo, website: e.target.value})}
            placeholder="e.g., johndoe.dev"
          />
        </div>
      </div>

      <div className="btn-group justify-end pt-8 border-t border-gray-200 mt-8">
        <Button className="min-h-[44px]" onClick={() => setActiveSection('education')}>
          Next: Education
          <i className="ri-arrow-right-line ml-2"></i>
        </Button>
      </div>
    </div>
  );

  const renderEducationSection = () => (
    <div className="dashboard-content">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Education</h2>
        <Button onClick={addEducationEntry} className="min-h-[44px]">
          <i className="ri-add-line mr-2"></i>
          Add Education
        </Button>
      </div>

      <div className="space-y-8">
        {educationEntries.map((entry, index) => (
          <div key={entry.id} className="form-section">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-lg font-medium text-gray-900">Education #{index + 1}</h3>
              <Button
                variant="outline"
                onClick={() => removeEducationEntry(entry.id)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-200 min-h-[44px] min-w-[44px] !p-3"
              >
                <i className="ri-delete-bin-line"></i>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-group">
                <label className="form-label">Education Level *</label>
                <select
                  className="form-input pr-8"
                  value={entry.level}
                  onChange={(e) => updateEducationEntry(entry.id, 'level', e.target.value)}
                >
                  <option value="">Select Level</option>
                  <option value="10th Class">10th Class</option>
                  <option value="Intermediate/12th">Intermediate/12th</option>
                  <option value="Diploma">Diploma</option>
                  <option value="Undergraduate">Undergraduate</option>
                  <option value="Postgraduate">Postgraduate</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Institution *</label>
                <input
                  className="form-input"
                  type="text"
                  value={entry.institution}
                  onChange={(e) => updateEducationEntry(entry.id, 'institution', e.target.value)}
                  placeholder="e.g., University of California, Berkeley"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Board/University *</label>
                <input
                  className="form-input"
                  type="text"
                  value={entry.board}
                  onChange={(e) => updateEducationEntry(entry.id, 'board', e.target.value)}
                  placeholder="e.g., CBSE, State Board, UC System"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Year of Completion *</label>
                <input
                  className="form-input"
                  type="text"
                  value={entry.year}
                  onChange={(e) => updateEducationEntry(entry.id, 'year', e.target.value)}
                  placeholder="YYYY"
                />
              </div>

              <div className="form-group md:col-span-2">
                <label className="form-label">Percentage/CGPA *</label>
                <input
                  className="form-input"
                  type="text"
                  value={entry.percentage}
                  onChange={(e) => updateEducationEntry(entry.id, 'percentage', e.target.value)}
                  placeholder="e.g., 85.5% or 3.7 GPA"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="btn-group justify-between pt-8 border-t border-gray-200 mt-8">
        <Button variant="outline" className="min-h-[44px]" onClick={() => setActiveSection('personal')}>
          <i className="ri-arrow-left-line mr-2"></i>
          Previous
        </Button>
        <Button className="min-h-[44px]" onClick={() => setActiveSection('skills')}>
          Next: Skills
          <i className="ri-arrow-right-line ml-2"></i>
        </Button>
      </div>
    </div>
  );

  const renderSkillsSection = () => (
    <div className="dashboard-content">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Skills</h2>
        <Button onClick={addSkill} className="min-h-[44px]">
          <i className="ri-add-line mr-2"></i>
          Add Skill
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {skills.map((skill) => (
          <div key={skill.id} className="form-section">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Skill</h3>
              <Button
                variant="outline"
                onClick={() => removeSkill(skill.id)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-200 min-h-[44px] min-w-[44px] !p-3"
              >
                <i className="ri-delete-bin-line"></i>
              </Button>
            </div>

            <div className="space-y-4">
              <div className="form-group">
                <label className="form-label">Skill Name *</label>
                <input
                  className="form-input"
                  type="text"
                  value={skill.name}
                  onChange={(e) => updateSkill(skill.id, 'name', e.target.value)}
                  placeholder="e.g., JavaScript, React, Python"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Proficiency Level *</label>
                <select
                  className="form-input pr-8"
                  value={skill.proficiency}
                  onChange={(e) => updateSkill(skill.id, 'proficiency', e.target.value)}
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Expert">Expert</option>
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="btn-group justify-between pt-8 border-t border-gray-200 mt-8">
        <Button variant="outline" className="min-h-[44px]" onClick={() => setActiveSection('education')}>
          <i className="ri-arrow-left-line mr-2"></i>
          Previous
        </Button>
        <Button className="min-h-[44px]" onClick={() => setActiveSection('projects')}>
          Next: Projects
          <i className="ri-arrow-right-line ml-2"></i>
        </Button>
      </div>
    </div>
  );

  const renderProjectsSection = () => (
    <div className="dashboard-content">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Projects</h2>
        <Button onClick={addProject} className="min-h-[44px]">
          <i className="ri-add-line mr-2"></i>
          Add Project
        </Button>
      </div>

      <div className="space-y-8">
        {projects.map((project, index) => (
          <div key={project.id} className="form-section">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-lg font-medium text-gray-900">Project #{index + 1}</h3>
              <Button
                variant="outline"
                onClick={() => removeProject(project.id)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-200 min-h-[44px] min-w-[44px] !p-3"
              >
                <i className="ri-delete-bin-line"></i>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-group">
                <label className="form-label">Project Title *</label>
                <input
                  className="form-input"
                  type="text"
                  value={project.title}
                  onChange={(e) => updateProject(project.id, 'title', e.target.value)}
                  placeholder="e.g., E-commerce Platform"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Your Role *</label>
                <input
                  className="form-input"
                  type="text"
                  value={project.role}
                  onChange={(e) => updateProject(project.id, 'role', e.target.value)}
                  placeholder="e.g., Full Stack Developer"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Duration *</label>
                <input
                  className="form-input"
                  type="text"
                  value={project.duration}
                  onChange={(e) => updateProject(project.id, 'duration', e.target.value)}
                  placeholder="e.g., 3 months"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Project Link</label>
                <input
                  className="form-input"
                  type="url"
                  value={project.link}
                  onChange={(e) => updateProject(project.id, 'link', e.target.value)}
                  placeholder="e.g., github.com/username/project"
                />
              </div>

              <div className="form-group md:col-span-2">
                <label className="form-label">Description *</label>
                <textarea
                  className="form-input"
                  value={project.description}
                  onChange={(e) => updateProject(project.id, 'description', e.target.value)}
                  rows={4}
                  placeholder="Describe your project, its features, and your contributions..."
                />
              </div>

              <div className="form-group md:col-span-2">
                <label className="form-label">Tech Stack *</label>
                <input
                  className="form-input"
                  type="text"
                  value={project.techStack.join(', ')}
                  onChange={(e) => updateProject(project.id, 'techStack', e.target.value.split(', ').filter(Boolean))}
                  placeholder="e.g., React, Node.js, MongoDB, AWS (comma-separated)"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="btn-group justify-between pt-8 border-t border-gray-200 mt-8">
        <Button variant="outline" className="min-h-[44px]" onClick={() => setActiveSection('skills')}>
          <i className="ri-arrow-left-line mr-2"></i>
          Previous
        </Button>
        <Button className="min-h-[44px]" onClick={() => setActiveSection('internships')}>
          Next: Internships
          <i className="ri-arrow-right-line ml-2"></i>
        </Button>
      </div>
    </div>
  );

  const renderInternshipsSection = () => (
    <div className="dashboard-content">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Internships</h2>
        <Button onClick={addInternship} className="min-h-[44px]">
          <i className="ri-add-line mr-2"></i>
          Add Internship
        </Button>
      </div>

      <div className="space-y-8">
        {internships.map((internship, index) => (
          <div key={internship.id} className="form-section">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-lg font-medium text-gray-900">Internship #{index + 1}</h3>
              <Button
                variant="outline"
                onClick={() => removeInternship(internship.id)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-200 min-h-[44px] min-w-[44px] !p-3"
              >
                <i className="ri-delete-bin-line"></i>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-group">
                <label className="form-label">Company Name *</label>
                <input
                  className="form-input"
                  type="text"
                  value={internship.company}
                  onChange={(e) => updateInternship(internship.id, 'company', e.target.value)}
                  placeholder="e.g., Tech Startup Inc."
                />
              </div>

              <div className="form-group">
                <label className="form-label">Role *</label>
                <input
                  className="form-input"
                  type="text"
                  value={internship.role}
                  onChange={(e) => updateInternship(internship.id, 'role', e.target.value)}
                  placeholder="e.g., Frontend Developer Intern"
                />
              </div>

              <div className="form-group md:col-span-2">
                <label className="form-label">Duration *</label>
                <input
                  className="form-input"
                  type="text"
                  value={internship.duration}
                  onChange={(e) => updateInternship(internship.id, 'duration', e.target.value)}
                  placeholder="e.g., June 2023 - August 2023"
                />
              </div>

              <div className="form-group md:col-span-2">
                <label className="form-label">Description *</label>
                <textarea
                  className="form-input"
                  value={internship.description}
                  onChange={(e) => updateInternship(internship.id, 'description', e.target.value)}
                  rows={4}
                  placeholder="Describe your responsibilities and work during the internship..."
                />
              </div>

              <div className="form-group md:col-span-2">
                <label className="form-label">Outcome/Achievement</label>
                <textarea
                  className="form-input"
                  value={internship.outcome}
                  onChange={(e) => updateInternship(internship.id, 'outcome', e.target.value)}
                  rows={2}
                  placeholder="e.g., Improved page load speed by 40%, received full-time offer..."
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="btn-group justify-between pt-8 border-t border-gray-200 mt-8">
        <Button variant="outline" className="min-h-[44px]" onClick={() => setActiveSection('projects')}>
          <i className="ri-arrow-left-line mr-2"></i>
          Previous
        </Button>
        <Button className="min-h-[44px]" onClick={() => setActiveSection('achievements')}>
          Next: Achievements
          <i className="ri-arrow-right-line ml-2"></i>
        </Button>
      </div>
    </div>
  );

  const renderAchievementsSection = () => (
    <div className="dashboard-content">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Achievements</h2>
        <Button onClick={addAchievement} className="min-h-[44px]">
          <i className="ri-add-line mr-2"></i>
          Add Achievement
        </Button>
      </div>

      <div className="space-y-8">
        {achievements.map((achievement, index) => (
          <div key={achievement.id} className="form-section">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-lg font-medium text-gray-900">Achievement #{index + 1}</h3>
              <Button
                variant="outline"
                onClick={() => removeAchievement(achievement.id)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-200 min-h-[44px] min-w-[44px] !p-3"
              >
                <i className="ri-delete-bin-line"></i>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-group">
                <label className="form-label">Type *</label>
                <select
                  className="form-input pr-8"
                  value={achievement.type}
                  onChange={(e) => updateAchievement(achievement.id, 'type', e.target.value)}
                >
                  <option value="Certification">Certification</option>
                  <option value="Award">Award</option>
                  <option value="Publication">Publication</option>
                  <option value="Hackathon">Hackathon</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Date *</label>
                <input
                  className="form-input"
                  type="date"
                  value={achievement.date}
                  onChange={(e) => updateAchievement(achievement.id, 'date', e.target.value)}
                />
              </div>

              <div className="form-group md:col-span-2">
                <label className="form-label">Title *</label>
                <input
                  className="form-input"
                  type="text"
                  value={achievement.title}
                  onChange={(e) => updateAchievement(achievement.id, 'title', e.target.value)}
                  placeholder="e.g., AWS Certified Developer Associate"
                />
              </div>

              <div className="form-group md:col-span-2">
                <label className="form-label">Description *</label>
                <textarea
                  className="form-input"
                  value={achievement.description}
                  onChange={(e) => updateAchievement(achievement.id, 'description', e.target.value)}
                  rows={3}
                  placeholder="Describe the achievement and its significance..."
                />
              </div>

              <div className="form-group md:col-span-2">
                <label className="form-label">Link/URL</label>
                <input
                  className="form-input"
                  type="url"
                  value={achievement.link}
                  onChange={(e) => updateAchievement(achievement.id, 'link', e.target.value)}
                  placeholder="e.g., certificate link, project demo, publication URL"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="btn-group justify-between pt-8 border-t border-gray-200 mt-8">
        <Button variant="outline" className="min-h-[44px]" onClick={() => setActiveSection('internships')}>
          <i className="ri-arrow-left-line mr-2"></i>
          Previous
        </Button>
        <Button className="min-h-[44px]" onClick={() => setActiveSection('personal')}>
          <i className="ri-check-line mr-2"></i>
          Complete
        </Button>
      </div>
    </div>
  );

  const renderResumePreview = () => (
    <div ref={resumeRef} className="bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="p-6 sm:p-8">
        {/* Header */}
        <div className="border-b-2 border-purple-600 pb-4 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{personalInfo.fullName}</h1>
          <div className="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 mb-2">
            <span className="flex items-center"><i className="ri-mail-line mr-1"></i>{personalInfo.email}</span>
            <span className="flex items-center"><i className="ri-phone-line mr-1"></i>{personalInfo.phone}</span>
            <span className="flex items-center"><i className="ri-map-pin-line mr-1"></i>{personalInfo.address}</span>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
            {personalInfo.linkedin && <span className="flex items-center"><i className="ri-linkedin-line mr-1"></i>{personalInfo.linkedin}</span>}
            {personalInfo.github && <span className="flex items-center"><i className="ri-github-line mr-1"></i>{personalInfo.github}</span>}
            {personalInfo.website && <span className="flex items-center"><i className="ri-global-line mr-1"></i>{personalInfo.website}</span>}
          </div>
        </div>

        {/* Education */}
        {educationEntries.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-purple-600 mb-3 border-b border-gray-200 pb-1">Education</h2>
            <div className="space-y-3">
              {educationEntries.map((edu) => (
                <div key={edu.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{edu.level} - {edu.institution}</h3>
                    <p className="text-gray-600 text-sm">{edu.board}</p>
                  </div>
                  <div className="text-left sm:text-right mt-1 sm:mt-0">
                    <p className="font-medium text-gray-900 text-sm">{edu.percentage}</p>
                    <p className="text-gray-600 text-sm">{edu.year}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-purple-600 mb-3 border-b border-gray-200 pb-1">Skills</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
              {skills.map((skill) => (
                <div key={skill.id} className="flex justify-between">
                  <span className="font-medium text-gray-900 text-sm">{skill.name}</span>
                  <span className="text-orange-600 font-medium text-sm">{skill.proficiency}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-purple-600 mb-3 border-b border-gray-200 pb-1">Projects</h2>
            <div className="space-y-4">
              {projects.map((project) => (
                <div key={project.id}>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2">
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{project.title}</h3>
                    <span className="text-gray-600 text-sm mt-1 sm:mt-0">{project.duration}</span>
                  </div>
                  <p className="text-gray-600 mb-2 text-sm"><strong>Role:</strong> {project.role}</p>
                  <p className="text-gray-700 mb-2 text-sm leading-relaxed">{project.description}</p>
                  <p className="text-gray-600 mb-1 text-sm"><strong>Tech Stack:</strong> {project.techStack.join(', ')}</p>
                  {project.link && <p className="text-orange-600 text-sm"><strong>Link:</strong> {project.link}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Internships */}
        {internships.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-purple-600 mb-3 border-b border-gray-200 pb-1">Experience</h2>
            <div className="space-y-4">
              {internships.map((internship) => (
                <div key={internship.id}>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2">
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{internship.role}</h3>
                    <span className="text-gray-600 text-sm mt-1 sm:mt-0">{internship.duration}</span>
                  </div>
                  <p className="text-gray-600 mb-2 font-medium text-sm">{internship.company}</p>
                  <p className="text-gray-700 mb-2 text-sm leading-relaxed">{internship.description}</p>
                  {internship.outcome && <p className="text-gray-700 text-sm"><strong>Achievement:</strong> {internship.outcome}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Achievements */}
        {achievements.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-purple-600 mb-3 border-b border-gray-200 pb-1">Achievements</h2>
            <div className="space-y-4">
              {achievements.map((achievement) => (
                <div key={achievement.id}>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2">
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{achievement.title}</h3>
                    <span className="text-gray-600 text-sm mt-1 sm:mt-0">{new Date(achievement.date).toLocaleDateString()}</span>
                  </div>
                  <p className="text-orange-600 mb-1 font-medium text-sm">{achievement.type}</p>
                  <p className="text-gray-700 mb-2 text-sm leading-relaxed">{achievement.description}</p>
                  {achievement.link && <p className="text-orange-600 text-sm"><strong>Link:</strong> {achievement.link}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Resume Builder</h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">Create a professional resume with live preview and PDF export</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="outline" className="min-h-[44px] w-full sm:w-auto">
                <i className="ri-eye-line mr-2"></i>
                Preview
              </Button>
              <Button className="min-h-[44px] w-full sm:w-auto" onClick={handleDownloadPDF}>
                <i className="ri-download-line mr-2"></i>
                Download PDF
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 lg:gap-8">
          {/* Sidebar Navigation */}
          <div className="xl:col-span-2 order-2 xl:order-1">
            <Card noPadding className="sticky top-6">
              <div className="p-4 sm:p-6">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
                  Resume Sections
                </h3>
                <nav className="space-y-2">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`dashboard-nav-item w-full flex items-center text-sm font-medium cursor-pointer min-h-[44px] px-3 py-2 rounded-lg transition-all duration-200 ${
                        activeSection === section.id
                          ? 'bg-gradient-to-r from-purple-600 to-orange-500 text-white'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <div className="w-5 h-5 flex items-center justify-center mr-3">
                        <i className={section.icon}></i>
                      </div>
                      <span className="flex-1 text-left">{section.label}</span>
                      {completedSections.includes(section.id) && (
                        <i className="ri-check-line text-green-500 ml-2"></i>
                      )}
                    </button>
                  ))}
                </nav>
              </div>
            </Card>
          </div>

          {/* Content Area */}
          <div className="xl:col-span-3 order-1 xl:order-2">
            <div className="space-y-6">
              {/* Form Section */}
              <Card>
                <div className="p-4 sm:p-6">
                  {activeSection === 'personal' && renderPersonalInfoSection()}
                  {activeSection === 'education' && renderEducationSection()}
                  {activeSection === 'skills' && renderSkillsSection()}
                  {activeSection === 'projects' && renderProjectsSection()}
                  {activeSection === 'internships' && renderInternshipsSection()}
                  {activeSection === 'achievements' && renderAchievementsSection()}
                </div>
              </Card>

              {/* Live Preview */}
              <Card>
                <div className="p-4 sm:p-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Live Preview</h3>
                    <p className="text-gray-600 text-sm">See how your resume looks in real-time</p>
                  </div>
                  <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
                    <div className="min-w-full" style={{ minWidth: '600px' }}>
                      {renderResumePreview()}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilderPage;