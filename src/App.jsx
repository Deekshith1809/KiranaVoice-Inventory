import React, { useState } from 'react';
import { InventoryProvider } from './context/InventoryContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { VoiceAssistantModal } from './components/VoiceAssistantModal';
import { AddProductModal } from './views/AddProductModal';
import { FloatingHelpButton } from './components/FloatingHelpButton';
import { SupportPanelModal } from './components/SupportPanelModal';
import { RequestCallbackModal } from './components/RequestCallbackModal';
import { EmailSupportModal } from './components/EmailSupportModal';
import { OnboardingWizard } from './components/OnboardingWizard';
import { DashboardView } from './views/DashboardView';
import { InventoryView } from './views/InventoryView';
import { KhataView } from './views/KhataView';
import { ScanView } from './views/ScanView';
import { SupportView } from './views/SupportView';
import { TransactionsView } from './views/TransactionsView';
import { AlertsView } from './views/AlertsView';
import { SettingsView } from './views/SettingsView';
import { ProfileView } from './views/ProfileView';

// Auth Views
import { LoginView } from './views/LoginView';
import { RegisterView } from './views/RegisterView';
import { ForgotPasswordView } from './views/ForgotPasswordView';
import { ResetPasswordView } from './views/ResetPasswordView';

function AppShell() {
  const { isAuthenticated, authLoading } = useAuth();

  // Auth sub-view state for public routing
  const [authView, setAuthView] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('reset_token')) return 'reset-password';
    return 'login';
  });
  
  const [resetToken, setResetToken] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('reset_token') || '';
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Module 5 Support Modals
  const [isSupportPanelOpen, setIsSupportPanelOpen] = useState(false);
  const [isCallbackModalOpen, setIsCallbackModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [selectedCallbackCategory, setSelectedCallbackCategory] = useState(null);

  if (authLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0f172a',
        color: '#f8fafc',
        fontFamily: 'sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid rgba(99, 102, 241, 0.2)',
            borderTopColor: '#6366f1',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem auto'
          }} />
          <p>Initializing KiranaVoice Inventory...</p>
        </div>
      </div>
    );
  }

  // Render Public Auth Views if Not Authenticated
  if (!isAuthenticated) {
    if (authView === 'register') {
      return <RegisterView onNavigateToLogin={() => setAuthView('login')} />;
    }
    if (authView === 'forgot-password') {
      return <ForgotPasswordView onNavigateToLogin={() => setAuthView('login')} />;
    }
    if (authView === 'reset-password') {
      return (
        <ResetPasswordView 
          resetToken={resetToken} 
          onNavigateToLogin={() => {
            setAuthView('login');
            window.history.replaceState({}, document.title, window.location.pathname);
          }} 
        />
      );
    }
    return (
      <LoginView 
        onNavigateToRegister={() => setAuthView('register')}
        onNavigateToForgot={() => setAuthView('forgot-password')}
      />
    );
  }

  const handleOpenEditProduct = (product) => {
    setEditingProduct(product);
    setIsAddProductOpen(true);
  };

  const handleCloseAddProduct = () => {
    setIsAddProductOpen(false);
    setEditingProduct(null);
  };

  return (
    <div className="app-shell">
      <Header 
        onOpenVoice={() => setIsVoiceOpen(true)} 
        activeTab={activeTab} 
        onNavigate={(tab) => setActiveTab(tab)}
      />

      <Navigation 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
      />

      <main className="app-main-content">
        {activeTab === 'dashboard' && (
          <DashboardView 
            onOpenVoice={() => setIsVoiceOpen(true)}
            onOpenAddProduct={() => setIsAddProductOpen(true)}
            onNavigate={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'inventory' && (
          <InventoryView 
            onOpenAddProduct={() => setIsAddProductOpen(true)}
            onOpenVoice={() => setIsVoiceOpen(true)}
            onEditProduct={handleOpenEditProduct}
          />
        )}

        {activeTab === 'khata' && (
          <KhataView 
            onOpenVoice={() => setIsVoiceOpen(true)}
          />
        )}

        {activeTab === 'scan' && (
          <ScanView 
            onNavigate={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'support' && (
          <SupportView 
            onRequestCallback={() => setIsCallbackModalOpen(true)}
            onEmailSupport={() => setIsEmailModalOpen(true)}
          />
        )}

        {activeTab === 'transactions' && (
          <TransactionsView />
        )}

        {activeTab === 'alerts' && (
          <AlertsView 
            onOpenVoice={() => setIsVoiceOpen(true)}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileView />
        )}

        {activeTab === 'settings' && (
          <SettingsView />
        )}
      </main>

      {/* Floating Help Button (?) */}
      <FloatingHelpButton 
        onClick={() => setIsSupportPanelOpen(true)}
      />

      {/* Support Panel Modal */}
      <SupportPanelModal 
        isOpen={isSupportPanelOpen}
        onClose={() => setIsSupportPanelOpen(false)}
        onRequestCallback={() => setIsCallbackModalOpen(true)}
        onEmailSupport={() => setIsEmailModalOpen(true)}
        onVoiceSupport={() => setIsVoiceOpen(true)}
        onOpenFaq={() => setActiveTab('support')}
      />

      {/* Request a Call Modal */}
      <RequestCallbackModal 
        isOpen={isCallbackModalOpen}
        onClose={() => setIsCallbackModalOpen(false)}
        initialCategory={selectedCallbackCategory}
      />

      {/* Email Support Modal */}
      <EmailSupportModal 
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
      />

      {/* First-Time User Onboarding Wizard */}
      <OnboardingWizard />

      {/* Voice Assistant Modal */}
      <VoiceAssistantModal 
        isOpen={isVoiceOpen} 
        onClose={() => setIsVoiceOpen(false)}
      />

      {/* Add / Edit Product Modal */}
      <AddProductModal 
        isOpen={isAddProductOpen}
        onClose={handleCloseAddProduct}
        initialData={editingProduct}
      />

      <style>{`
        .app-shell {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        .app-main-content {
          flex: 1;
          padding-bottom: 80px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (min-width: 768px) {
          .app-main-content {
            padding-bottom: 20px;
          }
        }
      `}</style>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <InventoryProvider>
        <AppShell />
      </InventoryProvider>
    </AuthProvider>
  );
}
