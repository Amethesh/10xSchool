import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo relative overflow-hidden">
      <Image src="/images/8bitBG9.png" fill alt="BG" className="object-cover" />

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="pixel-panel p-6 sm:p-8 backdrop-blur-sm bg-black/20 text-center max-w-2xl w-full">
        
          <div className="mb-8">
            <h1 className="pixel-font text-6xl sm:text-8xl md:text-9xl mb-4 bg-gradient-to-r from-red-400 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-pulse">
              404
            </h1>
            <div className="w-32 h-1 bg-gradient-to-r from-red-400 to-purple-400 mx-auto rounded-full mb-6"></div>
          </div>

          {/* Error Messages */}
          <div className="space-y-4 mb-8">
            <h2 className="pixel-font text-lg sm:text-xl text-cyan-300">
              SYSTEM ERROR
            </h2>
            <div className="pixel-font text-xs sm:text-sm text-red-400 space-y-2">
              <p className="blink">► PAGE NOT FOUND IN DATABASE</p>
              <p>► LOCATION: UNKNOWN</p>
              <p>► STATUS: MISSING</p>
            </div>
            <p className="pixel-font text-xs text-gray-300 mt-4">
              THE REQUESTED RESOURCE HAS BEEN
              <br />
              DELETED OR MOVED TO ANOTHER DIMENSION
            </p>
          </div>

          {/* Retro Terminal Style Actions */}
          <div className="space-y-4">
            <div className="pixel-font text-xs text-green-400 mb-4">
              ► SELECT AN OPTION:
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/">
                <button className="pixel-button w-full !text-black sm:w-auto">
                  RETURN HOME
                </button>
              </Link>
              <Link href="/student/levels">
                <button className="pixel-button pixel-button-green !text-black w-full sm:w-auto">
                  BROWSE LEVELS
                </button>
              </Link>
            </div>

            <div className="mt-6">
              <Link href="/student/dashboard">
                <button className="pixel-button-secondary-small">
                  DASHBOARD
                </button>
              </Link>
            </div>
          </div>

          {/* Terminal Footer */}
          <div className="mt-8 pt-6 border-t border-cyan-400/30">
            <div className="pixel-font text-xs text-cyan-300 space-y-1">
              <p>ERROR CODE: 404_PAGE_NOT_FOUND</p>
              <p>SYSTEM: MATH_QUEST_v2.0</p>
              <p className="text-gray-400">IF ERROR PERSISTS, CONTACT ADMIN</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
