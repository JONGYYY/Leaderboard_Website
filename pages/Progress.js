// src/pages/Progress.js
import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { useRouter } from 'next/router';
import styles from './Progress.module.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Progress = () => {
  const [completedChallenges, setCompletedChallenges] = useState([]);
  const [currentChallenges, setCurrentChallenges] = useState([]);
  const [filteredChallenges, setFilteredChallenges] = useState([]); // Challenges not yet completed
  const [pointProgression, setPointProgression] = useState({ progression: [], labels: [] });
  const [timeProgression, setTimeProgression] = useState({ progression: [], labels: [] });
  const [totalTime, setTotalTime] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  // State for pagination
  const [completedChallengesToShow, setCompletedChallengesToShow] = useState(5);
  const [currentChallengesToShow, setCurrentChallengesToShow] = useState(5);

  useEffect(() => {
    const fetchProgressData = async () => {
      const token = localStorage.getItem('token'); // Get the token from localStorage

      if (!token) {
        // Redirect to login with next parameter
        router.push({
          pathname: '/login',
          query: { next: router.pathname },
        });
        return;
      }

      try {
        // Fetch user profile data from the backend
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/profile`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`, // Attach token in header
          },
        });

        const data = await response.json();

        if (!response.ok) {
          // Handle unauthorized access
          localStorage.removeItem('token'); // Remove token if invalid or expired
          router.push({
            pathname: '/login',
            query: { next: router.pathname },
          });
          return;
        }

        // Set the completed challenges
        setCompletedChallenges(data.completedChallenges || []);
        setTotalTime(data.totalTime || 0); // Set total time

        // Fetch current challenges separately from the challenges endpoint
        const challengesRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/challenges`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const challengesData = await challengesRes.json();
        setCurrentChallenges(challengesData || []);

        // Filter out completed challenges from current challenges
        const completedChallengeIds = data.completedChallenges
          .filter((item) => item.challengeId) // Ensure challengeId is not null
          .map((item) => item.challengeId._id);

        const filtered = challengesData.filter(
          (challenge) => !completedChallengeIds.includes(challenge._id)
        );
        setFilteredChallenges(filtered);

        // Calculate the point and time progression for the graphs
        calculateProgressions(data.completedChallenges);
      } catch (error) {
        console.error('Error fetching progress data:', error);
        // Handle errors and redirect to login
        localStorage.removeItem('token'); // Clear token in case of error
        router.push({
          pathname: '/login',
          query: { next: router.pathname },
        });
      } finally {
        setLoading(false); // Ensure loading state is updated
      }
    };

    const calculateProgressions = (completedChallenges) => {
      if (!completedChallenges || completedChallenges.length === 0) return;

      let pointProgressionData = [];
      let timeProgressionData = [];
      let totalPoints = 0;
      let totalTime = 0;
      let labels = [];

      const sortedChallenges = completedChallenges.sort(
        (a, b) => new Date(a.dateCompleted) - new Date(b.dateCompleted)
      );

      sortedChallenges.forEach((challenge) => {
        // Skip challenges with null challengeId
        if (!challenge.challengeId) return;

        totalPoints += challenge.pointsEarned;
        totalTime += challenge.timeEarned / 60; // Convert minutes to hours
        pointProgressionData.push(totalPoints);
        timeProgressionData.push(parseFloat(totalTime.toFixed(2))); // Limit to 2 decimal places
        labels.push(new Date(challenge.dateCompleted).toLocaleDateString());
      });

      setPointProgression({ progression: pointProgressionData, labels });
      setTimeProgression({ progression: timeProgressionData, labels });
    };

    fetchProgressData();
  }, [router]);

  // Function to format time as hours and minutes
  const formatTime = (timeInMinutes) => {
    const hours = Math.floor(timeInMinutes / 60);
    const minutes = timeInMinutes % 60;

    let timeString = '';
    if (hours > 0) {
      timeString += `${hours} hour${hours > 1 ? 's' : ''}`;
    }
    if (minutes > 0) {
      if (hours > 0) timeString += ' ';
      timeString += `${minutes} minute${minutes > 1 ? 's' : ''}`;
    }
    return timeString || '0 minutes';
  };

  // Handle "Show More" for completed challenges
  const handleShowMoreCompleted = () => {
    setCompletedChallengesToShow((prev) => prev + 5);
  };

  // Handle "Show More" for current challenges
  const handleShowMoreCurrent = () => {
    setCurrentChallengesToShow((prev) => prev + 5);
  };

  if (loading) {
    return <div>Loading progress data...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  // Format totalTime
  const totalTimeFormatted = formatTime(totalTime);

  const options = {
    scales: {
      y: {
        beginAtZero: true,
        type: 'linear', // Explicitly set the scale type to 'linear'
      },
    },
  };

  return (
    <div className={styles.progressPage}>
      <h2 className={styles.pageTitle}>Progress</h2>

      {/* Total Time Earned */}
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>Total Time Earned</h3>
        <p>You have earned a total of {totalTimeFormatted} from completed activities.</p>
      </div>

      {/* Progress Graphs Section */}
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>Progress Over Time</h3>
        <div className={styles.graphsContainer}>
          <div className={styles.graphWrapper}>
            <Line
              data={{
                labels: pointProgression.labels, // Use dynamic labels (dates)
                datasets: [
                  {
                    label: 'Points Progression',
                    data: pointProgression.progression, // Dynamic points progression data
                    fill: false,
                    borderColor: '#007bff',
                    tension: 0.1,
                  },
                ],
              }}
              options={options}
            />
          </div>
          <div className={styles.graphWrapper}>
            <Line
              data={{
                labels: timeProgression.labels, // Use dynamic labels (dates)
                datasets: [
                  {
                    label: 'Hours Earned Over Time',
                    data: timeProgression.progression, // Dynamic time progression data
                    fill: false,
                    borderColor: '#28a745',
                    tension: 0.1,
                  },
                ],
              }}
              options={options}
            />
          </div>
        </div>
      </div>

      {/* Completed Challenges Section */}
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>Completed Challenges</h3>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Challenge</th>
              <th>Points Earned</th>
              <th>Time Earned</th>
              <th>Date Completed</th>
            </tr>
          </thead>
          <tbody>
            {completedChallenges.slice(0, completedChallengesToShow).map((challenge, index) => (
              <tr key={index}>
                <td>
                  {challenge.challengeId
                    ? challenge.challengeId.title
                    : 'Challenge Removed'}
                </td>
                <td>{challenge.pointsEarned}</td>
                <td>{formatTime(challenge.timeEarned)}</td>
                <td>{new Date(challenge.dateCompleted).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {completedChallenges.length > completedChallengesToShow && (
          <button className={styles.showMoreBtn} onClick={handleShowMoreCompleted}>
            Show More
          </button>
        )}
      </div>

      {/* Current Activities Section */}
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>Current Activities</h3>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Challenge</th>
              <th>Description</th>
              <th>Due Date</th>
              <th>Estimated Time</th>
            </tr>
          </thead>
          <tbody>
            {filteredChallenges.slice(0, currentChallengesToShow).map((challenge, index) => (
              <tr key={index}>
                <td>{challenge.title}</td>
                <td>{challenge.description || 'No description'}</td>
                <td>{new Date(challenge.dueDate).toLocaleDateString()}</td>
                <td>{formatTime(challenge.estimatedTime)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredChallenges.length > currentChallengesToShow && (
          <button className={styles.showMoreBtn} onClick={handleShowMoreCurrent}>
            Show More
          </button>
        )}
      </div>
    </div>
  );
};

export default Progress;
