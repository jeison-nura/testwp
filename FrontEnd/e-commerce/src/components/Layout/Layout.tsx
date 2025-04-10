import React, { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-background-default">
      <Header />
      <main className="flex-grow">
        <div className="container mx-auto max-w-7xl px-4 my-16">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
