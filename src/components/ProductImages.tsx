"use client";

import Image from "next/image";
import { useState } from "react";

const images = [
  {
    id: 1,
    url: "https://plus.unsplash.com/premium_photo-1679913792906-13ccc5c84d44?w=500&auto=format&fit=crop&q=60",
  },
  {
    id: 2,
    url: "https://images.unsplash.com/photo-1520170350707-b2da59970118?w=500&auto=format&fit=crop&q=60",
  },
  {
    id: 3,
    url: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500&auto=format&fit=crop&q=60",
  },
  {
    id: 4,
    url: "https://images.unsplash.com/photo-1612444530582-fc66183b16f7?w=500&auto=format&fit=crop&q=60",
  },
];

const ProductImages = () => {
  const [index, setIndex] = useState(0);

  return (
    <div className="space-y-6">
      {/* Main Image */}
      <div className="h-[500px] relative">
        <Image
          src={images[index].url}
          alt="Selected product image"
          fill
          className="object-cover rounded-md"
          sizes="30vw"
        />
      </div>

      {/* Thumbnails */}
      <div className="flex justify-between gap-4 mt-8 cursor-pointer">
        {images.map((img, i) => (
          <div
            key={img.id}
            className={`w-24 h-24 relative cursor-pointer border-2 rounded-md ${
              i === index ? "border-blue-500" : "border-transparent"
            }`}
            onClick={() => setIndex(i)}
          >
            <Image
              src={img.url}
              alt={`Thumbnail ${i + 1}`}
              fill
              className="object-cover rounded-md"
              sizes="10vw"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductImages;
