// src/pages/Profile.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
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
import { Line } from 'react-chartjs-2';
import styles from './Profile.module.css';
import Image from 'next/image';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Profile = () => {
  const [userProfile, setUserProfile] = useState(null); // State to store the profile
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pointProgression, setPointProgression] = useState({ progression: [], labels: [] });
  const [timeProgression, setTimeProgression] = useState({ progression: [], labels: [] });
  const [levelData, setLevelData] = useState(null); // State to store level information
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
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
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/profile`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`, // Attach token in header
          },
        });

        const data = await response.json();
        console.log('Fetched user profile data:', data);

        if (!response.ok) {
          setError(data.msg || 'Failed to fetch profile data');
          // Handle unauthorized access
          localStorage.removeItem('token'); // Remove token if invalid or expired
          router.push({
            pathname: '/login',
            query: { next: router.pathname },
          });
          return;
        }

        setUserProfile(data); // Set profile data in state
        calculateProgressions(data.completedChallenges || []); // Calculate point and time progression

        // Calculate the user's level based on total points
        const levelInfo = calculateLevel(data.points || 0);
        setLevelData(levelInfo);
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError('An error occurred while fetching your profile.');
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

    fetchProfile();
  }, []); // Empty dependency array to run only once

  // Function to calculate progressions
  const calculateProgressions = (completedChallenges) => {
    if (!completedChallenges || completedChallenges.length === 0) return;

    let pointProgression = [];
    let timeProgression = [];
    let totalPoints = 0;
    let totalTime = 0;
    let labels = [];

    // Sort the challenges by the completion date to show progression over time
    const sortedChallenges = completedChallenges.sort(
      (a, b) => new Date(a.dateCompleted) - new Date(b.dateCompleted)
    );

    // Map each challenge to its cumulative points and time at each completion step
    sortedChallenges.forEach((challenge) => {
      // Skip challenges with null challengeId
      if (!challenge.challengeId) return;

      totalPoints += challenge.pointsEarned || 0;
      totalTime += (challenge.timeEarned || 0) / 60; // Convert minutes to hours
      pointProgression.push(totalPoints);
      timeProgression.push(parseFloat(totalTime.toFixed(2))); // Limit to 2 decimal places
      labels.push(new Date(challenge.dateCompleted).toLocaleDateString());
    });

    setPointProgression({ progression: pointProgression, labels }); // Set the point progression state
    setTimeProgression({ progression: timeProgression, labels }); // Set the time progression state
  };

  // Function to calculate user level based on total points
  const calculateLevel = (totalPoints) => {
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
  };

  // Function to format time as hours and minutes
  const formatTime = (timeInMinutes) => {
    const hours = Math.floor(timeInMinutes / 60);
    const minutes = Math.round(timeInMinutes % 60);

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

  if (loading || !userProfile) {
    return <div>Loading profile...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  // Format totalTime
  const totalTimeFormatted = formatTime(userProfile.totalTime || 0);

  return (
    <div className={styles.profilePage}>
      <h2 className={styles.pageTitle}>Profile</h2>

      {/* Profile Information Section */}
      <div className={styles.card}>
        <div className={styles.profileInfo}>
          <Image
            src={userProfile.profilePicture || '/default-profile.png'}
            alt="Profile"
            className={styles.profilePicture}
            width={150}
            height={150}
          />
          <div className={styles.basicInfo}>
            <h3>{userProfile.name}</h3>
            {/* Display User Level */}
            <p>
              Level: <strong>{levelData.level}</strong>
            </p>
            <p>
              Badges:{' '}
              {userProfile.badges && userProfile.badges.length > 0
                ? userProfile.badges.join(' ')
                : 'No badges yet'}
            </p>
          </div>
        </div>
      </div>

      {/* Points and Time Overview Section */}
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>Overview</h3>
        <div className={styles.overview}>
          <p>Total Points: {userProfile.points || 0}</p>
          <p>Total Time Earned: {totalTimeFormatted}</p>
          <p>Badges Earned: {userProfile.badges ? userProfile.badges.length : 0}</p>
        </div>
      </div>

      {/* Progress Graphs Section */}
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>Progress Over Time</h3>
        <div className={styles.graphsContainer}>
          <div className={styles.graphWrapper}>
            <Line
              data={{
                labels: pointProgression.labels, // Use dates as labels
                datasets: [
                  {
                    label: 'Points Over Time',
                    data: pointProgression.progression, // Dynamic points progression data
                    fill: false,
                    borderColor: '#007bff',
                    tension: 0.1,
                  },
                ],
              }}
              options={{ scales: { y: { beginAtZero: true } } }}
            />
          </div>
          <div className={styles.graphWrapper}>
            <Line
              data={{
                labels: timeProgression.labels, // Use dates as labels
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
              options={{ scales: { y: { beginAtZero: true } } }}
            />
          </div>
        </div>
      </div>

      {/* Completed Activities Section */}
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>Completed Activities</h3>
        {userProfile.completedChallenges && userProfile.completedChallenges.length > 0 ? (
          <table className={styles.activitiesTable}>
            <thead>
              <tr>
                <th>Activity</th>
                <th>Status</th>
                <th>Points Earned</th>
                <th>Time Earned</th>
                <th>Date Completed</th>
              </tr>
            </thead>
            <tbody>
              {userProfile.completedChallenges.map((activity, index) => (
                <tr key={index}>
                  <td>
                    {activity.challengeId
                      ? activity.challengeId.title
                      : 'Challenge Removed'}
                  </td>
                  <td>Completed</td>
                  <td>{activity.pointsEarned}</td>
                  <td>{formatTime(activity.timeEarned)}</td>
                  <td>{new Date(activity.dateCompleted).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No activities completed yet.</p>
        )}
      </div>
    </div>
  );
};

export default Profile;
