// pages/login.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import styles from './Auth.module.css'; // Shared CSS module

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const [nextPath, setNextPath] = useState('/profile'); // Default path

  useEffect(() => {
    if (!router.isReady) return; // Wait until router is ready
    const next = router.query.next || '/profile';
    setNextPath(next);
    console.log('Next path:', next);
  }, [router.isReady, router.query.next]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('${process.env.NEXT_PUBLIC_API_BASE_URL}:5000/api/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      // Store token in localStorage
      localStorage.setItem('token', data.token);
      router.push(nextPath);
    } else {
      setError(data.msg);
    }
  };

  return (
    <div className={styles.authContainer}>
      <h2>Login</h2>
      {error && <p className={styles.error}>{error}</p>}
      <form onSubmit={handleSubmit} className={styles.authForm}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className={styles.authInput}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className={styles.authInput}
        />
        <button type="submit" className={styles.authButton}>
          Login
        </button>
      </form>
      <div className={styles.separator}>
        <hr />
        <span>or</span>
        <hr />
      </div>
      <p>
        Don&apos;t have an account?{' '}
        <Link
          href={{
            pathname: '/register',
            query: { next: nextPath },
          }}
          className={styles.authLink}
        >
          Register
        </Link>
      </p>
    </div>
  );
}
