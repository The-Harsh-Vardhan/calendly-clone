import './globals.css';
import { ToastProvider } from '@/components/Toast';

export const metadata = {
  title: 'Calendly Clone — Scheduling Made Easy',
  description: 'A functional scheduling and booking web application. Create event types, set your availability, and let others book time slots through a public booking page.',
  keywords: 'scheduling, booking, calendly, meetings, calendar',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
