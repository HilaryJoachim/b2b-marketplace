import React from "react";
import Image from "next/image";

interface Props {
  image: string;
  title: string;
  price: string;
}

const FeaturedProductCard: React.FC<Props> = ({ image, title, price }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition">
      <Image
        src={image}
        alt={title}
        width={300}
        height={200}
        className="rounded-lg object-cover"
      />
      <h3 className="mt-3 text-lg font-semibold">{title}</h3>
      <p className="text-sm text-gray-600">{price}</p>
    </div>
  );
};

export default FeaturedProductCard;
