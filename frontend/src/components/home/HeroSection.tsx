import Link from "next/link";

export default function HeroSection() {
  return (
    <section
      className="relative bg-cover bg-center text-white py-24 px-6"
      style={{ backgroundImage: "url('/images/hero-bg.jpg')" }}
    >
      {/* Optional: Add a dark overlay so text is easier to read if image is bright
      <div className="absolute inset-0 bg-black/40 z-0"></div> */}
      
      <div className="relative z-10 text-center max-w-3xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-bold mb-4">SMART. FAST. AFFORDABLE</h1>
        <p className="text-lg sm:text-xl max-w-2xl mx-auto">
          Connecting African Business to Global Sellers.
        </p>
        <div className="mt-8">
          <Link
            href="#products"
            className="inline-block bg-primary text-white font-medium px-8 py-3 rounded-lg shadow hover:bg-secondary transition-colors duration-300"
          >
            Explore Products
          </Link>
        </div>
      </div>
    </section>
  );
}
