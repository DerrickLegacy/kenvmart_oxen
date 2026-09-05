import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

function Dropdown({
  buttonLabel,
  buttonIcon = "lni lni-user",
  accountItems = [],
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

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
      <button
        className="topbar-dropdown-toggle"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <i className={buttonIcon}></i> {buttonLabel}
        <i className={`lni lni-chevron-down topbar-caret${open ? " open" : ""}`}></i>
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            className="topbar-dropdown-menu"
            role="menu"
            initial={{ opacity: 0, transform: 'scale(0.97) translateY(-4px)' }}
            animate={{ opacity: 1, transform: 'scale(1) translateY(0px)' }}
            exit={{ opacity: 0, transform: 'scale(0.97) translateY(-4px)' }}
            transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
            style={{ transformOrigin: 'top left' }}
          >
            {accountItems.map((item) => (
              <li role="none" key={item.label}>
                <Link
                  to={item.to || '#'}
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
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Dropdown;
