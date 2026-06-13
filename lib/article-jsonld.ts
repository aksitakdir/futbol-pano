const BASE = "https://www.scoutgamer.com";

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

  return {
    "@context": "https://schema.org",
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
}
