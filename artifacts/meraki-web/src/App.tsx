import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { Layout } from "@/components/layout";
import { ProtectedRoute } from "@/components/protected-route";

// Pages
import Home from "@/pages/home";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Services from "@/pages/services";
import Workers from "@/pages/workers";
import WorkerDetail from "@/pages/worker-detail";
import Book from "@/pages/book";
import Bookings from "@/pages/bookings";
import BookingDetail from "@/pages/booking-detail";
import Plans from "@/pages/plans";
import Dashboard from "@/pages/dashboard";
import AdminDashboard from "@/pages/admin-dashboard";
import AdminWorkers from "@/pages/admin-workers";
import AdminBookings from "@/pages/admin-bookings";
import Profile from "@/pages/profile";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <Layout>
      <Switch>
        {/* Public Routes */}
        <Route path="/" component={Home} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/services" component={Services} />
        <Route path="/workers" component={Workers} />
        <Route path="/workers/:id" component={WorkerDetail} />
        <Route path="/plans" component={Plans} />
        <Route path="/book" component={Book} />

        {/* Protected Household Routes */}
        <Route path="/dashboard">
          {() => <ProtectedRoute><Dashboard /></ProtectedRoute>}
        </Route>
        <Route path="/bookings">
          {() => <ProtectedRoute><Bookings /></ProtectedRoute>}
        </Route>
        <Route path="/bookings/:id">
          {() => <ProtectedRoute><BookingDetail /></ProtectedRoute>}
        </Route>
        <Route path="/profile">
          {() => <ProtectedRoute><Profile /></ProtectedRoute>}
        </Route>

        {/* Protected Admin Routes */}
        <Route path="/admin">
          {() => <ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>}
        </Route>
        <Route path="/admin/workers">
          {() => <ProtectedRoute requireAdmin><AdminWorkers /></ProtectedRoute>}
        </Route>
        <Route path="/admin/bookings">
          {() => <ProtectedRoute requireAdmin><AdminBookings /></ProtectedRoute>}
        </Route>

        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AuthProvider>
            <Router />
          </AuthProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
