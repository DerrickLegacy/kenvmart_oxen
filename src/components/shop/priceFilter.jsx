import { useState } from "react";
function PriceFilter() {
  const [range, setRange] = useState([0, 1000]);

  return (
    <li className="sidebar-price-item">
      <span className="sidebar-price-label">Price</span>
      <div className="sidebar-price-inputs">
        <label className="visually-hidden" htmlFor="price-min">
          Min price
        </label>
        <input
          id="price-min"
          type="number"
          min={0}
          max={range[1]}
          value={range[0]}
          onChange={(e) => setRange([Number(e.target.value), range[1]])}
          className="sidebar-price-input"
          aria-label="Minimum price"
        />
        <span className="sidebar-price-sep">–</span>
        <label className="visually-hidden" htmlFor="price-max">
          Max price
        </label>
        <input
          id="price-max"
          type="number"
          min={range[0]}
          max={9999}
          value={range[1]}
          onChange={(e) => setRange([range[0], Number(e.target.value)])}
          className="sidebar-price-input"
          aria-label="Maximum price"
        />
      </div>
    </li>
  );
}

export default PriceFilter;
