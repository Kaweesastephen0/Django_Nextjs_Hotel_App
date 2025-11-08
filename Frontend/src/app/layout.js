
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import Navbar from "./components/Navbar";
import { SearchContextProvider } from "./context/searchContext";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Hotel booking app",
  description: "A nextjs Hotel room boing app",
};

export default function RootLayout({ children }) {
  return (
  
    <html lang="en">
      <body
      
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}>

      <SearchContextProvider>
        <Navbar/>
        {children}
  
      </SearchContextProvider>
      </body>
    </html>

  );
}
