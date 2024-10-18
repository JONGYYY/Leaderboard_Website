// src/components/Header.js
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FaUserCircle } from 'react-icons/fa'; 
import styles from './Header.module.css'; 

const Header = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef(null);

  useEffect(() => {
    // This code runs only on the client side
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  const handleIconClick = () => {
    setShowDropdown((prev) => !prev);
  };

  const handleLogout = () => {
    // Remove token from localStorage
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setShowDropdown(false);
    // Redirect to home page
    router.push('/');
  };

  // Close dropdown when clicking outside
  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setShowDropdown(false);
    }
  };

  useEffect(() => {
    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  return (
    <header className={styles.header}>
      <div className={styles.headerLeft}>
        <Link href="/" className={styles.logo}>
          App-In Club
        </Link>
      </div>
      <div className={styles.headerRight}>
        {isAuthenticated ? (
          <div className={styles.profileContainer} ref={dropdownRef}>
            <button
              className={styles.profileIconButton}
              onClick={handleIconClick}
              aria-haspopup="true"
              aria-expanded={showDropdown}
            >
              <FaUserCircle className={styles.profileIcon} />
            </button>
            {showDropdown && (
              <div className={styles.dropdownMenu}>
                <Link href="/Profile" className={styles.dropdownItem} onClick={() => setShowDropdown(false)}>
                  Profile
                </Link>
                <button onClick={handleLogout} className={styles.dropdownItem}>
                  Log Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link href="/login" className={styles.loginLink}>
            Login
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;
