import Link from "next/link";
import Image from "next/image";

const products = [
  {
    title: "Stylish Jacket",
    price: "$49",
    desc: "Elegant and warm jacket for everyday wear.",
    frontImg:
      "https://images.pexels.com/photos/7156883/pexels-photo-7156883.jpeg?auto=compress&cs=tinysrgb&w=600",
    backImg:
      "https://images.pexels.com/photos/7156884/pexels-photo-7156884.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
  {
    title: "Casual Shirt",
    price: "$39",
    desc: "Comfortable cotton shirt in multiple colors.",
    frontImg:
      "https://images.pexels.com/photos/5886041/pexels-photo-5886041.jpeg?auto=compress&cs=tinysrgb&w=600",
    backImg:
      "https://images.pexels.com/photos/5886042/pexels-photo-5886042.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
  {
    title: "Running Shoes",
    price: "$69",
    desc: "Breathable and lightweight running shoes.",
    frontImg:
      "https://images.pexels.com/photos/1866149/pexels-photo-1866149.jpeg?auto=compress&cs=tinysrgb&w=600",
    backImg:
      "https://images.pexels.com/photos/994517/pexels-photo-994517.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
  {
    title: "Leather Bag",
    price: "$89",
    desc: "Stylish leather bag, perfect for daily use.",
    frontImg:
      "https://images.pexels.com/photos/2983464/pexels-photo-2983464.jpeg?auto=compress&cs=tinysrgb&w=600",
    backImg:
      "https://images.pexels.com/photos/2983467/pexels-photo-2983467.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
];

const ProductCard = ({ title, price, desc, frontImg, backImg }: any) => (
  <Link
    href="/test"
    className="group w-full sm:w-[45%] lg:w-[22%] bg-cardC p-4 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-200"
  >
    <div className="relative w-full h-80 rounded-xl overflow-hidden">
      <Image
        src={frontImg}
        alt={`Front of ${title}`}
        fill
        sizes="25vw"
        className="absolute object-cover z-10 transition-opacity duration-500 group-hover:opacity-0"
      />
      <Image
        src={backImg}
        alt={`Back of ${title}`}
        fill
        sizes="25vw"
        className="absolute object-cover"
      />
    </div>
    <div className="mt-4 flex justify-between text-[var(--color-heading)] font-semibold text-base">
      <span>{title}</span>
      <span className="text-[var(--color-accent)]">{price}</span>
    </div>
    <p className="text-sm text-[var(--color-muted)] mt-1">{desc}</p>
    <button className="mt-3 rounded-xl border border-[var(--color-accent)] text-[var(--color-accent)] w-max py-2 px-4 text-xs hover:bg-[var(--color-accent)] hover:text-white transition-colors">
      Add to Cart
    </button>
  </Link>
);

const ProductList = () => {
  return (
    <div className="mt-12 bg-listbg px-4 py-10 rounded-3xl shadow-inner">
      <h2 className="text-2xl font-bold text-[var(--color-heading)] mb-8">
        Latest Products
      </h2>
      <div className="flex flex-wrap justify-between gap-x-6 gap-y-12">
        {products.map((product, idx) => (
          <ProductCard key={idx} {...product} />
        ))}
      </div>
    </div>
  );
};

export default ProductList;
