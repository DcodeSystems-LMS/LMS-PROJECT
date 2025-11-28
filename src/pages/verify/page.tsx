
import Header from '@/components/feature/Header';
import Footer from '@/components/feature/Footer';
import Card from '@/components/base/Card';
import Button from '@/components/base/Button';

export default function VerifyPage() {
  const { id } = useParams();
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'valid' | 'invalid'>('loading');
  const [certificateData, setCertificateData] = useState<any>(null);

  useEffect(() => {
    // Simulate certificate verification
    const verifyCertificate = async () => {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock verification logic
      const validIds = ['cert123', 'cert456', 'cert789'];
      
      if (validIds.includes(id || '')) {
        setVerificationStatus('valid');
        setCertificateData({
          id: id,
          studentName: 'John Doe',
          courseName: 'Complete React Development',
          completionDate: '2024-01-15',
          instructor: 'Sarah Johnson',
          grade: 'A+',
          credentialId: `DCODE-${id?.toUpperCase()}-2024`,
          issueDate: '2024-01-15'
        });
      } else {
        setVerificationStatus('invalid');
      }
    };

    verifyCertificate();
  }, [id]);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="pt-20">
        <section className="py-20">
          <div className="container mx-auto px-6">
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Certificate Verification
                </h1>
                <p className="text-gray-600">
                  Verify the authenticity of DCODE certificates
                </p>
              </div>

              <Card>
                {verificationStatus === 'loading' && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Verifying Certificate</h3>
                    <p className="text-gray-600">Please wait while we verify the certificate...</p>
                  </div>
                )}

                {verificationStatus === 'valid' && certificateData && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <i className="ri-shield-check-line text-3xl text-green-600"></i>
                    </div>
                    
                    <h3 className="text-2xl font-bold text-green-600 mb-2">Certificate Verified ✓</h3>
                    <p className="text-gray-600 mb-8">This certificate is authentic and valid.</p>
                    
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-8 text-left mb-6">
                      <div className="border-b border-gray-200 pb-4 mb-4">
                        <h4 className="text-xl font-bold text-gray-900 mb-2">Certificate Details</h4>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Student Name</p>
                          <p className="font-semibold text-gray-900">{certificateData.studentName}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Course</p>
                          <p className="font-semibold text-gray-900">{certificateData.courseName}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Completion Date</p>
                          <p className="font-semibold text-gray-900">{new Date(certificateData.completionDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Grade</p>
                          <p className="font-semibold text-gray-900">{certificateData.grade}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Instructor</p>
                          <p className="font-semibold text-gray-900">{certificateData.instructor}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Credential ID</p>
                          <p className="font-semibold text-gray-900">{certificateData.credentialId}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-4 justify-center">
                      <Button onClick={() => window.print()}>
                        <i className="ri-printer-line mr-2"></i>
                        Print Certificate
                      </Button>
                      <Button variant="outline" onClick={() => navigator.share?.({ 
                        title: 'DCODE Certificate Verification', 
                        url: window.location.href 
                      })}>
                        <i className="ri-share-line mr-2"></i>
                        Share
                      </Button>
                    </div>
                  </div>
                )}

                {verificationStatus === 'invalid' && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <i className="ri-close-circle-line text-3xl text-red-600"></i>
                    </div>
                    
                    <h3 className="text-2xl font-bold text-red-600 mb-2">Certificate Invalid</h3>
                    <p className="text-gray-600 mb-8">
                      The certificate ID "{id}" could not be verified. This may be due to:
                    </p>
                    
                    <div className="text-left bg-red-50 rounded-lg p-6 mb-6">
                      <ul className="space-y-2 text-gray-700">
                        <li className="flex items-center">
                          <i className="ri-error-warning-line text-red-500 mr-2"></i>
                          Invalid or expired certificate ID
                        </li>
                        <li className="flex items-center">
                          <i className="ri-error-warning-line text-red-500 mr-2"></i>
                          Certificate has been revoked
                        </li>
                        <li className="flex items-center">
                          <i className="ri-error-warning-line text-red-500 mr-2"></i>
                          Typing error in the certificate ID
                        </li>
                      </ul>
                    </div>
                    
                    <div className="flex gap-4 justify-center">
                      <Button onClick={() => window.location.reload()}>
                        Try Again
                      </Button>
                      <Button variant="outline" onClick={() => window.history.back()}>
                        Go Back
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
