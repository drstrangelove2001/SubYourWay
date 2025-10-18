import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SubYourWay - Context-aware, culture-localized subtitles",
  description: "Transform, not translate, your videos to Singlish with AI-powered context-aware subtitles",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}

