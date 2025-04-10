import React from "react";
import { Link as RouterLink } from "react-router-dom";
import { PuzzlePieceIcon, SparklesIcon } from '@heroicons/react/24/outline';

interface NavLinkProps {
  to: string;
  children: React.ReactNode;
  startIcon?: React.ReactNode;
}

const NavLink: React.FC<NavLinkProps> = ({ to, children, startIcon }) => (
  <RouterLink 
    to={to} 
    className="text-white mx-4 py-2 px-3 hover:bg-primary-main hover:bg-opacity-10 rounded transition-colors"
  >
    <div className="flex items-center">
      {startIcon && <span className="mr-1">{startIcon}</span>}
      {children}
    </div>
  </RouterLink>
);

const Header: React.FC = () => {
  return (
    <header className="bg-background-header shadow-md">
      <div className="container mx-auto max-w-7xl">
        <div className="flex items-center justify-between py-4 px-4">
          <div className="flex items-center mr-8 hidden md:flex">
            <PuzzlePieceIcon className="h-7 w-7 text-[#08d9d6] mr-1" />
            <RouterLink
              to="/"
              className="font-bold text-white no-underline text-xl"
            >
              GameStore
            </RouterLink>
          </div>

          <div className="flex-grow flex">
            <NavLink
              to="/"
              startIcon={<PuzzlePieceIcon className="h-5 w-5" />}
            >
              Juegos
            </NavLink>
            <NavLink
              to="/"
              startIcon={<SparklesIcon className="h-5 w-5" />}
            >
              Novedades
            </NavLink>
          </div>

          <div className="flex-shrink-0">{/* Carrito de compras eliminado */}</div>
        </div>
      </div>
    </header>
  );
};

export default Header;
