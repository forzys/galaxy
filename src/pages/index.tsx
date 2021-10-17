import styles from './index.less';
import PageNotFound from './404';

export default function IndexPage() {
  return (
    <div>
      <h1 className={styles.title}>Pages index</h1>

      <PageNotFound />
    </div>
  );
}
