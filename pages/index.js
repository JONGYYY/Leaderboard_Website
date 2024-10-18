
// src/pages/index.js

import React from 'react';
import Link from 'next/link';
import { Typewriter } from 'react-simple-typewriter';
import AnimatedBackground from '../components/AnimatedBackground';
import styles from './FrontPage.module.css';

const FrontPage = () => {
  return (
    <div className={styles.frontPage}>
      <AnimatedBackground />
      <header className={styles.header}>
        <h1>App-In Club Coding Leaderboard</h1>
        <p className={styles.typedText}>
          <Typewriter
            words={[
              'Join our coding challenges.',
              'Track your progress.',
              'Compete with peers.',
              'Earn badges and rewards!',
            ]}
            loop={true}
            cursor
            cursorStyle="|"
            typeSpeed={70}
            deleteSpeed={50}
            delaySpeed={1000}
          />
        </p>
        <nav className={styles.nav}>
          <ul>
            <li>
              <Link href="/Leaderboard">Leaderboard</Link>
            </li>
            <li>
              <Link href="/Progress">Progress</Link>
            </li>
            <li>
              <Link href="/Activities">Activities</Link>
            </li>
            <li>
              <Link href="/Profile">Profile</Link>
            </li>
          </ul>
        </nav>
      </header>
    </div>
  );
};

export default FrontPage;











