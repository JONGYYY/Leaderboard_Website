// src/components/Navigation.js
import React from 'react';
import Link from 'next/link';
import { FaTrophy, FaChartLine, FaTasks, FaUser } from 'react-icons/fa'; 
import styles from './Navigation.module.css'; 

const Navigation = () => {
  return (
    <nav className={styles.navBar}>
      <ul className={styles.navList}>
        <li className={styles.navItem}>
          <Link href="/Leaderboard" className={styles.navLink}>
            <FaTrophy className={styles.navIcon} /> Leaderboard
          </Link>
        </li>
        <li className={styles.navItem}>
          <Link href="/Progress" className={styles.navLink}>
            <FaChartLine className={styles.navIcon} /> Progress
          </Link>
        </li>
        <li className={styles.navItem}>
          <Link href="/Activities" className={styles.navLink}>
            <FaTasks className={styles.navIcon} /> Activities
          </Link>
        </li>
        <li className={styles.navItem}>
          <Link href="/Profile" className={styles.navLink}>
            <FaUser className={styles.navIcon} /> Profile
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navigation;
