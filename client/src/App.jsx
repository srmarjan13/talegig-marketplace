import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import MarketplaceSettings from './pages/MarketplaceSettings';
import UserManagement from './pages/UserManagement';
import FinanceDashboard from './pages/FinanceDashboard';
import FinanceControl from './pages/FinanceControl';
import Home from './Home/Home';
import RootLayout from './Home/RootLayout';
import Signup from './Home/Signup';
import SellerDashboard from './Home/SellerDashboard';
import BuyerDashboard from './Home/BuyerDashboard';
import AllProjects from './Home/AllProjects';
import AllContests from './Home/AllContests';
import CreateProject from './Home/CreateProject';
import ProjectDetails from './Home/ProjectDetails';
import ContestDetails from './Home/ContestDetails';
import BuyerProjectDetails from './Home/BuyerProjectDetails';
import BuyerContestDetails from './Home/BuyerContestDetails';
import Profile from './Home/Profile';
import { AuthProvider, useAuth } from './components/AuthContext';
import Search from "./Home/Search";
import CreateGig from './Home/CreateGig';
import GigDetails from './Home/GigDetails';
import GigOrder from './Home/GigOrder';
import Inbox from './Home/Inbox';
import Freelancers from "./Home/Freelancers";
import Gigs from './Home/Gigs';
import AccountAnalytics from './Home/AccountAnalytics';
import BuyerAnalytics from './Home/BuyerAnalytics';
import Checkout from './components/Checkout';
import Settings from './Home/Settings';
import AdminChat from './components/AdminChat';
import CustomOfferModal from './Home/CustomOfferModal';
import { ToastProvider } from './Home/ToastContext';
import SellerProfile from './Home/Profile';

const AppRoutes = () => {
  const { user, theme } = useAuth(); // 🟢 এখানে 'user' এবং 'theme' উভয়কেই একসাথে নিয়ে আসা হলো
  const darkMode = theme === 'dark';

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
  }, [darkMode]);

  return (
    <div className="relative min-h-screen bg-white dark:bg-[#010F23] text-slate-900 dark:text-white transition-colors duration-200">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route element={<RootLayout />}></Route>
        <Route path="/signup" element={<Signup />} />
        <Route path="/checkout" element={<Checkout isOpen={true} />} />
        <Route path="/settings" element={<Settings />} />
        
        <Route path="/sellerdashboard" element={<SellerDashboard />} />
        <Route path="/buyer-dashboard" element={<BuyerDashboard />} />
        <Route path="/seller-dashboard" element={<SellerDashboard />} />
        <Route path="/seller-analytics" element={<AccountAnalytics />} />
        <Route path="/buyer-analytics" element={<BuyerAnalytics />} />
        <Route path="/accountanalytics" element={<AccountAnalytics />} />

        <Route path="/inbox" element={<Inbox />} />
        <Route path="/freelancers" element={<Freelancers />} />
        <Route path="/allproject" element={<AllProjects />} />
        <Route path="/allcontest" element={<AllContests />} />
        <Route path="/createproject" element={<CreateProject />} />
        <Route path="/project/:id" element={<ProjectDetails />} />
        <Route path="/contest/:id" element={<ContestDetails />} />
        <Route path="/projectdetails" element={<ProjectDetails />} />
        <Route path="/project-details/:id" element={<ProjectDetails />} />
        <Route path="/contest-details/:id" element={<ContestDetails />} />
        <Route path="/buyer-project-details/:id" element={<BuyerProjectDetails />} />
        <Route path="/buyerprojectdetails" element={<BuyerProjectDetails />} />
        <Route path="/buyer-contest-details/:id" element={<BuyerContestDetails />} />
        <Route path="/buyercontestdetails" element={<BuyerContestDetails />} />
        <Route path="/search" element={<Search />} />
        <Route path="/create-gig" element={<CreateGig />} />
        <Route path="/gig/:id" element={<GigDetails />} />
        <Route path="/gig-details/:id" element={<GigDetails />} />
        <Route path="/gig-order" element={<GigOrder />} />
        <Route path="/gig-order/:id" element={<GigOrder />} />
        <Route path="/gigs" element={<Gigs />} />
        <Route path="/profile/:username" element={<Profile />} />
        <Route path="/custom-offers" element={<CustomOfferModal isOpen={true} />} />
        <Route path="/login" element={<Signup />} />
        <Route path="/seller/:identifier" element={<SellerProfile />} />
        <Route path="/profile" element={<Profile key={user?.role} />} />

        {/* অ্যাডমিন পেজ রাউটস */}
        <Route path="/superadmin/*" element={
          <div className="flex w-full">
            <Sidebar />
            <div className="flex-1 bg-white dark:bg-[#010F23]">
              <Routes>
                <Route path="/" element={<SuperAdminDashboard />} />
                <Route path="settings" element={<MarketplaceSettings />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="finance" element={<FinanceDashboard />} />
                <Route path="finance/control" element={<FinanceControl />} />
                <Route path="inbox" element={<AdminChat />} />
              </Routes>
            </div>
          </div>
        } />
      </Routes>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;