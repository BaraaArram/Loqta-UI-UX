import Link from "next/link";
import Image from "next/image";

const categories = [
  {
    name: "Hardware",
    image:
      "https://images.pexels.com/photos/175039/pexels-photo-175039.jpeg?auto=compress&cs=tinysrgb&w=400",
  },
  {
    name: "Tech",
    image:
      "https://images.pexels.com/photos/682933/pexels-photo-682933.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
  {
    name: "Category 3",
    image:
      "https://images.pexels.com/photos/31826731/pexels-photo-31826731/free-photo-of-charming-algerian-flower-market-in-algiers.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
  {
    name: "Category 4",
    image:
      "https://images.pexels.com/photos/31826731/pexels-photo-31826731/free-photo-of-charming-algerian-flower-market-in-algiers.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
  {
    name: "Category 5",
    image:
      "https://images.pexels.com/photos/31826731/pexels-photo-31826731/free-photo-of-charming-algerian-flower-market-in-algiers.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
  {
    name: "Category 6",
    image:
      "https://images.pexels.com/photos/31826731/pexels-photo-31826731/free-photo-of-charming-algerian-flower-market-in-algiers.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
];

const CategoryList = () => {
  return (
    <div className="px-4 py-8">
      <div className="flex overflow-x-auto space-x-6 scroll-smooth snap-x snap-mandatory pb-4 scrollbar-hide">
        {categories.map((category, index) => (
          <Link
            href="/list?cat=test"
            key={index}
            className="min-w-[250px] sm:min-w-[300px] md:min-w-[350px] lg:min-w-[400px] xl:min-w-[450px] flex-shrink-0 snap-start"
          >
            <div className="relative w-full h-[200px] sm:h-[250px] md:h-[300px] lg:h-[350px] xl:h-[400px] rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-white to-gray-100">
              <Image
                src={category.image}
                alt={category.name}
                layout="fill"
                objectFit="cover"
                className="transition-transform duration-300 hover:scale-110"
              />
              <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/60 to-transparent text-white px-4 py-2 text-lg font-semibold">
                {category.name}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CategoryList;
