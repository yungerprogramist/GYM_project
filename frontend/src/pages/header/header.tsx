import './header.scss';
import LogoImage from '../../assets/logo.svg';

const Header = () => {
  return (
    <header className="header">
      <img src={LogoImage} />
    </header>
  );
};

export default Header;
