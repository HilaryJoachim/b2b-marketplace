interface ProductAttributesProps {
  specifications?: { key: string; value: string }[];
}

export default function ProductAttributes({ specifications }: ProductAttributesProps) {
  const hasSpecs = specifications && specifications.length > 0;

  return (
    <section id="attributes" className="scroll-mt-[120px] pt-10 pb-8">
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-7 bg-[#F36A1B] rounded-full" />
        <h2 className="text-xl font-bold text-gray-900">
          Product Attributes
        </h2>
      </div>

      {!hasSpecs ? (
        <div className="text-gray-500 text-sm italic py-4">No attributes available for this product.</div>
      ) : (
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          {specifications.map((attr, index) => (
            <div
              key={attr.key}
              className={`
                grid grid-cols-1 sm:grid-cols-[200px_1fr] md:grid-cols-[240px_1fr]
                ${index !== specifications.length - 1 ? "border-b border-gray-100" : ""}
              `}
            >
              {/* Label */}
              <div className="px-5 py-3.5 bg-gray-50 text-sm font-medium text-gray-600 border-r border-gray-100">
                {attr.key}
              </div>
              {/* Value */}
              <div className="px-5 py-3.5 text-sm text-gray-900 font-medium">
                {attr.value}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
