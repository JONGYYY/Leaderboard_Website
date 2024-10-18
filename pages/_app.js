// // pages/_app.js
// import '../styles/globals.css'; // Import global styles
// import Header from '../components/Header';
// import Navigation from '../components/Navigation';
// import '../components/Navigation.module.css';
// import '../pages/FrontPage.module.css';
// import StreakLevel from '../components/StreakLevel';
// import 'bootstrap/dist/css/bootstrap.min.css';

// function MyApp({ Component, pageProps, router }) {
//   if (router.pathname === "/") {
   
//     return <Component {...pageProps} />;
//   } else {
    
//     return (
//       <div className="app">
//         {}
//         <Header />
//         <StreakLevel streak={4} level={2} points={250} totalPoints={300} />
//         <div className="main-layout">
//           <Navigation />
//           <div className="content">
//             <Component {...pageProps} />
//           </div>
//         </div>
//       </div>
//     );
//   }
// }

// export default MyApp;


// pages/_app.js
import '../styles/globals.css';
import Header from '../components/Header';
import Navigation from '../components/Navigation';
import StreakLevel from '../components/StreakLevel';
import 'bootstrap/dist/css/bootstrap.min.css';

function MyApp({ Component, pageProps, router }) {
  if (router.pathname === "/") {
    return (
      <div className="front-page">
        <Component {...pageProps} />
      </div>
    );
  } else {
    return (
      <div className="app">
        <Header />
        <StreakLevel streak={4} level={2} points={250} totalPoints={300} />
        <div className="main-layout">
          <Navigation />
          <div className="content">
            <Component {...pageProps} />
          </div>
        </div>
      </div>
    );
  }
}

export default MyApp;
