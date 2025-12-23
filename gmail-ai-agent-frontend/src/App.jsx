import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import DashboardLayout from "@/layouts/DashboardLayout";
import DashboardPage from "@/pages/DashboardPage";
import AuthPage from "./pages/AuthPage";
import InboxPage from "./pages/inbox";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { useAuthUser } from "./hooks/useAuthUser";
import EmailDetailPage from "./pages/EmailDetailPage";
import ToggleSwitchPage from "./pages/ToggleSwitchPage";

function App() {
  const { success, refetchAuthUser, isLoading, authUser } = useAuthUser();

  const authenticated = success === true;
  const syncEmail = authUser?.user?.isSyncActive === true;

  const GoogleAuthWrapper = () => {
    return (
      <GoogleOAuthProvider clientId="853597567110-kt2n33739me3e5q7htngj40d3u9v7a8t.apps.googleusercontent.com">
        <AuthPage refetchAuthUser={refetchAuthUser} />
      </GoogleOAuthProvider>
    );
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            authenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          element={
            authenticated ? (
              <DashboardLayout />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route
            path="/toggleSyncEmail"
            element={
              syncEmail ? (
                <Navigate to="/inbox" replace />
              ) : (
                <ToggleSwitchPage />
              )
            }
          />
          <Route
            path="/inbox"
            element={
              syncEmail ? (
                <InboxPage />
              ) : (
                <Navigate to="/toggleSyncEmail" replace />
              )
            }
          />
          <Route
            path="/message-details/:emailId"
            element={<EmailDetailPage />}
          />
          <Route
            path="/settings"
            element={<div className="p-10 text-white">Settings</div>}
          />
        </Route>

        <Route
          path="/login"
          element={
            authenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <GoogleAuthWrapper />
            )
          }
        />
      </Routes>
      <ToastContainer />
    </BrowserRouter>
  );
}

export default App;
