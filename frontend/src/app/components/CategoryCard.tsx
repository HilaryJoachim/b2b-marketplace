import React from "react";

interface CategoryCardProps {
  icon: string;
  label: string;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ icon, label }) => {
  return (
    <div className="flex flex-col items-center justify-center p-4 border rounded-lg hover:shadow-md transition bg-white">
      <img src={icon} alt={label} className="w-12 h-12 mb-2" />
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </div>
  );
};

export default CategoryCard;
