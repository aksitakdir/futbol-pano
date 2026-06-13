const BASE = "https://www.scoutgamer.com";

const CATEGORY_LABEL: Record<string, string> = {
  lists: "Lists",
  radar: "Radar",
  "tactics-lab": "Tactics Lab",
  "wc-2026": "World Cup 2026",
  transfer: "Transfers",
};

const CATEGORY_PATH: Record<string, string> = {
  lists: "/lists",
  radar: "/radar",
  "tactics-lab": "/tactics-lab",
  "wc-2026": "/world-cup-2026",
  transfer: "/transfers",
};

function plainText(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/[#*_\n]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function articleJsonLd(article: {
  title_en?: string;
  title: string;
  content_en?: string;
  content: string;
  cover_image?: string;
  created_at: string;
  slug: string;
  category?: string;
}, urlPath: string) {
  const title = article.title_en || article.title;
  const body = article.content_en || article.content;
  const description = plainText(body).slice(0, 200);
  const image = article.cover_image || `${BASE}/og-image.png`;
  const category = article.category ?? "";
  const catLabel = CATEGORY_LABEL[category] ?? category;
  const catPath = CATEGORY_PATH[category] ?? "/";

  const articleSchema = {
    "@type": "Article",
    "headline": title,
    "description": description,
    "image": image,
    "datePublished": article.created_at,
    "url": `${BASE}${urlPath}`,
    "inLanguage": "en",
    "author": { "@type": "Organization", "name": "Scout Gamer", "url": BASE },
    "publisher": {
      "@type": "Organization",
      "name": "Scout Gamer",
      "url": BASE,
      "logo": { "@type": "ImageObject", "url": `${BASE}/icon.png` },
    },
    "mainEntityOfPage": { "@type": "WebPage", "@id": `${BASE}${urlPath}` },
  };

  const breadcrumbSchema = {
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE },
      { "@type": "ListItem", "position": 2, "name": catLabel, "item": `${BASE}${catPath}` },
      { "@type": "ListItem", "position": 3, "name": title },
    ],
  };

  return {
    "@context": "https://schema.org",
    "@graph": [articleSchema, breadcrumbSchema],
  };
}
