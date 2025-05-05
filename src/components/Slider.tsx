"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const slides = [
  {
    id: 1,
    image:
      "https://media.gettyimages.com/id/1338279610/photo/cropped-shot-of-young-asian-woman-carrying-a-shopping-basket-standing-along-the-dairy-aisle.jpg?s=2048x2048&w=gi&k=20&c=AjwTjcbATboL2ixK5FQdygIy94hVk63vfNhk_N6dN_I=cha",
    title: "Product 2",
    desc: "Description for product 2",
    url: "/",
    bg: "bg-gradient-to-r from-slider1From to-slider1To",
  },
  {
    id: 2,
    image:
      "https://images.pexels.com/photos/27925615/pexels-photo-27925615/free-photo-of-a-waterfall-in-the-middle-of-a-forest.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    title: "Product 2",
    desc: "Description for product 2",
    url: "/",
    bg: "bg-gradient-to-r from-slider2From to-slider2To",
  },
  {
    id: 3,
    image:
      "https://images.pexels.com/photos/31829770/pexels-photo-31829770/free-photo-of-solitary-red-tulip-in-lush-green-meadow.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    title: "Product 2",
    desc: "Description for product 2",
    url: "/",
    bg: "bg-gradient-to-r from-TSF to-slider3To",
  },
];

const Slider = () => {
  const [current, setCurrent] = useState(0);

  return (
    <div className="h-[calc(100vh-80px)] overflow-hidden">
      <div
        className="w-max h-full flex transition-all ease-in-out duration-1000"
        style={{ transform: `translateX(-${current * 100}vw)` }}
      >
        {slides.map((slide) => (
          <div
            className={`${slide.bg} w-screen h-full flex flex-col gap-16 xl:flex-row`}
            key={slide.id}
          >
            {/* TEXT CONTAINER */}
            <div className="h-1/2 xl:w-1/2 xl:h-full flex items-center justify-center gap-8 flex-col 2xl:gap-12 text-center">
              <h2 className="text-xl lg:text-3xl 2xl:text-5xl text-sliderText">
                {slide.desc}
              </h2>
              <h1 className="text-5xl lg:text-6xl 2xl:text-8xl font-semibold text-sliderText">
                {slide.title}
              </h1>
              <Link href={slide.url}>
                <button className="rounded-md bg-black py-3 px-4 text-sliderText">
                  SHOP NOW
                </button>
              </Link>
            </div>
            {/* IMAGE CONTAINER */}
            <div className="h-1/2 xl:w-1/2 xl:h-full relative">
              <Image
                src={slide.image}
                alt={slide.title}
                layout="fill"
                objectFit="cover"
                quality={90} // Set quality to ensure high resolution
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover"
              />
            </div>
          </div>
        ))}
      </div>
      <div className="absolute m-auto left-1/2 bottom-8 flex gap-4">
        {slides.map((slide, index) => (
          <div
            className={`w-3 h-3 rounded-full ring-1 ring-gray-600 cursor-pointer flex justify-center items-center ${
              current === index ? "scale-150" : ""
            }`}
            key={slide.id}
            onClick={() => {
              setCurrent(index);
            }}
          >
            {current === index && (
              <div className="w-[6px] h-[6px]  bg-gray-600 rounded-full"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Slider;
