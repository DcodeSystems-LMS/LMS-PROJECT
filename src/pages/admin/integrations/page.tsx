import { useState } from 'react';
import Card from '@/components/base/Card';
import Button from '@/components/base/Button';
import Modal from '@/components/base/Modal';

interface Integration {
  id: string;
  name: string;
  type: 'sso' | 'payment' | 'lti' | 'webhook';
  provider: string;
  status: 'active' | 'inactive' | 'error';
  description: string;
  lastSync?: string;
  config?: any;
}

// Integration data will be fetched from Supabase
const defaultIntegrations: Integration[] = [];

const integrationTypes = [
  { key: 'sso', label: 'SSO', icon: 'ri-shield-user-line', color: 'text-blue-600' },
  { key: 'payment', label: 'Payments', icon: 'ri-money-dollar-circle-line', color: 'text-green-600' },
  { key: 'lti', label: 'LTI', icon: 'ri-links-line', color: 'text-purple-600' },
  { key: 'webhook', label: 'Webhooks', icon: 'ri-webhook-line', color: 'text-orange-600' }
];

export default function AdminIntegrationsPage() {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [integrations, setIntegrations] = useState<Integration[]>(defaultIntegrations);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedIntegrationType, setSelectedIntegrationType] = useState<string | null>(null);

  const filteredIntegrations = activeTab === 'all' 
    ? integrations 
    : integrations.filter(integration => integration.type === activeTab);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'inactive': return 'text-gray-600 bg-gray-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return 'ri-check-circle-line';
      case 'inactive': return 'ri-pause-circle-line';
      case 'error': return 'ri-error-warning-line';
      default: return 'ri-question-line';
    }
  };

  const toggleIntegrationStatus = (id: string) => {
    setIntegrations(prev => prev.map(integration => {
      if (integration.id === id) {
        const newStatus = integration.status === 'active' ? 'inactive' : 'active';
        return { ...integration, status: newStatus };
      }
      return integration;
    }));
  };

  const deleteIntegration = (id: string) => {
    setIntegrations(prev => prev.filter(integration => integration.id !== id));
    setIsDeleteModalOpen(false);
    setSelectedIntegration(null);
  };

  const formatLastSync = (dateString?: string) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const handleIntegrationTypeSelect = (type: string) => {
    setSelectedIntegrationType(type);
    // Create a new integration template based on type
    const newIntegration: Partial<Integration> = {
      type: type as Integration['type'],
      status: 'inactive',
      config: {}
    };

    // Set default values based on integration type
    switch (type) {
      case 'lti':
        newIntegration.name = 'New LTI Integration';
        newIntegration.provider = 'Custom LMS';
        newIntegration.description = 'Learning Tools Interoperability integration';
        newIntegration.config = {
          ltiVersion: '1.3',
          consumerKey: '',
          sharedSecret: '',
          launchUrl: '',
          deploymentId: ''
        };
        break;
      case 'sso':
        newIntegration.name = 'New SSO Integration';
        newIntegration.provider = 'Custom SSO';
        newIntegration.description = 'Single Sign-On integration';
        newIntegration.config = {
          clientId: '',
          clientSecret: '',
          domain: '',
          redirectUri: ''
        };
        break;
      case 'payment':
        newIntegration.name = 'New Payment Integration';
        newIntegration.provider = 'Payment Gateway';
        newIntegration.description = 'Payment processing integration';
        newIntegration.config = {
          apiKey: '',
          merchantId: '',
          currency: 'USD',
          mode: 'test'
        };
        break;
      case 'webhook':
        newIntegration.name = 'New Webhook Integration';
        newIntegration.provider = 'Custom Webhook';
        newIntegration.description = 'External webhook integration';
        newIntegration.config = {
          endpoint: '',
          secret: '',
          events: []
        };
        break;
    }

    setSelectedIntegration(newIntegration as Integration);
  };

  const saveIntegration = () => {
    if (selectedIntegration) {
      if (selectedIntegration.id) {
        // Update existing integration
        setIntegrations(prev => prev.map(integration => 
          integration.id === selectedIntegration.id ? selectedIntegration : integration
        ));
      } else {
        // Add new integration
        const newIntegration = {
          ...selectedIntegration,
          id: Date.now().toString()
        };
        setIntegrations(prev => [...prev, newIntegration]);
      }
    }
    setIsConfigModalOpen(false);
    setSelectedIntegration(null);
    setSelectedIntegrationType(null);
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Integrations & LTI Tools</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Manage external integrations and tools</p>
        </div>
        <Button variant="brand" onClick={() => setIsConfigModalOpen(true)} className="w-full sm:w-auto">
          <i className="ri-add-line mr-2"></i>
          Add Integration
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
        {integrationTypes.map((type) => {
          const count = integrations.filter(i => i.type === type.key).length;
          const activeCount = integrations.filter(i => i.type === type.key && i.status === 'active').length;
          
          return (
            <Card key={type.key} className="p-4 sm:p-6">
              <div className="flex items-center">
                <div className={`p-2 sm:p-3 rounded-lg bg-gray-50 mr-3 sm:mr-4 flex-shrink-0`}>
                  <i className={`${type.icon} text-lg sm:text-xl ${type.color}`}></i>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">{type.label}</p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900">{activeCount}/{count}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-4 sm:space-x-8 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setActiveTab('all')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 whitespace-nowrap flex-shrink-0 ${
              activeTab === 'all'
                ? 'border-brand-primary text-brand-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            All ({integrations.length})
          </button>
          {integrationTypes.map((type) => (
            <button
              key={type.key}
              onClick={() => setActiveTab(type.key)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 flex items-center whitespace-nowrap flex-shrink-0 ${
                activeTab === type.key
                  ? 'border-brand-primary text-brand-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <i className={`${type.icon} mr-1 sm:mr-2 ${type.color} text-sm sm:text-base`}></i>
              <span className="hidden sm:inline">{type.label}</span>
              <span className="sm:hidden">{type.label}</span>
              <span className="ml-1">({integrations.filter(i => i.type === type.key).length})</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Integrations List */}
      <div className="grid gap-6">
        {filteredIntegrations.map((integration) => {
          const typeInfo = integrationTypes.find(t => t.key === integration.type);
          
          return (
            <Card key={integration.id} className="p-4 sm:p-6 hover:shadow-md transition-shadow duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-start sm:items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                  <div className="p-2 sm:p-3 rounded-lg bg-gray-50 flex-shrink-0">
                    <i className={`${typeInfo?.icon} text-lg sm:text-xl ${typeInfo?.color}`}></i>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">{integration.name}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium w-fit ${getStatusColor(integration.status)}`}>
                        <i className={`${getStatusIcon(integration.status)} mr-1`}></i>
                        {integration.status}
                      </span>
                    </div>
                    <p className="text-sm sm:text-base text-gray-600 mt-1 line-clamp-2">{integration.description}</p>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-2 text-xs sm:text-sm text-gray-500">
                      <span>Provider: {integration.provider}</span>
                      <span className="hidden sm:inline">•</span>
                      <span>Last sync: {formatLastSync(integration.lastSync)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setSelectedIntegration(integration);
                      setIsConfigModalOpen(true);
                    }}
                    className="flex-1 sm:flex-none"
                  >
                    <i className="ri-settings-line mr-1 sm:mr-2"></i>
                    <span className="hidden sm:inline">Configure</span>
                    <span className="sm:hidden">Config</span>
                  </Button>
                  
                  <Button
                    variant={integration.status === 'active' ? 'danger-outline' : 'brand-outline'}
                    size="sm"
                    onClick={() => toggleIntegrationStatus(integration.id)}
                    className="flex-1 sm:flex-none"
                  >
                    {integration.status === 'active' ? (
                      <>
                        <i className="ri-pause-line mr-1 sm:mr-2"></i>
                        <span className="hidden sm:inline">Disable</span>
                        <span className="sm:hidden">Off</span>
                      </>
                    ) : (
                      <>
                        <i className="ri-play-line mr-1 sm:mr-2"></i>
                        <span className="hidden sm:inline">Enable</span>
                        <span className="sm:hidden">On</span>
                      </>
                    )}
                  </Button>
                  
                  <Button
                    variant="danger-outline"
                    size="sm"
                    onClick={() => {
                      setSelectedIntegration(integration);
                      setIsDeleteModalOpen(true);
                    }}
                    className="flex-shrink-0"
                  >
                    <i className="ri-delete-bin-line"></i>
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Configuration Modal */}
      <Modal
        isOpen={isConfigModalOpen}
        onClose={() => {
          setIsConfigModalOpen(false);
          setSelectedIntegration(null);
          setSelectedIntegrationType(null);
        }}
        title={selectedIntegration?.id ? `Configure ${selectedIntegration.name}` : 'Add New Integration'}
        size="lg"
      >
        <div className="space-y-6">
          {!selectedIntegrationType && !selectedIntegration?.id ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {integrationTypes.map((type) => (
                <button
                  key={type.key}
                  onClick={() => handleIntegrationTypeSelect(type.key)}
                  className="p-4 sm:p-6 border-2 border-gray-200 rounded-lg hover:border-brand-primary hover:bg-brand-50 transition-all duration-200 text-left w-full"
                >
                  <div className="flex items-center space-x-3">
                    <i className={`${type.icon} text-xl sm:text-2xl ${type.color} flex-shrink-0`}></i>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium text-gray-900 text-sm sm:text-base">{type.label}</h3>
                      <p className="text-xs sm:text-sm text-gray-600 mt-1 break-words">
                        {type.key === 'sso' && 'Single Sign-On providers'}
                        {type.key === 'payment' && 'Payment processors'}
                        {type.key === 'lti' && 'Learning Tools Interoperability'}
                        {type.key === 'webhook' && 'External webhooks'}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Integration Name
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-brand-primary focus:border-brand-primary text-sm"
                  value={selectedIntegration?.name || ''}
                  onChange={(e) => setSelectedIntegration(prev => prev ? {...prev, name: e.target.value} : null)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Provider
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-brand-primary focus:border-brand-primary text-sm"
                  value={selectedIntegration?.provider || ''}
                  onChange={(e) => setSelectedIntegration(prev => prev ? {...prev, provider: e.target.value} : null)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-brand-primary focus:border-brand-primary text-sm"
                  value={selectedIntegration?.description || ''}
                  onChange={(e) => setSelectedIntegration(prev => prev ? {...prev, description: e.target.value} : null)}
                />
              </div>

              {/* LTI Specific Configuration */}
              {selectedIntegration?.type === 'lti' && (
                <>
                  <div className="border-t pt-4">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">LTI Configuration</h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          LTI Version
                        </label>
                        <select
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-brand-primary focus:border-brand-primary text-sm pr-8"
                          value={selectedIntegration.config?.ltiVersion || '1.3'}
                          onChange={(e) => setSelectedIntegration(prev => prev ? {
                            ...prev,
                            config: { ...prev.config, ltiVersion: e.target.value }
                          } : null)}
                        >
                          <option value="1.1">LTI 1.1</option>
                          <option value="1.3">LTI 1.3</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Deployment ID
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-brand-primary focus:border-brand-primary text-sm"
                          value={selectedIntegration.config?.deploymentId || ''}
                          onChange={(e) => setSelectedIntegration(prev => prev ? {
                            ...prev,
                            config: { ...prev.config, deploymentId: e.target.value }
                          } : null)}
                          placeholder="e.g., canvas-123"
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Launch URL
                      </label>
                      <input
                        type="url"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-brand-primary focus:border-brand-primary text-sm"
                        value={selectedIntegration.config?.launchUrl || ''}
                        onChange={(e) => setSelectedIntegration(prev => prev ? {
                          ...prev,
                          config: { ...prev.config, launchUrl: e.target.value }
                        } : null)}
                        placeholder="https://your-lms.com/api/lti/launch"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Consumer Key
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-brand-primary focus:border-brand-primary text-sm"
                          value={selectedIntegration.config?.consumerKey || ''}
                          onChange={(e) => setSelectedIntegration(prev => prev ? {
                            ...prev,
                            config: { ...prev.config, consumerKey: e.target.value }
                          } : null)}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Shared Secret
                        </label>
                        <input
                          type="password"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-brand-primary focus:border-brand-primary text-sm"
                          value={selectedIntegration.config?.sharedSecret || ''}
                          onChange={(e) => setSelectedIntegration(prev => prev ? {
                            ...prev,
                            config: { ...prev.config, sharedSecret: e.target.value }
                          } : null)}
                        />
                      </div>
                    </div>

                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-start">
                        <i className="ri-information-line text-blue-600 mr-2 mt-0.5"></i>
                        <div className="text-sm text-blue-800">
                          <p className="font-medium mb-1">LTI Integration Setup:</p>
                          <ul className="list-disc list-inside space-y-1 text-blue-700">
                            <li>Configure your LMS to use this tool with the provided consumer key</li>
                            <li>Set the launch URL in your LMS configuration</li>
                            <li>Ensure grade passback is enabled if needed</li>
                            <li>Test the integration before activating</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* SSO Specific Configuration */}
              {selectedIntegration?.type === 'sso' && (
                <>
                  <div className="border-t pt-4">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">SSO Configuration</h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Client ID
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-brand-primary focus:border-brand-primary text-sm"
                          value={selectedIntegration.config?.clientId || ''}
                          onChange={(e) => setSelectedIntegration(prev => prev ? {
                            ...prev,
                            config: { ...prev.config, clientId: e.target.value }
                          } : null)}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Domain
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-brand-primary focus:border-brand-primary text-sm"
                          value={selectedIntegration.config?.domain || ''}
                          onChange={(e) => setSelectedIntegration(prev => prev ? {
                            ...prev,
                            config: { ...prev.config, domain: e.target.value }
                          } : null)}
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Webhook Specific Configuration */}
              {selectedIntegration?.type === 'webhook' && (
                <>
                  <div className="border-t pt-4">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Webhook Configuration</h4>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Webhook URL
                      </label>
                      <input
                        type="url"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-brand-primary focus:border-brand-primary text-sm"
                        value={selectedIntegration.config?.endpoint || ''}
                        onChange={(e) => setSelectedIntegration(prev => prev ? {
                          ...prev,
                          config: { ...prev.config, endpoint: e.target.value }
                        } : null)}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Payment Specific Configuration */}
              {selectedIntegration?.type === 'payment' && (
                <>
                  <div className="border-t pt-4">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Payment Configuration</h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          API Key
                        </label>
                        <input
                          type="password"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-brand-primary focus:border-brand-primary text-sm"
                          value={selectedIntegration.config?.apiKey || ''}
                          onChange={(e) => setSelectedIntegration(prev => prev ? {
                            ...prev,
                            config: { ...prev.config, apiKey: e.target.value }
                          } : null)}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Currency
                        </label>
                        <select
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-brand-primary focus:border-brand-primary text-sm pr-8"
                          value={selectedIntegration.config?.currency || 'USD'}
                          onChange={(e) => setSelectedIntegration(prev => prev ? {
                            ...prev,
                            config: { ...prev.config, currency: e.target.value }
                          } : null)}
                        >
                          <option value="USD">USD</option>
                          <option value="EUR">EUR</option>
                          <option value="GBP">GBP</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t">
            <Button
              variant="secondary"
              onClick={() => {
                setIsConfigModalOpen(false);
                setSelectedIntegration(null);
                setSelectedIntegrationType(null);
              }}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            {(selectedIntegrationType || selectedIntegration?.id) && (
              <Button variant="brand" onClick={saveIntegration} className="w-full sm:w-auto">
                {selectedIntegration?.id ? 'Save Changes' : 'Add Integration'}
              </Button>
            )}
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedIntegration(null);
        }}
        title="Delete Integration"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete <strong>{selectedIntegration?.name}</strong>? 
            This action cannot be undone and may affect connected services.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t">
            <Button
              variant="secondary"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setSelectedIntegration(null);
              }}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => selectedIntegration && deleteIntegration(selectedIntegration.id)}
              className="w-full sm:w-auto"
            >
              Delete Integration
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}