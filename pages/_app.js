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
      <div className="flex flex-col bg-gray-50" style={{ height: '100dvh' }}>
        <Navbar />
        {/* Desktop: nội dung scroll trong khung cố định, không cuộn cả trang */}
        {/* Mobile: pb-24 tránh bị che bởi bottom nav */}
        <main className="flex-1 overflow-y-auto pb-24 md:pb-0">
          <Component {...pageProps} />
        </main>
        {/* Footer chỉ hiện trên desktop */}
        <footer className="hidden md:block bg-white border-t border-gray-100 py-4 flex-shrink-0">
          <div className="max-w-6xl mx-auto px-4 text-center text-sm text-gray-400">
            <p className="hanzi font-medium text-gray-500">学中文，每天进步一点点 🌟</p>
          </div>
        </footer>
      </div>
    </>
  );
}
