"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const Menu = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative z-50">
      {/* Menu Icon */}
      <Image
        src="/menu.png"
        alt="Menu"
        width={28}
        height={28}
        className="cursor-pointer"
        onClick={() => setOpen((prev) => !prev)}
      />

      {/* Overlay + Slide Menu */}
      <AnimatePresence>
        {open && (
          <>
            {/* Dark Overlay */}
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />

            {/* Slide Down Menu */}
            <motion.div
              className="fixed left-0 top-0 w-full h-[100vh] bg-primary text-text flex flex-col items-center justify-center gap-6 text-lg z-50"
              initial={{ y: "-100%" }}
              animate={{ y: 0 }}
              exit={{ y: "-100%" }}
              transition={{ type: "spring", stiffness: 80 }}
            >
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="hover:text-loqta hover:underline"
              >
                Home
              </Link>
              <Link
                href="/shop"
                onClick={() => setOpen(false)}
                className="hover:text-loqta hover:underline"
              >
                Shop
              </Link>
              <Link
                href="/deals"
                onClick={() => setOpen(false)}
                className="hover:text-loqta hover:underline"
              >
                Deals
              </Link>
              <Link
                href="/about"
                onClick={() => setOpen(false)}
                className="hover:text-loqta hover:underline"
              >
                About
              </Link>
              <Link
                href="/contact"
                onClick={() => setOpen(false)}
                className="hover:text-loqta hover:underline"
              >
                Contact
              </Link>
              <Link
                href="/logout"
                onClick={() => setOpen(false)}
                className="hover:text-loqta hover:underline"
              >
                Logout
              </Link>
              <Link
                href="/cart"
                onClick={() => setOpen(false)}
                className="hover:text-loqta hover:underline flex items-center"
              >
                Cart{" "}
                <span className="ml-1 bg-red-500 px-2 py-0.5 rounded text-sm">
                  1
                </span>
              </Link>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Menu;
