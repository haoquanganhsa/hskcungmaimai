import '../styles/globals.css';
import Head from 'next/head';
import Navbar from '../components/Navbar';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#2563eb" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <title>HSK Học Tiếng Trung</title>
      </Head>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main>
          <Component {...pageProps} />
        </main>
        {/* Footer - hidden on mobile (bottom nav takes its place) */}
        <footer className="hidden md:block bg-white border-t border-gray-100 py-8 mt-16">
          <div className="max-w-6xl mx-auto px-4 text-center text-sm text-gray-400">
            <p className="hanzi text-lg font-medium text-gray-600 mb-1">学中文，每天进步一点点 🌟- Phạm Mai</p>
            <p>Học tiếng Trung, mỗi ngày tiến bộ một chút - Nếu tiến bộ thì cho Chồng xin 500k - STK 0982481134 BIDV</p>
            <p className="mt-2 text-xs">HSK 1 · HSK 2 · Dành cho người mới bắt đầu cũng như Mai Mai</p>
          </div>
        </footer>
      </div>
    </>
  );
}
