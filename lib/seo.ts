import type { Metadata } from "next";

/* Per-page metadata with Open Graph/Twitter tags. A page-level `openGraph`
   replaces the layout's entirely (no deep merge), so the shared image and
   site fields must be repeated here. */
export function pageMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  return {
    title,
    description,
    openGraph: {
      type: "website",
      locale: "en_US",
      siteName: "Gold Law, P.A.",
      title: `${title} – Gold Law`,
      description,
      url: path,
      images: [
        {
          url: "/images/og-image.jpg",
          width: 1200,
          height: 630,
          alt: "Gold Law – Consumer Attorneys",
        },
      ],
    },
  };
}
