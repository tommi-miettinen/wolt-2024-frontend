import { useEffect, useState } from "react";
import { calculateDeliveryFee } from "./services/feeCalculationService";
import woltlogo from "./assets/woltlogo.svg";
import NumberInput from "./components/NumberInput";

const isRushHour = (datetime: string) => {
  const date = new Date(datetime);
  const hour = date.getHours();

  return hour >= 15 && hour <= 19;
};

const App = () => {
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [cartValue, setCartValue] = useState(0);
  const [distance, setDistance] = useState(0);
  const [itemCount, setItemCount] = useState(0);

  //In a production app id use date-fns / momentjs / Temporal
  const [datetime, setDatetime] = useState(new Date().toISOString().slice(0, 16));

  useEffect(() => {
    if (!distance || !cartValue || !itemCount || !datetime) return;

    const fee = calculateDeliveryFee(distance, cartValue, itemCount, isRushHour(datetime));
    setDeliveryFee(fee);
  }, [cartValue, distance, itemCount, datetime]);

  return (
    <div className="text-base w-screen h-screen bg-purple-50 flex flex-col items-center overflow-hidden">
      <div className="bg-white p-4 h-[80px] w-full flex items-center justify-center">
        <div className="w-[1200px]">
          <img src={woltlogo} className="h-[36px] w-[120px]" />
        </div>
      </div>
      <div className="w-full mt-8 sm:m-auto sm:w-[600px] p-1 flex flex-col gap-8">
        <h1 className="font-omnes-bold text-3xl sm:text-4xl">Calculate cost of delivery</h1>
        <div className="font-semibold w-full p-4 py-8 sm:p-8 flex flex-col gap-4 rounded-xl bg-white shadow-xl">
          <div className="flex flex-col gap-1">
            <label htmlFor="cart-value">Cart Value</label>
            <NumberInput
              id="cart-value"
              data-testid="cartValue"
              className="border-black border-2 p-2 rounded-lg"
              value={cartValue}
              onChange={(value) => setCartValue(value)}
            ></NumberInput>
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="item-count">Item count</label>
            <NumberInput
              id="item-count"
              data-testid="numberOfItems"
              className="border-black/80  border-2 p-2 rounded-lg"
              value={itemCount}
              onChange={(value) => setItemCount(value)}
            ></NumberInput>
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="distance">Distance</label>
            <NumberInput
              id="distance"
              data-testid="deliveryDistance"
              className="border-black  border-2 p-2 rounded-lg"
              value={distance}
              onChange={(value) => setDistance(value)}
            ></NumberInput>
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="date">Date</label>
            <input
              className="border-black border-2 p-2.5 rounded-lg text-gray-900 text-sm  focus:ring-blue-500 focus:border-blue-500 block w-full"
              id="date"
              value={datetime}
              onChange={(e) => setDatetime(e.target.value)}
              type="datetime-local"
            />
          </div>
          {isRushHour(datetime) + "asd"}
          <h3 className="mt-4">
            <span>Cost of delivery </span>
            <span data-testid="fee" className="font-semibold">
              {deliveryFee.toFixed(2)}€
            </span>
          </h3>
        </div>
      </div>
    </div>
  );
};

export default App;
