import { RouterProvider } from 'react-router-dom'
import router from './router/router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'

const queryClient = new QueryClient();

function App() {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      </QueryClientProvider>
    </>
  )
}

export default App
