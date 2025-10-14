import React from 'react';

const CookiePolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-teal-500 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-white text-center mb-4">Cookie Policy</h1>
          <p className="text-xl text-green-100 text-center">
            Learn about how we use cookies to enhance your experience on our platform.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="prose prose-lg max-w-none">
          <div className="bg-green-50 border-l-4 border-green-500 p-6 mb-8">
            <p className="text-green-800">
              <strong>Last updated:</strong> {new Date().toLocaleDateString()}
            </p>
          </div>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">1. What Are Cookies?</h2>
            <p className="text-gray-600 mb-4">
              Cookies are small text files that are placed on your computer or mobile device when 
              you visit a website. They are widely used to make websites work more efficiently and 
              provide information to website owners.
            </p>
            <p className="text-gray-600 mb-4">
              Cookies allow us to recognize you when you return to our platform, remember your 
              preferences, and provide you with a personalized learning experience.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">2. Types of Cookies We Use</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Essential Cookies</h3>
            <p className="text-gray-600 mb-4">
              These cookies are necessary for the platform to function properly. They enable core 
              functionality such as:
            </p>
            <ul className="list-disc pl-6 mb-6 text-gray-600">
              <li>User authentication and login sessions</li>
              <li>Security features and fraud prevention</li>
              <li>Basic platform functionality</li>
              <li>Form submissions and user inputs</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-4">Performance Cookies</h3>
            <p className="text-gray-600 mb-4">
              These cookies help us understand how users interact with our platform by collecting 
              anonymous information about:
            </p>
            <ul className="list-disc pl-6 mb-6 text-gray-600">
              <li>Page views and user navigation patterns</li>
              <li>Time spent on different sections</li>
              <li>Popular courses and content</li>
              <li>Error messages and technical issues</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-4">Functional Cookies</h3>
            <p className="text-gray-600 mb-4">
              These cookies enable enhanced functionality and personalization:
            </p>
            <ul className="list-disc pl-6 mb-6 text-gray-600">
              <li>Language preferences and settings</li>
              <li>Course progress and bookmarks</li>
              <li>User interface customizations</li>
              <li>Remember me functionality</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-4">Targeting/Advertising Cookies</h3>
            <p className="text-gray-600 mb-4">
              These cookies are used to deliver relevant content and advertisements:
            </p>
            <ul className="list-disc pl-6 mb-6 text-gray-600">
              <li>Personalized course recommendations</li>
              <li>Targeted educational content</li>
              <li>Marketing campaign effectiveness</li>
              <li>Social media integration</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">3. Third-Party Cookies</h2>
            <p className="text-gray-600 mb-4">
              We work with trusted third-party services that may also set cookies on your device. 
              These include:
            </p>
            
            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h4 className="font-semibold text-gray-800 mb-3">Analytics Services</h4>
              <ul className="list-disc pl-6 text-gray-600">
                <li><strong>Google Analytics:</strong> Helps us understand user behavior and improve our platform</li>
                <li><strong>Mixpanel:</strong> Provides detailed user interaction analytics</li>
              </ul>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h4 className="font-semibold text-gray-800 mb-3">Communication Tools</h4>
              <ul className="list-disc pl-6 text-gray-600">
                <li><strong>Intercom:</strong> Powers our customer support chat</li>
                <li><strong>Mailchimp:</strong> Manages our email communications</li>
              </ul>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h4 className="font-semibold text-gray-800 mb-3">Video Services</h4>
              <ul className="list-disc pl-6 text-gray-600">
                <li><strong>YouTube:</strong> Embedded video content and lessons</li>
                <li><strong>Vimeo:</strong> Additional video hosting services</li>
              </ul>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">4. Managing Your Cookie Preferences</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Browser Settings</h3>
            <p className="text-gray-600 mb-4">
              Most web browsers allow you to control cookies through their settings. You can:
            </p>
            <ul className="list-disc pl-6 mb-6 text-gray-600">
              <li>View which cookies are stored on your device</li>
              <li>Delete existing cookies</li>
              <li>Block all or specific cookies</li>
              <li>Set preferences for cookie acceptance</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-4">Cookie Consent</h3>
            <p className="text-gray-600 mb-4">
              When you first visit our platform, you'll see a cookie consent banner. You can:
            </p>
            <ul className="list-disc pl-6 mb-6 text-gray-600">
              <li>Accept all cookies for full functionality</li>
              <li>Reject non-essential cookies</li>
              <li>Customize your cookie preferences</li>
              <li>Change your preferences at any time in your account settings</li>
            </ul>

            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6">
              <p className="text-yellow-800">
                <strong>Note:</strong> Disabling certain cookies may affect the functionality of our 
                platform and your learning experience. Essential cookies cannot be disabled as they 
                are necessary for the platform to work properly.
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">5. Cookie Retention</h2>
            <p className="text-gray-600 mb-4">
              Different cookies have different lifespans:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-3">Session Cookies</h4>
                <p className="text-gray-600">
                  Temporary cookies that are deleted when you close your browser. 
                  Used for login sessions and temporary preferences.
                </p>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-3">Persistent Cookies</h4>
                <p className="text-gray-600">
                  Remain on your device for a set period (typically 30 days to 2 years). 
                  Used for remembering preferences and analytics.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">6. Data Protection</h2>
            <p className="text-gray-600 mb-4">
              We are committed to protecting your personal data and respecting your privacy rights. 
              Our use of cookies complies with applicable data protection laws, including:
            </p>
            <ul className="list-disc pl-6 mb-6 text-gray-600">
              <li>General Data Protection Regulation (GDPR)</li>
              <li>California Consumer Privacy Act (CCPA)</li>
              <li>Other applicable regional privacy laws</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">7. Updates to This Policy</h2>
            <p className="text-gray-600 mb-4">
              We may update this Cookie Policy from time to time to reflect changes in technology, 
              legislation, or our business practices. We will notify you of any significant changes 
              through our platform or by email.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">8. Contact Us</h2>
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-gray-600 mb-4">
                If you have any questions about our use of cookies or this Cookie Policy, 
                please contact us:
              </p>
              <div className="space-y-2 text-gray-600">
                <p><strong>Email:</strong> cookies@dcode.com</p>
                <p><strong>Phone:</strong> +1 (555) 123-4567</p>
                <p><strong>Address:</strong> 123 Education Street, San Francisco, CA 94102</p>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-gray-600 text-sm">
                  You can also manage your cookie preferences by visiting your account settings 
                  or using the cookie preference center available on our platform.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicyPage;