// pages/register.js
import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import styles from './Auth.module.css'; // Shared CSS module

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      // Store token in localStorage
      localStorage.setItem('token', data.token);
      // Redirect to the intended page or profile page
      router.push(router.query.next || '/profile');
    } else {
      setError(data.msg);
    }
  };

  return (
    <div className={styles.authContainer}>
      <h2>Register</h2>
      {error && <p className={styles.error}>{error}</p>}
      <form onSubmit={handleSubmit} className={styles.authForm}>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className={styles.authInput}
        />
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
          Register
        </button>
      </form>
      <div className={styles.separator}>
        <hr />
        <span>or</span>
        <hr />
      </div>
      <p>
        Already have an account?{' '}
        <Link
          href={{ pathname: '/login', query: { next: router.query.next || '/' } }}
          className={styles.authLink}
        >
          Login
        </Link>
      </p>
    </div>
  );
}