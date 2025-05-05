"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Bell, ShoppingCart } from "lucide-react"; // Icons from lucide-react
import CartModal from "./CartModal";

const NavIcons = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const router = useRouter();

  // Temporary: Simulating login status, replace with actual login status check
  const isLoggedIn = false;

  const handleProfile = () => {
    if (!isLoggedIn) {
      // Redirect user to login page if not logged in
      router.push("/login");
    } else {
      // Toggle profile dropdown if logged in
      setIsProfileOpen((prev) => !prev);
    }
  };

  return (
    <div className="flex items-center gap-4 xl:gap-6 relative">
      {/* Profile Icon */}
      <div className="cursor-pointer" onClick={handleProfile}>
        <User size={22} className="text-text" />
      </div>
      {isProfileOpen && (
        <div className="absolute p-4 rounded-md top-12 left-0 text-sm shadow-[0_3px_10px_rgba(0,0,0,0.2)] z-20 bg-card text-text">
          {isLoggedIn ? (
            <>
              <Link href="/profile" className="block">
                Profile
              </Link>
              <div className="mt-2 cursor-pointer">Logout</div>
            </>
          ) : (
            <div className="text-center text-sm text-text">
              Please <Link href="/login">log in</Link> to access your profile.
            </div>
          )}
        </div>
      )}

      {/* Notification Icon */}
      <div className="cursor-pointer">
        <Bell size={22} className="text-text" />
      </div>

      {/* Cart Icon */}
      <div
        className="relative cursor-pointer"
        onClick={() => setIsCartOpen((prev) => !prev)}
      >
        <ShoppingCart size={22} className="text-text" />
        <div className="absolute -top-4 right-4 w-6 h-6 bg-loqta text-white rounded-full text-sm flex items-center justify-center">
          2 {/* Cart item count */}
        </div>
      </div>

      {/* Cart Modal */}
      {isCartOpen && <CartModal />}
    </div>
  );
};

export default NavIcons;
