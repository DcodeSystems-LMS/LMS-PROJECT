
import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './router';
import { UserThemeProvider } from './contexts/UserThemeContext';
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
          <AppRoutes />
        </UserThemeProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
