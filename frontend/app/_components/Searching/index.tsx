import React from "react";
import styles from "./index.module.scss";

const Searching = ({ loading }: any) => {
  return (
    <div className={loading ? styles.visible : styles.container}>
      <span className={loading ? styles.search : ""}>🔍</span>
    </div>
  );
};

export default Searching;
