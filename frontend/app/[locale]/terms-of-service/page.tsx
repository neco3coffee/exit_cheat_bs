import { cacheLife } from "next/cache";
import { useTranslations } from "next-intl";

export default async function TermsOfServicePage() {
  "use cache";
  cacheLife("max");

  const t = useTranslations("termsOfService");

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white shadow-sm rounded-lg p-8 md:p-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{t("title")}</h1>

        <div className="text-sm text-gray-600 mb-8 space-y-1">
          <p>{t("effectiveDate")}</p>
          <p>{t("lastUpdated")}</p>
        </div>

        <div className="prose prose-gray max-w-none">
          <p className="text-gray-700 mb-8">{t("intro")}</p>

          {/* Article 1 */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {t("article1.title")}
            </h2>
            <div className="space-y-3 text-gray-700">
              <p>{t("article1.section1")}</p>
              <p>{t("article1.section2")}</p>
              <p>{t("article1.section3")}</p>
              <p>{t("article1.section4")}</p>
              <p>{t("article1.section5")}</p>
            </div>
          </section>

          {/* Article 2 */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {t("article2.title")}
            </h2>
            <div className="space-y-3 text-gray-700">
              <p>{t("article2.section1")}</p>
              <p>{t("article2.section2")}</p>
              <p>{t("article2.section3")}</p>
              <div className="pl-6 space-y-2">
                <p>{t("article2.section3a")}</p>
                <p>{t("article2.section3b")}</p>
                <p>{t("article2.section3c")}</p>
              </div>
              <p>{t("article2.section4")}</p>
              <p>{t("article2.section5")}</p>
              <p>{t("article2.section6")}</p>
              <p>{t("article2.section7")}</p>
            </div>
          </section>

          {/* Article 3 */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {t("article3.title")}
            </h2>
            <p className="text-gray-700 mb-3">{t("article3.intro")}</p>
            <div className="space-y-2 text-gray-700">
              <p>{t("article3.item1")}</p>
              <p>{t("article3.item2")}</p>
              <p>{t("article3.item3")}</p>
              <p>{t("article3.item4")}</p>
              <p>{t("article3.item5")}</p>
              <p>{t("article3.item6")}</p>
              <p>{t("article3.item7")}</p>
              <p>{t("article3.item8")}</p>
              <p>{t("article3.item9")}</p>
              <p>{t("article3.item10")}</p>
              <p>{t("article3.item11")}</p>
              <p>{t("article3.item12")}</p>
              <p>{t("article3.item13")}</p>
              <p>{t("article3.item14")}</p>
              <p>{t("article3.item15")}</p>
            </div>
          </section>

          {/* Article 4 */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {t("article4.title")}
            </h2>
            <div className="space-y-3 text-gray-700">
              <p>{t("article4.section1")}</p>
              <p>{t("article4.section2")}</p>
            </div>
          </section>

          {/* Article 5 */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {t("article5.title")}
            </h2>
            <div className="space-y-3 text-gray-700">
              <p>{t("article5.section1")}</p>
              <p>{t("article5.section2")}</p>
              <p>{t("article5.section3")}</p>
            </div>
          </section>

          {/* Article 6 */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {t("article6.title")}
            </h2>
            <div className="space-y-3 text-gray-700">
              <p>{t("article6.section1")}</p>
              <div className="pl-6 space-y-2">
                <p>{t("article6.section1a")}</p>
                <p>{t("article6.section1b")}</p>
                <p>{t("article6.section1c")}</p>
                <p>{t("article6.section1d")}</p>
              </div>
              <p>{t("article6.section2")}</p>
            </div>
          </section>

          {/* Article 7 */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {t("article7.title")}
            </h2>
            <div className="space-y-3 text-gray-700">
              <p>{t("article7.section1")}</p>
              <div className="pl-6 space-y-2">
                <p>{t("article7.section1a")}</p>
                <p>{t("article7.section1b")}</p>
                <p>{t("article7.section1c")}</p>
              </div>
              <p>{t("article7.section2")}</p>
            </div>
          </section>

          {/* Article 8 */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {t("article8.title")}
            </h2>
            <div className="space-y-3 text-gray-700">
              <p>{t("article8.section1")}</p>
              <p>{t("article8.section2")}</p>
              <p>{t("article8.section3")}</p>
              <p>{t("article8.section4")}</p>
            </div>
          </section>

          {/* Article 9 */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {t("article9.title")}
            </h2>
            <div className="space-y-3 text-gray-700">
              <p>{t("article9.section1")}</p>
              <p>{t("article9.section2")}</p>
            </div>
          </section>

          {/* Article 10 */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {t("article10.title")}
            </h2>
            <div className="space-y-3 text-gray-700">
              <p>{t("article10.section1")}</p>
              <p>{t("article10.section2")}</p>
              <p>{t("article10.section3")}</p>
            </div>
          </section>

          {/* Article 11 */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {t("article11.title")}
            </h2>
            <p className="text-gray-700">{t("article11.content")}</p>
          </section>

          {/* Article 12 */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {t("article12.title")}
            </h2>
            <p className="text-gray-700">{t("article12.content")}</p>
          </section>

          {/* Article 13 */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {t("article13.title")}
            </h2>
            <p className="text-gray-700">{t("article13.content")}</p>
          </section>

          {/* Article 14 */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {t("article14.title")}
            </h2>
            <div className="space-y-3 text-gray-700">
              <p>{t("article14.section1")}</p>
              <p>{t("article14.section2")}</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
