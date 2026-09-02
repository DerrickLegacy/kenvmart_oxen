import Topbar from './Topbar';
import HeaderMiddle from './HeaderMiddle';
import HeaderBottom from './HeaderBottom';

export default function Header() {
  return (
    <header data-testid="header" className="header navbar-area">
      <Topbar />
      <HeaderMiddle />
      <HeaderBottom />
    </header>
  );
}
