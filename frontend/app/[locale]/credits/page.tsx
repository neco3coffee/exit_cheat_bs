import { cacheLife } from "next/cache";
import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

export default async function CreditsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  "use cache";
  cacheLife("max");

  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "credits" });

  const services = [
    {
      name: "Next.js",
      url: "https://nextjs.org/",
      logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg",
    },
    {
      name: "React",
      url: "https://react.dev/",
      logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg",
    },
    {
      name: "TypeScript",
      url: "https://www.typescriptlang.org/",
      logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg",
    },
    {
      name: "Tailwind CSS",
      url: "https://tailwindcss.com/",
      logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg",
    },
    {
      name: "Ruby on Rails",
      url: "https://rubyonrails.org/",
      logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/rails/rails-plain.svg",
    },
    {
      name: "PostgreSQL",
      url: "https://www.postgresql.org/",
      logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg",
    },
    {
      name: "AWS",
      url: "https://aws.amazon.com/",
      logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-original-wordmark.svg",
    },
    {
      name: "Docker",
      url: "https://www.docker.com/",
      logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg",
    },
    {
      name: "GitHub",
      url: "https://github.com/",
      logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg",
    },
  ];

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--black)", padding: "23px" }}
    >
      <div className="max-w-4xl mx-auto shadow-sm rounded-lg p-8 md:p-12">
        <h1
          className="text-3xl font-bold mb-8"
          style={{ color: "var(--white)" }}
        >
          {t("title")}
        </h1>

        <p className="mb-8" style={{ color: "var(--white)" }}>
          {t("intro")}
        </p>

        {/* Service Logos Grid - 3x3 */}
        <div className="grid grid-cols-3 gap-6 mb-12">
          {services.map((service) => (
            <Link
              key={service.name}
              href={service.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center p-4 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <div className="w-20 h-20 mb-3 flex items-center justify-center relative">
                <Image
                  src={service.logo}
                  alt={service.name}
                  width={80}
                  height={80}
                  className="max-w-full max-h-full object-contain"
                  style={{
                    filter: "brightness(0) invert(1)",
                  }}
                  unoptimized
                />
              </div>
              <span
                className="text-sm font-medium text-center"
                style={{ color: "var(--on-blue)" }}
              >
                {service.name}
              </span>
            </Link>
          ))}
        </div>

        {/* Technology List */}
        <div className="space-y-4" style={{ color: "var(--white)" }}>
          <div className="space-y-2">
            <p>• {t("services.frontend")}</p>
            <p>• {t("services.backend")}</p>
            <p>• {t("services.infrastructure")}</p>
            <p>• {t("services.tools")}</p>
            <p>
              •{" "}
              <a
                href="https://developer.brawlstars.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-gray-300"
                style={{ color: "var(--on-blue)" }}
              >
                {locale === "ja" ? "公式 " : "Official "}
                <strong>Brawl Stars API</strong>
              </a>
              {locale === "ja" ? " および " : " and "}
              <a
                href="https://brawlify.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-gray-300"
                style={{ color: "var(--on-blue)" }}
              >
                <strong>Brawlify CDN</strong>
              </a>
            </p>
            <p>• {t("services.community")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
