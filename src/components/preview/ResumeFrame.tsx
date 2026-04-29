import styles from './ResumeFrame.module.css';

interface Props {
  html: string;
  height?: number;
}

export function ResumeFrame({ html, height = 900 }: Props) {
  return (
    <div className={styles.frameWrap} style={{ height }}>
      <iframe
        title="Resume preview"
        className={styles.iframe}
        srcDoc={html}
        sandbox="allow-same-origin"
      />
    </div>
  );
}
