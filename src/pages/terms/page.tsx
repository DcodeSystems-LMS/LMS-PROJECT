import React from 'react';

const TermsOfServicePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-white text-center mb-4">Terms of Service</h1>
          <p className="text-xl text-orange-100 text-center">
            Please read these terms carefully before using our platform.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="prose prose-lg max-w-none">
          <div className="bg-orange-50 border-l-4 border-orange-500 p-6 mb-8">
            <p className="text-orange-800">
              <strong>Last updated:</strong> {new Date().toLocaleDateString()}
            </p>
          </div>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">1. Acceptance of Terms</h2>
            <p className="text-gray-600 mb-4">
              By accessing and using DCODE's educational platform, you accept and agree to be bound 
              by the terms and provision of this agreement. If you do not agree to abide by the above, 
              please do not use this service.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">2. Description of Service</h2>
            <p className="text-gray-600 mb-4">
              DCODE provides an online learning platform that offers:
            </p>
            <ul className="list-disc pl-6 mb-6 text-gray-600">
              <li>Interactive coding courses and tutorials</li>
              <li>Mentorship programs and one-on-one sessions</li>
              <li>Assessment tools and progress tracking</li>
              <li>Community features and peer interaction</li>
              <li>Placement assistance and career guidance</li>
              <li>Certification upon course completion</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">3. User Accounts</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Registration</h3>
            <p className="text-gray-600 mb-4">
              To access certain features, you must register for an account. You agree to:
            </p>
            <ul className="list-disc pl-6 mb-6 text-gray-600">
              <li>Provide accurate and complete information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Update your information as necessary</li>
              <li>Be responsible for all activities under your account</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-4">Account Types</h3>
            <p className="text-gray-600 mb-4">We offer three types of accounts:</p>
            <ul className="list-disc pl-6 mb-6 text-gray-600">
              <li><strong>Student Accounts:</strong> Access to courses, assessments, and learning materials</li>
              <li><strong>Mentor Accounts:</strong> Ability to create courses, conduct sessions, and provide guidance</li>
              <li><strong>Admin Accounts:</strong> Platform management and oversight capabilities</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">4. User Conduct</h2>
            <p className="text-gray-600 mb-4">You agree not to:</p>
            <ul className="list-disc pl-6 mb-6 text-gray-600">
              <li>Use the platform for any unlawful purposes</li>
              <li>Interfere with or disrupt the service or servers</li>
              <li>Upload malicious code or harmful content</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Share inappropriate or offensive content</li>
              <li>Violate intellectual property rights</li>
              <li>Attempt to gain unauthorized access to accounts or systems</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">5. Payment Terms</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Course Fees</h3>
            <p className="text-gray-600 mb-4">
              Some courses require payment. By purchasing a course, you agree to:
            </p>
            <ul className="list-disc pl-6 mb-6 text-gray-600">
              <li>Pay all applicable fees and taxes</li>
              <li>Provide accurate payment information</li>
              <li>Accept our refund and cancellation policy</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-4">Refund Policy</h3>
            <p className="text-gray-600 mb-4">
              We offer refunds within 30 days of purchase if:
            </p>
            <ul className="list-disc pl-6 mb-6 text-gray-600">
              <li>You have completed less than 25% of the course content</li>
              <li>You request the refund within the 30-day window</li>
              <li>The course has significant technical issues we cannot resolve</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">6. Intellectual Property</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Our Content</h3>
            <p className="text-gray-600 mb-4">
              All content on the platform, including courses, materials, and assessments, is owned 
              by DCODE or our content partners and is protected by copyright and other intellectual 
              property laws.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-4">User Content</h3>
            <p className="text-gray-600 mb-4">
              By submitting content to our platform, you grant us a non-exclusive, worldwide, 
              royalty-free license to use, modify, and distribute your content in connection with 
              our services.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">7. Privacy</h2>
            <p className="text-gray-600 mb-4">
              Your privacy is important to us. Our collection and use of personal information is 
              governed by our Privacy Policy, which is incorporated into these terms by reference.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">8. Disclaimer of Warranties</h2>
            <p className="text-gray-600 mb-4">
              The platform is provided "as is" without warranties of any kind, either express or 
              implied. We do not warrant that the service will be uninterrupted, error-free, or 
              completely secure.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">9. Limitation of Liability</h2>
            <p className="text-gray-600 mb-4">
              In no event shall DCODE be liable for any indirect, incidental, special, consequential, 
              or punitive damages, including without limitation, loss of profits, data, use, goodwill, 
              or other intangible losses.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">10. Termination</h2>
            <p className="text-gray-600 mb-4">
              We may terminate or suspend your account and access to the platform immediately, 
              without prior notice, for any reason, including breach of these terms.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">11. Changes to Terms</h2>
            <p className="text-gray-600 mb-4">
              We reserve the right to modify these terms at any time. We will notify users of 
              significant changes via email or platform notification.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">12. Contact Information</h2>
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-gray-600 mb-4">
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <div className="space-y-2 text-gray-600">
                <p><strong>Email:</strong> legal@dcode.com</p>
                <p><strong>Phone:</strong> +1 (555) 123-4567</p>
                <p><strong>Address:</strong> 123 Education Street, San Francisco, CA 94102</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfServicePage;