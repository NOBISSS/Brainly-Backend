export function extractYouTubeId(url: string): string | null {
  try {
    const parsedUrl = new URL(url);

    // 1️⃣ youtu.be/<id>
    if (parsedUrl.hostname === "youtu.be") {
      return parsedUrl.pathname.slice(1);
    }

    // 2️⃣ youtube.com/watch?v=<id>
    if (
      parsedUrl.hostname.includes("youtube.com") &&
      parsedUrl.searchParams.has("v")
    ) {
      return parsedUrl.searchParams.get("v");
    }

    // 3️⃣ youtube.com/embed/<id>
    if (parsedUrl.pathname.startsWith("/embed/")) {
      return parsedUrl.pathname.split("/")[2];
    }

    // 4️⃣ youtube.com/shorts/<id>
    if (parsedUrl.pathname.startsWith("/shorts/")) {
      return parsedUrl.pathname.split("/")[2];
    }

    return null;
  } catch {
    return null;
  }
}


export function getPlatformThumbnail(url: string) {
  if (url.includes("youtube.com") || url.includes("youtu.be")) {
    const videoId = extractYouTubeId(url);
    return videoId
      ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
      : null;
  }

  if (url.includes("canva.com")) {
    return "https://static.canva.com/web/images/favicon.ico";
  }

  if (url.includes("docs.google.com")) {
    return "https://ssl.gstatic.com/docs/doclist/images/infinite_arrow_favicon_5.ico";
  }

  if (url.includes("twitter.com") || url.includes("x.com")) {
    return "https://abs.twimg.com/icons/apple-touch-icon-192x192.png";
  }

  return null;
}
