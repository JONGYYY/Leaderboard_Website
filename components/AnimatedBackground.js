// src/components/AnimatedBackground.js

import React, { useEffect } from 'react';
import styles from './AnimatedBackground.module.css';

const AnimatedBackground = () => {
  useEffect(() => {
    let width, height, largeHeader, canvas, ctx, circles, target, animateHeader = true;

    const initHeader = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      target = { x: 0, y: height };

      largeHeader = document.getElementById('large-header');
      largeHeader.style.height = height + 'px';

      canvas = document.getElementById('demo-canvas');
      canvas.width = width;
      canvas.height = height;
      ctx = canvas.getContext('2d');

      circles = [];
      for (let x = 0; x < width * 0.5; x++) {
        const c = new Circle();
        circles.push(c);
      }
      animate();
    };

    const scrollCheck = () => {
      animateHeader = !(document.body.scrollTop > height);
    };

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      largeHeader.style.height = height + 'px';
      canvas.width = width;
      canvas.height = height;
    };

    const animate = () => {
      if (animateHeader) {
        ctx.clearRect(0, 0, width, height);
        circles.forEach(circle => circle.draw());
      }
      requestAnimationFrame(animate);
    };

    function Circle() {
      this.pos = {};
      initCircle(this);

      this.draw = function () {
        if (this.alpha <= 0) {
          initCircle(this);
        }
        this.pos.y -= this.velocity;
        this.alpha -= 0.0005;
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.scale * 10, 0, 2 * Math.PI, false);
        ctx.fillStyle = `rgba(255,255,255,${this.alpha})`;
        ctx.fill();
      };
    }

    const initCircle = (circle) => {
      circle.pos.x = Math.random() * width;
      circle.pos.y = height + Math.random() * 100;
      circle.alpha = 0.1 + Math.random() * 0.3;
      circle.scale = 0.1 + Math.random() * 0.3;
      circle.velocity = Math.random();
    };

    initHeader();
    window.addEventListener('scroll', scrollCheck);
    window.addEventListener('resize', resize);

    
    return () => {
      window.removeEventListener('scroll', scrollCheck);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className={styles.container}>
      <div id="large-header" className={styles.largeHeader}>
        <canvas id="demo-canvas" className={styles.canvasElement}></canvas>
      </div>
    </div>
  );
};

export default AnimatedBackground;
