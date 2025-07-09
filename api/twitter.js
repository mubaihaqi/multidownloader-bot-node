interface TwitterMedia {
  quality: string; // e.g., "720p", "360p"
  url: string;
  extension: string; // e.g., "mp4"
}

interface TwitterApiResponse {
  status: boolean;
  message?: string;
  media?: TwitterMedia[];
}

export async function getTwitterData(
  url: string
): Promise<{ success: boolean; error?: string; media?: TwitterMedia[] }> {
  const apiUrl = `https://api.ryzumi.vip/api/downloader/twitter?url=${encodeURIComponent(
    url
  )}`;

  try {
    const res = await fetch(apiUrl, { method: "GET" });
    const data = (await res.json()) as TwitterApiResponse;

    if (!res.ok) {
      return {
        success: false,
        error: `Permintaan Twitter API gagal: ${res.status} ${res.statusText}`,
      };
    }

    if (data.status && data.media && data.media.length > 0) {
      return { success: true, media: data.media };
    } else {
      return {
        success: false,
        error:
          data.message ||
          "Media Twitter tidak ditemukan atau format tidak didukung.",
      };
    }
  } catch (err: any) {
    console.error("Kesalahan saat fetching dari Twitter API:", err);
    return {
      success: false,
      error:
        "Gagal mengambil data dari Twitter. Periksa koneksi atau URL Anda.",
    };
  }
}
