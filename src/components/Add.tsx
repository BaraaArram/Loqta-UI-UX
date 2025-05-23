"use client";

import { useState } from "react";

const Add = () => {
  const [quantity, setQuantity] = useState(1);

  // TEMP
  const stock = 4;

  const handleQuantity = (type: "i" | "d") => {
    if (type === "d" && quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
    if (type === "i" && quantity < stock) {
      setQuantity((prev) => prev + 1);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <h4 className="font-medium text-text">Choose a Quantity</h4>
      <div className="flex justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-secondary py-2 px-4 rounded-3xl flex items-center justify-between w-32 text-text">
            <button
              className="cursor-pointer text-xl"
              onClick={() => handleQuantity("d")}
            >
              -
            </button>
            {quantity}
            <button
              className="cursor-pointer text-xl"
              onClick={() => handleQuantity("i")}
            >
              +
            </button>
          </div>
          <div className="text-xs mb-2 text-text">
            Only <span className="text-primary">{stock} items</span> left <br />
            {"Don't"} miss it
          </div>
          <button className="w-36 text-sm rounded-3xl ring-1 ring-primary text-primary py-2 px-4 hover:bg-primary hover:text-white disabled:cursor-not-allowed disabled:bg-pink-200 disabled:text-white disabled:ring-0">
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default Add;
