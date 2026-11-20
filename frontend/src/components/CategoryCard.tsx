import React from "react";
import Image from "next/image";

interface Props {
  icon: string;
  label: string;
}

const CategoryCard: React.FC<Props> = ({ icon, label }) => {
  return (
    <div className="flex flex-col items-center justify-center bg-white p-4 rounded-lg shadow hover:shadow-md transition">
      <Image src={icon} alt={label} width={50} height={50} />
      <span className="mt-2 text-sm font-medium text-center">{label}</span>
    </div>
  );
};

export default CategoryCard;
