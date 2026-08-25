import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { LanguageProvider } from '@/components/LanguageProvider';

export const metadata = {
  title: 'Legal Thread BD',
  description: 'An Integrated Digital Legal Service Portal',
};

// Runs before React hydrates, so the correct theme is applied immediately
// and there's no flash of the wrong (light/dark) theme on page load.
const themeInitScript = `
(function () {
  try {
    var saved = localStorage.getItem('lt_theme');
    var theme = saved === 'dark' || saved === 'light' ? saved : 'light';
    document.documentElement.setAttribute('data-theme', theme);
  } catch (e) {}
})();
`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body suppressHydrationWarning>
        <ThemeProvider>
          <LanguageProvider>{children}</LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}