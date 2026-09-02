import { Link, useNavigate } from "react-router-dom";
import Dropdown from "../../reusables/Dropdown";
import { useAuth } from "../../../context/AuthContext";

export default function Topbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const accountItems = user
    ? [
        { label: "My Account", icon: "lni lni-user", to: "/account" },
        { label: "Orders", icon: "lni lni-cart", to: "/orders" },
        { label: "Wishlist", icon: "lni lni-heart", to: "/wishlist" },
        { label: "Settings", icon: "lni lni-cog", to: "/settings" },
        {
          label: "Logout",
          icon: "lni lni-exit",
          onClick: handleLogout,
        },
      ]
    : [
        { label: "My Account", icon: "lni lni-user", to: "/account" },
        { label: "Orders", icon: "lni lni-cart", to: "/orders" },
        { label: "Wishlist", icon: "lni lni-heart", to: "/wishlist" },
      ];

  const helpItems = [
    { label: "Help Center", icon: "lni lni-question-circle", to: "/help" },
    { label: "Contact Us", icon: "lni lni-envelope", to: "/contact" },
    { label: "FAQ", icon: "lni lni-help", to: "/faq" },
  ];

  const displayName = user
    ? (user.full_name?.split(" ")[0] ?? user.name ?? "Account")
    : null;

  return (
    <div className="topbar">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-lg-12 col-12">
            <div className="top-end d-flex align-items-center justify-content-end">
              <Dropdown
                buttonLabel={displayName ?? "Account"}
                buttonIcon="lni lni-user"
                accountItems={accountItems}
                className="account-dropdown"
              />

              <Dropdown
                buttonLabel="Help"
                buttonIcon="lni lni-phone"
                accountItems={helpItems}
                className="account-dropdown"
              />

              {!user && (
                <ul className="user-login m-0 p-0 d-flex list-unstyled">
                  <li>
                    <Link to="/login">Sign In</Link>
                  </li>
                  <li>
                    <Link to="/register">Register</Link>
                  </li>
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}