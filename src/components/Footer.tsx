import Link from "next/link";
import { FaFacebook, FaInstagram, FaTwitter } from "react-icons/fa";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-footerC text-text text-sm px-6 md:px-12 lg:px-24 py-10 mt-16">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        {/* Logo and Copyright */}
        <div className="text-center md:text-left">
          <Link href="/" className="text-xl font-bold text-footerText">
            LOQTA
          </Link>
          <p className="text-muted mt-1">&copy; {year} Loqta Shop</p>
        </div>

        {/* Quick Links */}
        <div className="flex gap-6 text-muted">
          <Link href="/about" className="hover:text-heading">
            About
          </Link>
          <Link href="/contact" className="hover:text-heading">
            Contact
          </Link>
          <Link href="/faq" className="hover:text-heading">
            FAQ
          </Link>
        </div>

        {/* Social Icons */}
        <div className="flex gap-4 text-loqta text-lg">
          {[FaFacebook, FaInstagram, FaTwitter].map((Icon, idx) => (
            <Icon
              key={idx}
              className="hover:scale-110 transition-transform cursor-pointer"
            />
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
