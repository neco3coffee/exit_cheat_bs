import LocaleBox from "./_components/client/LocaleBox";
import styles from "./index.module.scss";

const Header = () => {
  return (
    <>
      <header className={`${styles.header}  `}>
        <div className={styles.logoContainer}></div>
        <h1>SafeBrawl</h1>
        <LocaleBox />
      </header>
    </>
  );
};

export default Header;
