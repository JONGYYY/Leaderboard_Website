// src/pages/Leaderboard.js
import React, { useState, useEffect } from 'react';
import styles from './Leaderboard.module.css'; 
import { useRouter } from 'next/router';

const Leaderboard = () => {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/users/leaderboard', {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const data = await res.json();

        if (!res.ok) {
          setError(data.msg || 'Failed to load leaderboard');
          return;
        }

        setParticipants(data || []); // Ensure participants is an array
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
        setError('An error occurred while fetching leaderboard');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const renderLeaderboardSection = (level) => {
    // Filter participants for the current level and sort them by points
    const levelParticipants = participants
      .filter((participant) => participant.level === level)
      .sort((a, b) => b.points - a.points);

    return (
      <div className={styles.leaderboardSection} key={level}>
        <h3 className={styles.sectionTitle}>{level} League</h3>
        {levelParticipants.length > 0 ? (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Name</th>
                <th>Points</th>
                <th>Badges</th>
              </tr>
            </thead>
            <tbody>
              {levelParticipants.map((participant, index) => (
                <tr key={participant._id || index}>
                  <td>{index + 1}</td> {/* Dynamic rank based on sorted participants */}
                  <td>{participant.name || 'Unknown'}</td>
                  <td>{participant.points || 0}</td>
                  <td>
                    {participant.badges && participant.badges.length > 0
                      ? participant.badges.join(' ')
                      : 'No badges'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No participants in this league yet.</p>
        )}
      </div>
    );
  };

  if (loading) return <div>Loading leaderboard...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className={styles.leaderboardPage}>
      <h2 className={styles.pageTitle}>Leaderboard</h2>
      {['Platinum', 'Gold', 'Silver', 'Bronze', 'Starter'].map(renderLeaderboardSection)}
    </div>
  );
};

export default Leaderboard;
