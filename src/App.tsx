import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import DonorRegistration from "./pages/DonorRegistration";
import FindDonor from "./pages/FindDonor";
import Eligibility from "./pages/Eligibility";
import AwarenessPage from "./pages/AwarenessPage";
import NotFound from "./pages/NotFound";
import { AIAssistant } from "@/components/AIAssistant";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/register" element={<DonorRegistration />} />
          <Route path="/find-donor" element={<FindDonor />} />
          <Route path="/eligibility" element={<Eligibility />} />
          <Route path="/awareness" element={<AwarenessPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <AIAssistant />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
