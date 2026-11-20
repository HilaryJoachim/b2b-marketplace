export default function FeaturesSection() {
  const features = [
    {
      title: "Navigate Easy",
      description: "Browse or search product.",
    },
    {
      title: "Verified Suppliers",
      description: "Connect with verified supplier.",
    },
    {
      title: "Fast Response",
      description: "Request a Quote.",
    },
    {
      title: "Global Reach",
      description: "Close deals perfectly.",
    },
  ];

  return (
    <section className="py-16 bg-gray-100 dark:bg-gray-800" id="features">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h2 className="text-3xl font-bold mb-10">Why Choose Us?</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="p-6 bg-white dark:bg-gray-900 rounded-xl shadow-sm hover:shadow-md transition">
              <h3 className="text-xl font-semibold mb-3 text-secondary dark:text-primary">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
