import './globals.css';

export const metadata = {
  title: 'Bức Thư Tình Gửi Em 💕 | Will You Be My Girlfriend?',
  description: 'Trang web tỏ tình lãng mạn dành riêng cho người con gái anh yêu nhất trên đời. Từng khoảnh khắc, từng nhịp đập trái tim này đều dành cho em.',
  openGraph: {
    title: 'Bức Thư Tình Dành Riêng Cho Em 💕',
    description: 'Có một điều từ tận đáy lòng anh muốn nói với em...',
    images: ['/assets/couple.jpg'],
  },
};

export const viewport = {
  themeColor: '#ff758c',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@600;700&family=Great+Vibes&family=Playfair+Display:ital,wght@0,600;0,700;1,400;1,600&family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
