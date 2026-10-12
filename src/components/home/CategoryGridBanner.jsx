/**
 * CategoryGridBanner — "Main Items"
 *
 * Horizontally scrollable image cards, one per category.
 * Each card: full-bleed product image + label below.
 */
import { useNavigate } from "react-router-dom";

const ITEMS = [
  {
    id: 1,
    label: "Earphones",
    image: "/assets/images/mainItems/earphones.webp",
    query: "earphones",
  },
  {
    id: 2,
    label: "Chargers",
    image: "/assets/images/mainItems/5877f4e4b764c81c1fa2dfa730afed2f.webp",
    query: "charger",
  },
  {
    id: 3,
    label: "Power Banks",
    image: "/assets/images/mainItems/powebank.webp",
    query: "power+bank",
  },
  {
    id: 4,
    label: "Speakers",
    image: "/assets/images/mainItems/speaker copy.webp",
    query: "speaker",
  },
  {
    id: 5,
    label: "Earbuds",
    image: "/assets/images/mainItems/freebuds copy.webp",
    query: "earbuds",
  },
  {
    id: 6,
    label: "Headsets",
    image:
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=300&fit=crop",
    query: "headset",
  },
  {
    id: 7,
    label: "Cables",
    image: "/assets/images/mainItems/image.png",
    query: "cable",
  },
  {
    id: 8,
    label: "Smart Watch",
    image:
      "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=400&h=300&fit=crop",
    query: "watch",
  },
  {
    id: 9,
    label: "Flash Disks",
    image:
      "https://images.unsplash.com/photo-1709660850064-0ec82e1a6b5d?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?w=400&h=300&fit=crop",
    query: "flash+disk",
  },
  {
    id: 10,
    label: "Car Audio",
    image: "/assets/images/mainItems/carcharger.webp",
    query: "car+mp3",
  },
];

export default function CategoryGridBanner() {
  const navigate = useNavigate();

  return (
    <section style={{ padding: "16px 0 20px" }}>
      <style>{`
        .cgb-strip {
          scrollbar-width: none;
          -ms-overflow-style: none;
  padding: 8px 2px 4px;
        }
        .cgb-strip::-webkit-scrollbar { display: none; }

        /* wrapper holds card + label stacked vertically */
        .cgb-item {
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          width: 200px;
        }

        .cgb-card {
          width: 100%;
          height: 150px;
          border-radius: 12px;
          overflow: hidden;
          position: relative;
          cursor: pointer;
          border: 1px solid #e18f27;
          padding: 0;
          margin:5px 0px;
          background: #f7f8fa;
          display: block;
          transition: transform 0.18s cubic-bezier(0.23, 1, 0.32, 1),
                      box-shadow 0.18s ease,
                      border-color 0.18s ease;
        }
        .cgb-card:hover {
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
          border-color: #e18f27;
        }
        .cgb-card:active { transform: scale(0.97); }

        .cgb-card img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          display: block;
          transition: transform 0.28s ease;
        }
        .cgb-card:hover img {
          transform: scale(1.06);
        }

        /* label sits below the card, outside the button */
        .cgb-label {
          display: block;
          width: 100%;
          text-align: center;
          font-size: 12px;
          font-weight: 700;
          color: #183a9b;
          letter-spacing: 0.02em;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          pointer-events: none;
          line-height: 1.2;
        }

        /* mobile: slightly smaller cards */
        @media (max-width: 480px) {
          .cgb-item { width: 120px; gap: 6px; }
          .cgb-card { height: 88px; }
          .cgb-label { font-size: 11px; }
        }
      `}</style>

      <div className="container">
        {/* header row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <h3
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: "#0f172a",
              margin: 0,
            }}
          >
            Products you have been looking for.
          </h3>
          <button
            onClick={() => navigate("/products")}
            style={{
              background: "none",
              border: "none",
              fontSize: 13,
              fontWeight: 600,
              color: "#183B9B",
              cursor: "pointer",
              padding: "2px 0",
              transition: "opacity 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = "0.65";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "1";
            }}
          >
            View all
          </button>
        </div>

        {/* scrollable image card strip */}
        <div
          className="cgb-strip"
          style={{
            display: "flex",
            gap: 14,
            overflowX: "auto",
            WebkitOverflowScrolling: "touch",
            paddingBottom: 4,
            alignItems: "flex-start",
          }}
        >
          {ITEMS.map((item) => (
            <div key={item.id} className="cgb-item">
              <button
                type="button"
                className="cgb-card"
                aria-label={`Browse ${item.label}`}
                onClick={() => navigate(`/products?q=${item.query}`)}
              >
                <img
                  src={item.image}
                  alt={item.label}
                  onError={(e) => {
                    e.currentTarget.style.background = "#dde2ec";
                  }}
                />
              </button>
              <span className="cgb-label">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}