import type { AppSnapshot, DashboardStats } from "@/types";
import { getLastNDays, getTodayKey } from "@/utils/date";

export function getDashboardStats(snapshot: AppSnapshot): DashboardStats {
  const activeGoals = snapshot.goals.filter((goal) => goal.status === "active").length;
  const completedGoals = snapshot.goals.filter((goal) => goal.status === "completed").length;
  const habitsToday = snapshot.habits.filter((habit) =>
    habit.history.some((entry) => entry.date === getTodayKey() && entry.completed),
  ).length;
  const progressTotal = snapshot.goals.reduce((sum, goal) => sum + goal.progress, 0);
  const upcomingMilestones = snapshot.milestones.filter((milestone) => !milestone.completed).length;
  const weeklyProgress = snapshot.progressEntries
    .filter((entry) => getLastNDays(7).includes(entry.date))
    .reduce((sum, entry) => sum + entry.value, 0);

  return {
    activeGoals,
    completedGoals,
    habitsToday,
    currentStreak: snapshot.user.streak,
    globalProgress: snapshot.goals.length ? progressTotal / snapshot.goals.length : 0,
    weeklyProgress,
    upcomingMilestones,
    unlockedAchievements: snapshot.achievements.length,
    winsCount: snapshot.wins.length,
  };
}

export function getWeeklyHabitChart(snapshot: AppSnapshot) {
  return getLastNDays(7).map((date) => ({
    date,
    label: new Intl.DateTimeFormat("es-ES", { weekday: "short" }).format(new Date(date)),
    completed: snapshot.habits.reduce((sum, habit) => {
      return sum + Number(habit.history.some((entry) => entry.date === date && entry.completed));
    }, 0),
  }));
}

export function getWeeklyGoalProgressChart(snapshot: AppSnapshot) {
  return getLastNDays(7).map((date) => ({
    date,
    label: new Intl.DateTimeFormat("es-ES", { weekday: "short" }).format(new Date(date)),
    progress: snapshot.progressEntries
      .filter((entry) => entry.date === date)
      .reduce((sum, entry) => sum + entry.value, 0),
  }));
}

export function getHabitConsistencyData(snapshot: AppSnapshot) {
  return snapshot.habits.map((habit) => {
    const total = habit.history.length || 1;
    const completed = habit.history.filter((entry) => entry.completed).length;
    return {
      habit: habit.title,
      completion: Math.round((completed / total) * 100),
    };
  });
}

export function getMonthlyProgressData(snapshot: AppSnapshot) {
  const months = Array.from({ length: 6 }, (_, index) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - index));
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    return {
      key: monthKey,
      label: new Intl.DateTimeFormat("es-ES", { month: "short" }).format(date),
    };
  });

  return months.map((month) => ({
    month: month.label,
    progress: snapshot.progressEntries
      .filter((entry) => entry.date.startsWith(month.key))
      .reduce((sum, entry) => sum + entry.value, 0),
  }));
}

export function getCategoryProgressData(snapshot: AppSnapshot) {
  const categories = snapshot.goals.reduce<Record<string, number[]>>((acc, goal) => {
    acc[goal.category] ??= [];
    acc[goal.category].push(goal.progress);
    return acc;
  }, {});

  return Object.entries(categories).map(([category, values]) => ({
    category,
    progress: Math.round(values.reduce((sum, value) => sum + value, 0) / values.length),
  }));
}

export function getActivityHeatmap(snapshot: AppSnapshot) {
  return getLastNDays(28).map((date) => {
    const habitCount = snapshot.habits.reduce((sum, habit) => {
      return sum + Number(habit.history.some((entry) => entry.date === date && entry.completed));
    }, 0);
    const progressCount = snapshot.progressEntries.filter((entry) => entry.date === date).length;
    return {
      date,
      value: habitCount + progressCount,
    };
  });
}
