// Add this to your src/router/config.tsx file

// Add this import at the top with other lazy imports
const Playground = lazy(() => import('@/components/Playground'));

// Add this route to your routes array (around line 125, after the test-auth route)
{
  path: '/playground',
  element: <SuspenseWrapper><Playground /></SuspenseWrapper>
},

// Complete example of where to add it in your routes array:
const routes: RouteObject[] = [
  // ... existing routes ...
  {
    path: '/test-auth',
    element: <SuspenseWrapper><TestAuth /></SuspenseWrapper>
  },
  {
    path: '/playground',
    element: <SuspenseWrapper><Playground /></SuspenseWrapper>
  },
  {
    path: '/wishlist',
    element: <SuspenseWrapper><StudentWishlist /></SuspenseWrapper>
  },
  // ... rest of your routes ...
];
