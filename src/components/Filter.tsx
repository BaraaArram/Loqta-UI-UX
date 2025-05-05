const Filter = () => {
  return (
    <div className="mt-12 flex justify-between">
      <div className="flex gap-6 flex-wrap">
        <select
          name="category"
          className="py-2 rounded-2xl text-xs font-medium bg-[#EBEDED]"
        >
          <option value="">Category</option>
          <option value="electronics">Electronics</option>
          <option value="fashion">Fashion</option>
          <option value="books">Books</option>
        </select>

        <input
          type="text"
          name="min"
          placeholder="min price"
          className="text-xs rounded-2xl pl-2 w-24 ring-1 ring-gray-400"
        />
        <input
          type="text"
          name="max"
          placeholder="max price"
          className="text-xs rounded-2xl pl-2 w-24 ring-1 ring-gray-400"
        />

        <select
          name="condition"
          className="py-2 rounded-2xl text-xs font-medium bg-[#EBEDED]"
        >
          <option value="">Condition</option>
          <option value="new">New</option>
          <option value="used">Used</option>
          <option value="refurbished">Refurbished</option>
        </select>

        <select
          name="price-range"
          className="py-2 rounded-2xl text-xs font-medium bg-[#EBEDED]"
        >
          <option value="">Price Range</option>
          <option value="0-50">$0 - $50</option>
          <option value="50-100">$50 - $100</option>
          <option value="100-500">$100 - $500</option>
        </select>

        <select
          name="brand"
          className="py-2 rounded-2xl text-xs font-medium bg-[#EBEDED]"
        >
          <option value="">Brand</option>
          <option value="apple">Apple</option>
          <option value="samsung">Samsung</option>
          <option value="nike">Nike</option>
        </select>

        <select
          name="availability"
          className="py-2 rounded-2xl text-xs font-medium bg-[#EBEDED]"
        >
          <option value="">Availability</option>
          <option value="in-stock">In Stock</option>
          <option value="out-of-stock">Out of Stock</option>
          <option value="pre-order">Pre-order</option>
        </select>
      </div>
      <div className="">
        <select
          name="availability"
          className="py-2 rounded-2xl text-xs font-medium bg-[#EBEDED]"
        >
          <option >Sort By</option>
          <option value="">Price (low to high)</option>
          <option value="">Price (high to low)</option>
          <option value="">Newest</option>
          <option value="">Oldest</option>
        </select>
      </div>
    </div>
  );
};

export default Filter;
