import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import DonorRegistration from "./pages/DonorRegistration";
import FindDonor from "./pages/FindDonor";
import Eligibility from "./pages/Eligibility";
import AwarenessPage from "./pages/AwarenessPage";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import AuthCallback from "./pages/AuthCallback";
import NotFound from "./pages/NotFound";
import HospitalPortal from "./pages/HospitalPortal";
import BloodStatus from "./pages/BloodStatus";
import { AIAssistant } from "@/components/AIAssistant";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/register" element={<DonorRegistration />} />
            <Route path="/find-donor" element={<FindDonor />} />
            <Route path="/eligibility" element={<Eligibility />} />
            <Route path="/awareness" element={<AwarenessPage />} />
            <Route path="/hospital" element={<HospitalPortal />} />
            <Route path="/blood-status" element={<BloodStatus />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <AIAssistant />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
