import { Link } from "react-router-dom";

export default function PageBreadcrumb({ crumbs = [] }) {
  if (!crumbs.length) return null;

  return (
    <div class="my-3" style={{ padding: "8px 0" }}>
      <ul
        style={{
          display: "flex",
          listStyle: "none",
          padding: 0,
          margin: 0,
          gap: "4px",
          alignItems: "center",
          flexWrap: "wrap",
          justifyContent: "flex-end", // 👈 This right-aligns the items
        }}
      >
        {crumbs.map((crumb, i) => {
          const isLast = i === crumbs.length - 1;

          return (
            <li
              key={i}
              style={{ display: "flex", alignItems: "center", gap: "4px" }}
            >
              {i > 0 && (
                <span style={{ color: "#999", margin: "0 2px" }}>/</span>
              )}

              {isLast ? (
                <span style={{ color: "#666", fontWeight: "500" }}>
                  {i === 0 && (
                    <i
                      className="lni lni-home"
                      style={{ marginRight: "4px" }}
                    ></i>
                  )}
                  {crumb.label}
                </span>
              ) : (
                <Link
                  to={crumb.to || "#"}
                  style={{
                    color: "#007bff",
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  {i === 0 && <i className="lni lni-home"></i>}
                  {crumb.label}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
