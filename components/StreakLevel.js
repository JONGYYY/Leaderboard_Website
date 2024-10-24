// src/components/StreakLevel.js
import React, { useEffect, useState, useCallback } from 'react';
import styles from './StreakLevel.module.css';
import { useRouter } from 'next/router';

const StreakLevel = () => {
  const [streak, setStreak] = useState(0);
  const [level, setLevel] = useState(1);
  const [pointsInCurrentLevel, setPointsInCurrentLevel] = useState(0);
  const [pointsNeededForCurrentLevel, setPointsNeededForCurrentLevel] = useState(100);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Use useCallback to memoize the functions
  const calculateLevel = useCallback((totalPoints) => {
    let cumulativePoints = 0;
    let level = 1;
    let pointsNeededForLevel = 100;

    while (totalPoints >= cumulativePoints + pointsNeededForLevel) {
      cumulativePoints += pointsNeededForLevel;

      // Update pointsNeededForLevel every 10 levels
      if (level % 10 === 0) {
        pointsNeededForLevel += 100;
      }

      level++;
    }

    let pointsInCurrentLevel = totalPoints - cumulativePoints;
    let pointsNeededForCurrentLevel = pointsNeededForLevel;
    let progressPercentage = (pointsInCurrentLevel / pointsNeededForCurrentLevel) * 100;

    return {
      level,
      pointsInCurrentLevel,
      pointsNeededForCurrentLevel,
      progressPercentage,
    };
  }, []);

  const calculateWeeklyStreak = useCallback((completedChallenges) => {
    const completionDates = completedChallenges
      .map((challenge) => new Date(challenge.dateCompleted))
      .sort((a, b) => b - a);

    if (completionDates.length === 0) {
      return 0;
    }

    let streak = 0;
    let currentWeekStart = getStartOfWeek(new Date());

    for (let date of completionDates) {
      const challengeDate = new Date(date);
      const challengeWeekStart = getStartOfWeek(challengeDate);

      if (challengeWeekStart.getTime() === currentWeekStart.getTime()) {
        streak++;
        currentWeekStart.setDate(currentWeekStart.getDate() - 7);
      } else if (challengeWeekStart.getTime() > currentWeekStart.getTime()) {
        continue;
      } else {
        break;
      }
    }

    return streak;
  }, []);

  const getStartOfWeek = (date) => {
    const day = date.getDay();
    const diff = date.getDate() - day;
    return new Date(date.getFullYear(), date.getMonth(), diff);
  };

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');

      // Only redirect to login if the current path is protected
      const isProtectedRoute = !['/register', '/login'].includes(router.pathname);

      if (!token && isProtectedRoute) {
        router.push('/login');
        return;
      }

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/profile`, {
        //const response = await fetch('http://localhost:5000/api/users/profile', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          localStorage.removeItem('token');
          if (isProtectedRoute) {
            router.push('/login');
          }
          return;
        }

        const totalPoints = data.points || 0;
        const completedChallenges = data.completedChallenges || [];

        const levelData = calculateLevel(totalPoints);
        setLevel(levelData.level);
        setPointsInCurrentLevel(levelData.pointsInCurrentLevel);
        setPointsNeededForCurrentLevel(levelData.pointsNeededForCurrentLevel);
        setProgressPercentage(levelData.progressPercentage);

        const streakCount = calculateWeeklyStreak(completedChallenges);
        setStreak(streakCount);
      } catch (error) {
        console.error('Error fetching user data:', error);
        if (isProtectedRoute) {
          router.push('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router, calculateLevel, calculateWeeklyStreak]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.streakLevelContainer}>
      <div className={styles.streakInfo}>
        <p>
          Weekly Streak: <strong>{streak} week{streak !== 1 ? 's' : ''}</strong>
        </p>
      </div>
      <div className={styles.levelInfo}>
        <p>
          Level <strong>{level}</strong>
        </p>
        <div className={styles.progressBar}>
          <div
            className={styles.progress}
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <p>
          <strong>{pointsInCurrentLevel}</strong> / {pointsNeededForCurrentLevel} points
        </p>
      </div>
    </div>
  );
};

export default StreakLevel;
