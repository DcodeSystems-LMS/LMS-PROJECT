
import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './router';
import { UserThemeProvider } from './contexts/UserThemeContext';
import { SidebarSettingsProvider } from './contexts/SidebarSettingsContext';
import ErrorBoundary from './components/base/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter 
        basename={__BASE_PATH__}
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        <UserThemeProvider>
          <SidebarSettingsProvider>
            <AppRoutes />
          </SidebarSettingsProvider>
        </UserThemeProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
