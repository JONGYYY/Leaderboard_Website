// src/pages/Activities.js
import React, { useState, useEffect } from 'react';
import styles from './Activities.module.css';
import { useRouter } from 'next/router';

const Activities = () => {
  const [currentChallenges, setCurrentChallenges] = useState([]);
  const [completedActivities, setCompletedActivities] = useState([]);
  const [filteredChallenges, setFilteredChallenges] = useState([]); // Challenges not yet completed
  const [isAdmin, setIsAdmin] = useState(true); // Accessible to all for now
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  // State for submission form
  const [selectedChallenge, setSelectedChallenge] = useState('');
  const [submissionLink, setSubmissionLink] = useState('');
  const [file, setFile] = useState(null);

  // State for new challenge form
  const [newChallenge, setNewChallenge] = useState({
    title: '',
    description: '',
    dueDate: '',
    points: '',
    estimatedTime: '',
  });

  // State for pagination
  const [completedActivitiesToShow, setCompletedActivitiesToShow] = useState(5);
  const [currentChallengesToShow, setCurrentChallengesToShow] = useState(5);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        // Fetch current challenges
        const challengesRes = await fetch('${process.env.NEXT_PUBLIC_API_BASE_URL}:5000/api/challenges', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const challengesData = await challengesRes.json();

        // Fetch completed activities
        const completedRes = await fetch('${process.env.NEXT_PUBLIC_API_BASE_URL}:5000/api/challenges/completed', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const completedData = await completedRes.json();

        // Update state
        setCurrentChallenges(challengesData || []);
        setCompletedActivities(completedData || []);

        // Filter out completed challenges from current challenges
        const completedChallengeIds = completedData
          .filter((item) => item.challengeId) // Ensure challengeId is not null
          .map((item) => item.challengeId._id);

        const filtered = challengesData.filter(
          (challenge) => !completedChallengeIds.includes(challenge._id)
        );
        setFilteredChallenges(filtered);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  // Handle activity submission
  const handleSubmission = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('challengeId', selectedChallenge);
    formData.append('submissionLink', submissionLink);
    if (file) {
      formData.append('submissionFile', file);
    }

    try {
      const res = await fetch('${process.env.NEXT_PUBLIC_API_BASE_URL}:5000/api/challenges/submit', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        alert('Activity submitted successfully!');
        // Update completed activities
        setCompletedActivities([...completedActivities, data.user.completedChallenges.slice(-1)[0]]);
        // Remove submitted challenge from filteredChallenges
        setFilteredChallenges(
          filteredChallenges.filter((challenge) => challenge._id !== selectedChallenge)
        );
        // Reset submission form
        setSelectedChallenge('');
        setSubmissionLink('');
        setFile(null);
      } else {
        alert(data.msg || 'Error submitting activity');
      }
    } catch (error) {
      console.error('Error submitting activity:', error);
      alert('An error occurred while submitting the activity.');
    }
  };

  // Handle creating a new challenge
  const handleCreateChallenge = async () => {
    const token = localStorage.getItem('token');
    const { title, description, dueDate, points, estimatedTime } = newChallenge;

    if (!title || !dueDate || !points || !estimatedTime) {
      alert('Please fill in all required fields.');
      return;
    }

    try {
      const res = await fetch('${process.env.NEXT_PUBLIC_API_BASE_URL}:5000/api/challenges/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          dueDate,
          points,
          estimatedTime,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setCurrentChallenges([...currentChallenges, data]);
        setFilteredChallenges([...filteredChallenges, data]);
        setNewChallenge({
          title: '',
          description: '',
          dueDate: '',
          points: '',
          estimatedTime: '',
        });
      } else {
        alert(data.msg || 'Error creating challenge');
      }
    } catch (error) {
      console.error('Error creating challenge:', error);
      alert('An error occurred while creating the challenge.');
    }
  };

  // Handle removing a challenge
  const handleRemoveChallenge = async (id) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('${process.env.NEXT_PUBLIC_API_BASE_URL}:5000/api/challenges/delete/${id}', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setCurrentChallenges(currentChallenges.filter((challenge) => challenge._id !== id));
        setFilteredChallenges(filteredChallenges.filter((challenge) => challenge._id !== id));
      } else {
        alert('Error deleting challenge');
      }
    } catch (error) {
      console.error('Error deleting challenge:', error);
      alert('An error occurred while deleting the challenge.');
    }
  };

  // Handle file input change
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Handle "Show More" for completed activities
  const handleShowMoreCompleted = () => {
    setCompletedActivitiesToShow((prev) => prev + 5);
  };

  // Handle "Show More" for current challenges
  const handleShowMoreCurrent = () => {
    setCurrentChallengesToShow((prev) => prev + 5);
  };

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

  if (loading) {
    return <div>Loading activities...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className={styles.activitiesPage}>
      <h2 className={styles.pageTitle}>Activities</h2>

      {/* Activity Submission Form */}
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>Submit Activity</h3>
        <form className={styles.submissionForm} onSubmit={handleSubmission}>
          <label>Select Activity</label>
          <select
            value={selectedChallenge}
            onChange={(e) => setSelectedChallenge(e.target.value)}
            required
          >
            <option value="">Select a challenge</option>
            {filteredChallenges.map((challenge) => (
              <option key={challenge._id} value={challenge._id}>
                {challenge.title}
              </option>
            ))}
          </select>

          <label>Submission Link (optional)</label>
          <input
            type="url"
            value={submissionLink}
            onChange={(e) => setSubmissionLink(e.target.value)}
          />

          <label>Upload File (optional)</label>
          <input type="file" onChange={handleFileChange} />

          <button type="submit" className={styles.submitBtn}>
            Submit Activity
          </button>
        </form>
      </div>

      {/* Current Challenges */}
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>Current Challenges</h3>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Challenge</th>
              <th>Description</th>
              <th>Due Date</th>
              <th>Points</th>
              <th>Estimated Time</th>
              {isAdmin && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filteredChallenges.slice(0, currentChallengesToShow).map((challenge) => (
              <tr key={challenge._id}>
                <td>{challenge.title}</td>
                <td>{challenge.description || 'No description'}</td>
                <td>{new Date(challenge.dueDate).toLocaleDateString()}</td>
                <td>{challenge.points}</td>
                <td>{formatTime(challenge.estimatedTime)}</td>
                {isAdmin && (
                  <td>
                    <button
                      className={styles.removeBtn}
                      onClick={() => handleRemoveChallenge(challenge._id)}
                    >
                      Remove
                    </button>
                  </td>
                )}
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

      {/* Completed Activities */}
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>Completed Activities</h3>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Activity</th>
              <th>Points Earned</th>
              <th>Time Earned</th>
              <th>Date Completed</th>
            </tr>
          </thead>
          <tbody>
            {completedActivities.slice(0, completedActivitiesToShow).map((activity, index) => (
              <tr key={index}>
                <td>
                  {activity.challengeId
                    ? activity.challengeId.title
                    : 'Challenge Removed'}
                </td>
                <td>{activity.pointsEarned}</td>
                <td>{formatTime(activity.timeEarned)}</td>
                <td>{new Date(activity.dateCompleted).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {completedActivities.length > completedActivitiesToShow && (
          <button className={styles.showMoreBtn} onClick={handleShowMoreCompleted}>
            Show More
          </button>
        )}
      </div>

      {/* Admin Controls */}
      {isAdmin && (
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Admin Controls</h3>
          <div className={styles.adminControls}>
            <h4>Create New Challenge</h4>
            <input
              type="text"
              placeholder="Challenge Title"
              value={newChallenge.title}
              onChange={(e) => setNewChallenge({ ...newChallenge, title: e.target.value })}
              required
            />
            <textarea
              placeholder="Description"
              value={newChallenge.description}
              onChange={(e) => setNewChallenge({ ...newChallenge, description: e.target.value })}
            />
            <input
              type="date"
              value={newChallenge.dueDate}
              onChange={(e) => setNewChallenge({ ...newChallenge, dueDate: e.target.value })}
              required
            />
            <input
              type="number"
              placeholder="Points"
              value={newChallenge.points}
              onChange={(e) => setNewChallenge({ ...newChallenge, points: e.target.value })}
              required
            />
            <input
              type="number"
              placeholder="Estimated Time (in minutes)"
              value={newChallenge.estimatedTime}
              onChange={(e) =>
                setNewChallenge({ ...newChallenge, estimatedTime: e.target.value })
              }
              required
            />
            <button className={styles.createBtn} onClick={handleCreateChallenge}>
              Create Challenge
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Activities;
