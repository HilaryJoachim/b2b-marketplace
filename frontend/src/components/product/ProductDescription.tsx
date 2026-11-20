interface ProductDescriptionProps {
  description?: string;
}

export default function ProductDescription({ description }: ProductDescriptionProps) {
  return (
    <section id="description" className="scroll-mt-[120px] pt-10 pb-8">
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-7 bg-[#F36A1B] rounded-full" />
        <h2 className="text-xl font-bold text-gray-900">
          Product Description
        </h2>
      </div>

      {/* Description Body */}
      <div className="space-y-8">
        {/* Overview */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-base font-semibold text-gray-800 mb-3">
            Overview
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
            {description || "No description provided."}
          </p>
        </div>

      </div>
    </section>
  );
}
