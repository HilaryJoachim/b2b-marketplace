"use client";

import {
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();

  if (pathname?.startsWith("/supplier/dashboard") || pathname?.startsWith("/buyer/dashboard")) {
    return null;
  }
  return (
    <footer className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-6 pt-12 pb-6 mt-16">
      <div className="max-w-7xl mx-auto grid md:grid-cols-4 sm:grid-cols-2 gap-8">
        {/* Company Info */}
        <div>
          <h3 className="text-lg font-semibold mb-4">B2B Marketplace</h3>
          <p>Connecting African businesses to global sellers with trust and speed.</p>
        </div>

        {/* Contact Info */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
          <div className="flex items-start gap-2 text-sm mb-2"><Phone size={16} className="mt-0.5" /> +91 87318 44663</div>
          <div className="flex items-start gap-2 text-sm mb-2"><Mail size={16} className="mt-0.5" /> info@b2bmarketplace.com</div>
          <div className="flex items-start gap-2 text-sm"><MapPin size={16} className="mt-0.5" /> Greater Noida, India</div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="/" className="hover:text-primary transition">Home</Link></li>
            <li><Link href="/#products" className="hover:text-primary transition">Products</Link></li>
            <li><Link href="/#features" className="hover:text-primary transition">Why Choose Us</Link></li>
            <li><Link href="/#contact" className="hover:text-primary transition">Contact</Link></li>
          </ul>
        </div>

        {/* Social Media */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
          <div className="flex gap-4">
            <Link href="#" className="hover:text-primary transition" aria-label="LinkedIn"><Linkedin size={22} /></Link>
            <Link href="#" className="hover:text-primary transition" aria-label="Facebook"><Facebook size={22} /></Link>
            <Link href="#" className="hover:text-primary transition" aria-label="Instagram"><Instagram size={22} /></Link>
            <Link href="#" className="hover:text-primary transition" aria-label="Twitter"><Twitter size={22} /></Link>
          </div>
        </div>
      </div>

      <hr className="my-6 border-gray-300 dark:border-gray-600" />

      <div className="text-center text-sm">
        © {new Date().getFullYear()} B2B Marketplace. All rights reserved.
      </div>
    </footer>
  );
}
