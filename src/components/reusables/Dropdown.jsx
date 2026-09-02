import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";

function Dropdown({
  buttonLabel,
  buttonIcon = "lni lni-user",
  accountItems = [],
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`topbar-dropdown ${className}`} ref={ref}>
      {/* <div className="topbar-dropdown" ref={ref}> */}
      <button
        className="topbar-dropdown-toggle"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <i className={buttonIcon}></i> {buttonLabel}
        <i
          className={`lni lni-chevron-down topbar-caret${open ? " open" : ""}`}
        ></i>
      </button>

      {open && (
        <ul className="topbar-dropdown-menu" role="menu">
          {accountItems.map((item) => (
            <li role="none" key={item.label}>
              <Link 
                to={item.to}
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  if (item.onClick) item.onClick();
                }}
              >
                <i className={item.icon}></i> {item.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
export default Dropdown;
