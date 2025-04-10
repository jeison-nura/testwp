import React from "react";
import { PuzzlePieceIcon } from '@heroicons/react/24/outline';
import { 
  FaceSmileIcon, 
  ChatBubbleLeftRightIcon, 
  PhotoIcon, 
  VideoCameraIcon 
} from '@heroicons/react/24/outline';

const Footer: React.FC = () => {
  return (
    <footer className="mt-auto py-8 px-4 bg-background-header text-white border-t border-gray-800">
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 justify-between items-center">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start mb-4">
              <PuzzlePieceIcon className="h-7 w-7 text-[#08d9d6] mr-2" />
              <span className="font-bold text-xl">GameStore</span>
            </div>
            <p className="text-sm text-gray-300">
              Tu tienda de videojuegos favorita con los mejores títulos y ofertas.
            </p>
          </div>

          <div className="text-center">
            <h3 className="font-bold text-lg mb-4">Enlaces rápidos</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-300 hover:text-primary-main transition-colors">
                  Juegos
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-primary-main transition-colors">
                  Novedades
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-primary-main transition-colors">
                  Ofertas
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-primary-main transition-colors">
                  Soporte
                </a>
              </li>
            </ul>
          </div>

          <div className="text-center md:text-right">
            <h3 className="font-bold text-lg mb-4">Síguenos</h3>
            <div className="flex justify-center md:justify-end space-x-2">
              <button className="text-primary-main hover:text-white hover:bg-primary-main hover:bg-opacity-10 p-2 rounded-full transition-colors">
                <FaceSmileIcon className="h-6 w-6" />
              </button>
              <button className="text-primary-main hover:text-white hover:bg-primary-main hover:bg-opacity-10 p-2 rounded-full transition-colors">
                <PhotoIcon className="h-6 w-6" />
              </button>
              <button className="text-primary-main hover:text-white hover:bg-primary-main hover:bg-opacity-10 p-2 rounded-full transition-colors">
                <VideoCameraIcon className="h-6 w-6" />
              </button>
              <button className="text-primary-main hover:text-white hover:bg-primary-main hover:bg-opacity-10 p-2 rounded-full transition-colors">
                <ChatBubbleLeftRightIcon className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-gray-800 text-center text-sm text-gray-400">
          <p>© {new Date().getFullYear()} GameStore. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
