import Link from "next/link";

export default function CtaSection() {
  return (
    <section className="py-16 px-6 bg-primary text-white text-center rounded-2xl shadow-lg mt-16 max-w-7xl mx-auto">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
        <p className="text-lg mb-8 text-white/90">
          Join hundreds of businesses already using our platform. Expand your reach and discover new opportunities.
        </p>
        <Link
          href="#contact"
          className="inline-block bg-white text-primary font-bold px-8 py-3 rounded-lg hover:bg-gray-100 hover:shadow-md transition-all duration-300"
        >
          Sign Up Now
        </Link>
      </div>
    </section>
  );
}
