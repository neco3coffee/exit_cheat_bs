import Image from "next/image";
import styles from "./index.module.scss";

type RecordProps = {
  label: string;
  imagePath: string;
  value: number;
};

const Record = ({ label, imagePath, value }: RecordProps) => {
  return (
    <div className={styles.container}>
      <h5>{label}</h5>
      <div className={styles.recordContainer}>
        <Image
          src={imagePath}
          alt={label}
          width={28}
          height={28}
          sizes="28px"
        />
        <p>{value}</p>
      </div>
    </div>
  );
};

export default Record;
