import { useNavigate } from "react-router-dom";
import categories from "../../data/categories";
import { useCart } from "../../context/CartContext";

export default function HorizontalCategoryNav() {
  const navigate = useNavigate();
  const { setIsHeaderDropdownOpen } = useCart();

  const handleCategoryClick = (categoryTitle) => {
    setIsHeaderDropdownOpen(false);
    navigate(`/products?category=${encodeURIComponent(categoryTitle)}`);
  };

  const handleItemClick = (itemName) => {
    setIsHeaderDropdownOpen(false);
    navigate(`/products?category=${encodeURIComponent(itemName)}`);
  };

  const handleInteraction = (e) => {
    // Prevent accidental closure when moving mouse quickly near the header
    setIsHeaderDropdownOpen(false);
  };

  const categoryIcons = {
    Chargers: "lni-bolt",
    "Power Banks": "lni-plug",
    "USB Cables": "lni-network",
    Sound: "lni-headphone",
    Batteries: "lni-battery",
    Watches: "lni-timer",
    Brands: "lni-star",
  };

  return (
    <div className="category-strip" onMouseEnter={handleInteraction} onClick={handleInteraction} style={{ zIndex: 10 }}>
      <div className="container-wide">
        <div className="category-row">
          {categories.map((cat) => (
            <div key={cat.title} className="category-item">
              <button
                className="category-link"
                onClick={() => handleCategoryClick(cat.title)}
              >
                <i className={`lni ${categoryIcons[cat.title] || "lni-package"}`}></i>
                <span>{cat.title}</span>
              </button>

              {cat.items.length > 0 && (
                <div className="category-dropdown" style={{ zIndex: 10 }}>
                  <div className="dropdown-inner">
                    {cat.items.map((item) => (
                      <button
                        key={item.name}
                        className="dropdown-item"
                        onClick={() => handleItemClick(item.name)}
                      >
                        {item.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}