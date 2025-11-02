import Link from "next/link";
import styles from "./landing.module.scss";

export default function LandingPage() {
  return (
    <div className={styles.landingPage}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            🎯 プロランクを目指すなら、運ゲーは終わりにしよう。
          </h1>
          <p className={styles.heroSubtitle}>
            SafeBrawl は、利敵・献上プレイヤーを見抜き、
            <br />
            公平なマッチで実力勝負をしたい人のための分析ツールです。
          </p>
          <div className={styles.heroCta}>
            <Link href="/ja" className={styles.ctaButton}>
              無料で始める
            </Link>
            <Link
              href="/ja/players/search"
              className={styles.ctaButtonSecondary}
            >
              プレイヤーを検索
            </Link>
          </div>
        </div>
        <div className={styles.heroBackground}>
          {/* Placeholder for background image/video */}
          <div className={styles.placeholder}>
            [Brawl Stars風UI＋戦場の一瞬を切り取ったイラスト or ショート動画]
          </div>
        </div>
      </section>

      {/* Pain Section */}
      <section className={styles.pain}>
        <h2 className={styles.sectionTitle}>こんな経験、ありませんか？</h2>
        <ul className={styles.problemList}>
          <li>• 味方が動かない</li>
          <li>• わざと敵に突っ込んでやられる</li>
          <li>• くるくる回って戦わない</li>
          <li>• 明らかに勝つ気がない</li>
        </ul>
        <p className={styles.painClosing}>
          そんな味方とマッチするたびに、
          <br />
          「もうランク上げは無理かも…」って思ったこと、ありませんか？
        </p>
      </section>

      {/* Solution Section */}
      <section className={styles.solution}>
        <h2 className={styles.sectionTitle}>
          SafeBrawlが、あなたの努力を守ります。
        </h2>
        <div className={styles.featureGrid}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🎥</div>
            <h3 className={styles.featureTitle}>動画付き報告システム</h3>
            <p className={styles.featureDescription}>
              利敵・献上プレイヤーをリプレイ動画付きで報告
            </p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🧑‍⚖️</div>
            <h3 className={styles.featureTitle}>モデレーターによる承認制</h3>
            <p className={styles.featureDescription}>
              不正確な報告を排除し、公平に審査
            </p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🔍</div>
            <h3 className={styles.featureTitle}>ピック中プレイヤー検索機能</h3>
            <p className={styles.featureDescription}>
              味方候補の名前とランク（±3）を即検索
            </p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🚫</div>
            <h3 className={styles.featureTitle}>
              利敵・献上プレイヤー回避機能
            </h3>
            <p className={styles.featureDescription}>
              マッチ前に危険プレイヤーを検知して離脱！
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className={styles.howItWorks}>
        <h2 className={styles.sectionTitle}>SafeBrawlの使い方はシンプル</h2>
        <div className={styles.stepsList}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1️⃣</div>
            <p className={styles.stepText}>SafeBrawlにアクセス！</p>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>2️⃣</div>
            <p className={styles.stepText}>
              ログイン！（Brawl Starsアカウント連携）
            </p>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>3️⃣</div>
            <p className={styles.stepText}>バトル履歴から報告！</p>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>4️⃣</div>
            <p className={styles.stepText}>ピック中に味方の名前を検索！</p>
          </div>
        </div>
        <div className={styles.heroCta}>
          <Link href="/ja" className={styles.ctaButton}>
            今すぐ始める
          </Link>
          <Link href="/ja" className={styles.ctaButtonSecondary}>
            使い方動画を見る
          </Link>
        </div>
      </section>

      {/* Demo Section */}
      <section className={styles.demo}>
        <h2 className={styles.sectionTitle}>実際の流れを動画で紹介</h2>
        <div className={styles.demoVideo}>
          {/* Placeholder for demo video */}
          <div className={styles.placeholder}>
            [30秒〜1分のデモ動画（例：「報告→承認→検索」の流れ）]
          </div>
        </div>
        <p className={styles.demoDescription}>
          🎬 「SafeBrawlを使えば、たった数タップで公平なマッチができる！」
        </p>
      </section>

      {/* Community Section */}
      <section className={styles.community}>
        <h2 className={styles.sectionTitle}>コミュニティ</h2>
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>承認済み報告</p>
            <p className={styles.statValue}>○件</p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>総ユーザー数</p>
            <p className={styles.statValue}>○○人</p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>Xでの反響</p>
            <p className={styles.statValue}>好評！</p>
          </div>
        </div>
        <div className={styles.socialLinks}>
          <a
            href="https://x.com/neco3desu"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.socialButton}
          >
            X (Twitter)
          </a>
          <button
            type="button"
            className={styles.socialButton}
            disabled
            aria-label="Discord (Coming Soon)"
            title="Coming Soon"
          >
            Discord (Coming Soon)
          </button>
          <a
            href="https://github.com/neco3coffee/exit_cheat_bs"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.socialButton}
          >
            GitHub
          </a>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <h2 className={styles.ctaTitle}>
          さぁ、SafeBrawlと共に
          <br />
          不正のない真のランクマッチへ。
        </h2>
        <div className={styles.heroCta}>
          <Link href="/ja" className={styles.ctaButton}>
            SafeBrawlを使ってみる
          </Link>
          <Link href="/ja/players/search" className={styles.ctaButtonSecondary}>
            プレイヤーを検索
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerLinks}>
          <Link href="/ja/terms-of-service" className={styles.footerLink}>
            利用規約
          </Link>
          <Link href="/ja/privacy-policy" className={styles.footerLink}>
            プライバシーポリシー
          </Link>
          <Link href="/ja" className={styles.footerLink}>
            Q&A
          </Link>
        </div>
        <p className={styles.copyright}>
          © SafeBrawl 2025 — Powered by Brawlify API, AWS, etc.
        </p>
      </footer>
    </div>
  );
}
