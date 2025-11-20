import { cacheLife } from "next/cache";
import { getTranslations } from "next-intl/server";

export default async function PrivacyPolicyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  "use cache";
  cacheLife("max");

  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "privacyPolicy" });

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--black)", padding: "23px" }}
    >
      <div className="max-w-4xl mx-auto shadow-sm rounded-lg p-8 md:p-12">
        <h1
          className="text-3xl font-bold mb-4"
          style={{ color: "var(--white)" }}
        >
          {t("title")}
        </h1>

        <div
          className="text-sm mb-8 space-y-1"
          style={{ color: "var(--white)" }}
        >
          <p>{t("effectiveDate")}</p>
          <p>{t("lastUpdated")}</p>
        </div>

        <div className="prose prose-gray max-w-none">
          <p className="mb-8" style={{ color: "var(--white)" }}>
            {t("intro")}
          </p>

          {/* Article 1 */}
          <section className="mb-8">
            <h2
              className="text-xl font-semibold mb-4"
              style={{ color: "var(--white)" }}
            >
              {t("article1.title")}
            </h2>
            <div className="space-y-3" style={{ color: "var(--white)" }}>
              <p>{t("article1.section1")}</p>
              <div className="pl-6 space-y-2">
                <p>{t("article1.section1a")}</p>
              </div>
              <p>{t("article1.section2")}</p>
              <div className="pl-6 space-y-2">
                <p>{t("article1.section2a")}</p>
                <p>{t("article1.section2b")}</p>
                <div className="pl-6 space-y-2">
                  <p>{t("article1.section2b1")}</p>
                  <p>{t("article1.section2b2")}</p>
                  <p>{t("article1.section2b3")}</p>
                  <p>{t("article1.section2b4")}</p>
                  <p>{t("article1.section2b5")}</p>
                  <p>{t("article1.section2b6")}</p>
                </div>
                <p>{t("article1.section2c")}</p>
              </div>
            </div>
          </section>

          {/* Article 2 */}
          <section className="mb-8">
            <h2
              className="text-xl font-semibold mb-4"
              style={{ color: "var(--white)" }}
            >
              {t("article2.title")}
            </h2>
            <div className="space-y-3" style={{ color: "var(--white)" }}>
              <p>{t("article2.intro")}</p>
              <p>{t("article2.item1")}</p>
              <p>{t("article2.item2")}</p>
              <p>{t("article2.item3")}</p>
              <p>{t("article2.item4")}</p>
              <p>{t("article2.item5")}</p>
              <p>{t("article2.item6")}</p>
              <p>{t("article2.item7")}</p>
              <p>{t("article2.item8")}</p>
            </div>
          </section>

          {/* Article 3 */}
          <section className="mb-8">
            <h2
              className="text-xl font-semibold mb-4"
              style={{ color: "var(--white)" }}
            >
              {t("article3.title")}
            </h2>
            <div className="space-y-3" style={{ color: "var(--white)" }}>
              <p>{t("article3.intro")}</p>
              <p>{t("article3.item1")}</p>
              <p>{t("article3.item2")}</p>
              <p>{t("article3.item3")}</p>
              <p>{t("article3.item4")}</p>
            </div>
          </section>

          {/* Article 4 */}
          <section className="mb-8">
            <h2
              className="text-xl font-semibold mb-4"
              style={{ color: "var(--white)" }}
            >
              {t("article4.title")}
            </h2>
            <div className="space-y-3" style={{ color: "var(--white)" }}>
              <p>{t("article4.section1")}</p>
              <p>{t("article4.section2")}</p>
              <p>{t("article4.section3")}</p>
              <p style={{ color: "var(--white)" }}>
                {t("article4.section4Prefix")}{" "}
                <a
                  href={
                    locale === "ja"
                      ? "https://marketingplatform.google.com/about/analytics/terms/jp/"
                      : "https://marketingplatform.google.com/about/analytics/terms/us/"
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-gray-300"
                  style={{ color: "var(--on-blue)" }}
                >
                  {t("article4.section4Link1")}
                </a>
                {t("article4.section4Middle")}{" "}
                <a
                  href={
                    locale === "ja"
                      ? "https://policies.google.com/privacy?hl=ja"
                      : "https://policies.google.com/privacy"
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-gray-300"
                  style={{ color: "var(--on-blue)" }}
                >
                  {t("article4.section4Link2")}
                </a>
                {t("article4.section4Suffix")}
              </p>
            </div>
          </section>

          {/* Article 5 */}
          <section className="mb-8">
            <h2
              className="text-xl font-semibold mb-4"
              style={{ color: "var(--white)" }}
            >
              {t("article5.title")}
            </h2>
            <div className="space-y-3" style={{ color: "var(--white)" }}>
              <p>{t("article5.section1")}</p>
              <p>{t("article5.section2")}</p>
              <p style={{ color: "var(--white)" }}>
                {t("article5.section3Prefix")}{" "}
                <a
                  href="https://www.google.com/settings/ads"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-gray-300"
                  style={{ color: "var(--on-blue)" }}
                >
                  {t("article5.section3Link1")}
                </a>
                {t("article5.section3Middle")}{" "}
                <a
                  href="https://www.aboutads.info"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-gray-300"
                  style={{ color: "var(--on-blue)" }}
                >
                  {t("article5.section3Link2")}
                </a>
                {t("article5.section3Suffix")}
              </p>
              <p>{t("article5.section4")}</p>
              <p style={{ color: "var(--white)" }}>
                {t("article5.section5Prefix")}{" "}
                <a
                  href="https://www.ezoic.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-gray-300"
                  style={{ color: "var(--on-blue)" }}
                >
                  {t("article5.section5Link1")}
                </a>
                {t("article5.section5Middle")}{" "}
                <a
                  href="https://www.ezoic.com/privacy-policy/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-gray-300"
                  style={{ color: "var(--on-blue)" }}
                >
                  {t("article5.section5Link2")}
                </a>
                {t("article5.section5Suffix")}
              </p>
            </div>
          </section>

          {/* Article 6 */}
          <section className="mb-8">
            <h2
              className="text-xl font-semibold mb-4"
              style={{ color: "var(--white)" }}
            >
              {t("article6.title")}
            </h2>
            <p style={{ color: "var(--white)" }}>{t("article6.content")}</p>
          </section>

          {/* Article 7 */}
          <section className="mb-8">
            <h2
              className="text-xl font-semibold mb-4"
              style={{ color: "var(--white)" }}
            >
              {t("article7.title")}
            </h2>
            <p style={{ color: "var(--white)" }}>{t("article7.content")}</p>
          </section>

          {/* Article 8 */}
          <section className="mb-8">
            <h2
              className="text-xl font-semibold mb-4"
              style={{ color: "var(--white)" }}
            >
              {t("article8.title")}
            </h2>
            <div className="space-y-3" style={{ color: "var(--white)" }}>
              <p>{t("article8.section1")}</p>
              <p>{t("article8.section2")}</p>
              <p>{t("article8.section3")}</p>
            </div>
          </section>

          {/* Article 9 */}
          <section className="mb-8">
            <h2
              className="text-xl font-semibold mb-4"
              style={{ color: "var(--white)" }}
            >
              {t("article9.title")}
            </h2>
            <p style={{ color: "var(--white)" }}>{t("article9.content")}</p>
          </section>

          {/* Article 10 */}
          <section className="mb-8">
            <h2
              className="text-xl font-semibold mb-4"
              style={{ color: "var(--white)" }}
            >
              {t("article10.title")}
            </h2>
            <div className="space-y-3" style={{ color: "var(--white)" }}>
              <p>{t("article10.section1")}</p>
              <p>{t("article10.section2")}</p>
              <p>{t("article10.section3")}</p>
              <p>{t("article10.section4")}</p>
            </div>
          </section>

          {/* Article 11 */}
          <section className="mb-8">
            <h2
              className="text-xl font-semibold mb-4"
              style={{ color: "var(--white)" }}
            >
              {t("article11.title")}
            </h2>
            <div className="space-y-3" style={{ color: "var(--white)" }}>
              <p>{t("article11.section1")}</p>
              <p>{t("article11.section2")}</p>
              <p>{t("article11.section3")}</p>
            </div>
          </section>

          {/* Article 12 */}
          <section className="mb-8">
            <h2
              className="text-xl font-semibold mb-4"
              style={{ color: "var(--white)" }}
            >
              {t("article12.title")}
            </h2>
            <div className="space-y-3" style={{ color: "var(--white)" }}>
              <p>{t("article12.section1")}</p>
              <p>{t("article12.section2")}</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
