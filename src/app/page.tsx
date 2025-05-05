import CategoryList from "@/components/CategoryList";
import ProductList from "@/components/ProductList";
import Slider from "@/components/Slider";

const HomePage = () => {
  return (
    <div className="bg-bodyC text-text">
      <Slider />

      <div className="mt-24 px-4 md:px-8 lg:px-16 xl:px-32 2xl:px-64">
        <h1 className="text-2xl font-semibold text-heading mb-8">
          Featured Products
        </h1>
        <ProductList />
      </div>

      <div className="mt-24">
        <h1 className="text-2xl font-semibold text-heading px-4 md:px-8 lg:px-16 xl:px-32 2xl:px-64 mb-12">
          Categories
        </h1>
        <CategoryList />
      </div>

      <div className="mt-24 px-4 md:px-8 lg:px-16 xl:px-32 2xl:px-64">
        <h1 className="text-2xl font-semibold text-heading mb-8">
          New Products
        </h1>
        <ProductList />
      </div>
    </div>
  );
};

export default HomePage;
