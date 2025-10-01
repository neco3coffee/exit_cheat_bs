import styles from "./index.module.scss";

interface SearchingProps {
  loading: boolean;
  compact?: boolean;
}

const Searching = ({ loading, compact = false }: SearchingProps) => {
  if (compact) {
    return <span className={loading ? styles.search : ""}>🔍</span>;
  }

  return (
    <div className={loading ? styles.visible : styles.container}>
      <span className={loading ? styles.search : ""}>🔍</span>
    </div>
  );
};

export default Searching;
