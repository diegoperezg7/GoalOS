import { lazy, Suspense, type ReactNode, useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { AchievementCelebration } from "@/components/achievements/achievement-celebration";
import { PageLoader } from "@/components/common/page-loader";
import { AppShell } from "@/components/layout/app-shell";
import { shouldRequireAIdentityAuth } from "@/services/auth/aidentity";
import { useAppStore } from "@/store/use-app-store";

const DashboardPage = lazy(() =>
  import("@/pages/dashboard-page").then((module) => ({ default: module.DashboardPage })),
);
const AuthRequiredPage = lazy(() =>
  import("@/pages/auth-required-page").then((module) => ({ default: module.AuthRequiredPage })),
);
const LifeTimelinePage = lazy(() =>
  import("@/pages/life-timeline-page").then((module) => ({ default: module.LifeTimelinePage })),
);
const GoalsPage = lazy(() =>
  import("@/pages/goals-page").then((module) => ({ default: module.GoalsPage })),
);
const ProgressPage = lazy(() =>
  import("@/pages/progress-page").then((module) => ({ default: module.ProgressPage })),
);
const GoalDetailPage = lazy(() =>
  import("@/pages/goal-detail-page").then((module) => ({ default: module.GoalDetailPage })),
);
const ProfilePage = lazy(() =>
  import("@/pages/profile-page").then((module) => ({ default: module.ProfilePage })),
);
const OnboardingPage = lazy(() =>
  import("@/pages/onboarding-page").then((module) => ({ default: module.OnboardingPage })),
);
const ChatPage = lazy(() =>
  import("@/pages/chat-page").then((module) => ({ default: module.ChatPage })),
);

function withSuspense(node: ReactNode) {
  return <Suspense fallback={<PageLoader />}>{node}</Suspense>;
}

function AppRoutes() {
  const initializeApp = useAppStore((state) => state.initializeApp);
  const account = useAppStore((state) => state.account);
  const isBootstrapping = useAppStore((state) => state.isBootstrapping);
  const hasCompletedOnboarding = useAppStore((state) => state.user.hasCompletedOnboarding);
  const requiresAIdentityAuth = shouldRequireAIdentityAuth();

  useEffect(() => {
    void initializeApp();
  }, [initializeApp]);

  useEffect(() => {
    if (!requiresAIdentityAuth) {
      return;
    }

    const revalidateSession = () => {
      if (document.visibilityState === "visible") {
        void initializeApp();
      }
    };

    window.addEventListener("focus", revalidateSession);
    document.addEventListener("visibilitychange", revalidateSession);

    return () => {
      window.removeEventListener("focus", revalidateSession);
      document.removeEventListener("visibilitychange", revalidateSession);
    };
  }, [initializeApp, requiresAIdentityAuth]);

  if (isBootstrapping) {
    return <PageLoader />;
  }

  if (requiresAIdentityAuth && !account) {
    return (
      <Routes>
        <Route path="*" element={withSuspense(<AuthRequiredPage />)} />
      </Routes>
    );
  }

  if (!hasCompletedOnboarding) {
    return (
      <Routes>
        <Route path="/onboarding" element={withSuspense(<OnboardingPage />)} />
        <Route path="*" element={<Navigate to="/onboarding" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/onboarding" element={<Navigate to="/" replace />} />
      <Route element={<AppShell />}>
        <Route path="/" element={withSuspense(<DashboardPage />)} />
        <Route path="/timeline" element={withSuspense(<LifeTimelinePage />)} />
        <Route path="/goals" element={withSuspense(<GoalsPage />)} />
        <Route path="/progress" element={withSuspense(<ProgressPage />)} />
        <Route path="/goals/:goalId" element={withSuspense(<GoalDetailPage />)} />
        <Route path="/profile" element={withSuspense(<ProfilePage />)} />
        <Route path="/chat" element={withSuspense(<ChatPage />)} />
        <Route path="/wins" element={<Navigate to="/timeline" replace />} />
        <Route path="/achievements" element={<Navigate to="/timeline" replace />} />
        <Route path="/events" element={<Navigate to="/timeline" replace />} />
        <Route path="/capture" element={<Navigate to="/" replace />} />
        <Route path="/habits" element={<Navigate to="/progress" replace />} />
        <Route path="/analytics" element={<Navigate to="/progress" replace />} />
        <Route path="/insights" element={<Navigate to="/progress" replace />} />
        <Route path="/financial-ladder" element={<Navigate to="/progress" replace />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export function App() {
  return (
    <>
      <AppRoutes />
      <AchievementCelebration />
    </>
  );
}
