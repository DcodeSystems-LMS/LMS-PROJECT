import React from 'react';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-white text-center mb-4">Privacy Policy</h1>
          <p className="text-xl text-purple-100 text-center">
            Your privacy is important to us. Learn how we collect, use, and protect your information.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="prose prose-lg max-w-none">
          <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-8">
            <p className="text-blue-800">
              <strong>Last updated:</strong> {new Date().toLocaleDateString()}
            </p>
          </div>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">1. Information We Collect</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Personal Information</h3>
            <p className="text-gray-600 mb-4">
              We collect information you provide directly to us, such as when you create an account, 
              enroll in courses, or contact us. This may include:
            </p>
            <ul className="list-disc pl-6 mb-6 text-gray-600">
              <li>Name and contact information (email, phone number)</li>
              <li>Educational background and professional experience</li>
              <li>Payment information for course purchases</li>
              <li>Profile information and preferences</li>
              <li>Communications with us</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-4">Usage Information</h3>
            <p className="text-gray-600 mb-4">
              We automatically collect certain information about your use of our platform:
            </p>
            <ul className="list-disc pl-6 mb-6 text-gray-600">
              <li>Learning progress and course completion data</li>
              <li>Device information and browser type</li>
              <li>IP address and location information</li>
              <li>Usage patterns and preferences</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">2. How We Use Your Information</h2>
            <p className="text-gray-600 mb-4">We use the information we collect to:</p>
            <ul className="list-disc pl-6 mb-6 text-gray-600">
              <li>Provide and improve our educational services</li>
              <li>Process payments and manage your account</li>
              <li>Personalize your learning experience</li>
              <li>Send you course updates and notifications</li>
              <li>Respond to your questions and provide support</li>
              <li>Analyze usage patterns to enhance our platform</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">3. Information Sharing</h2>
            <p className="text-gray-600 mb-4">
              We do not sell, trade, or otherwise transfer your personal information to third parties, 
              except in the following circumstances:
            </p>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Service Providers</h3>
            <p className="text-gray-600 mb-4">
              We may share information with trusted third-party service providers who assist us in 
              operating our platform, conducting business, or serving you.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-4">Legal Requirements</h3>
            <p className="text-gray-600 mb-6">
              We may disclose information when required by law or to protect our rights, 
              property, or safety, or that of others.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">4. Data Security</h2>
            <p className="text-gray-600 mb-4">
              We implement appropriate security measures to protect your personal information against 
              unauthorized access, alteration, disclosure, or destruction. These measures include:
            </p>
            <ul className="list-disc pl-6 mb-6 text-gray-600">
              <li>Encryption of sensitive data</li>
              <li>Regular security assessments</li>
              <li>Access controls and authentication</li>
              <li>Secure data storage and transmission</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">5. Your Rights</h2>
            <p className="text-gray-600 mb-4">You have the right to:</p>
            <ul className="list-disc pl-6 mb-6 text-gray-600">
              <li>Access and update your personal information</li>
              <li>Request deletion of your account and data</li>
              <li>Opt out of marketing communications</li>
              <li>Request a copy of your data</li>
              <li>Withdraw consent where applicable</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">6. Cookies and Tracking</h2>
            <p className="text-gray-600 mb-4">
              We use cookies and similar technologies to enhance your experience on our platform. 
              For detailed information about our use of cookies, please see our Cookie Policy.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">7. Children's Privacy</h2>
            <p className="text-gray-600 mb-4">
              Our services are not intended for children under 13 years of age. We do not knowingly 
              collect personal information from children under 13. If we become aware that we have 
              collected such information, we will take steps to delete it.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">8. Changes to This Policy</h2>
            <p className="text-gray-600 mb-4">
              We may update this Privacy Policy from time to time. We will notify you of any changes 
              by posting the new Privacy Policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">9. Contact Us</h2>
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-gray-600 mb-4">
                If you have any questions about this Privacy Policy or our privacy practices, 
                please contact us:
              </p>
              <div className="space-y-2 text-gray-600">
                <p><strong>Email:</strong> privacy@dcode.com</p>
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

export default PrivacyPolicyPage;