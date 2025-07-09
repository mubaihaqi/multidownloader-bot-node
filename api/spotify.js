interface SpotifyMetadata {
  title: string;
  artist: string;
  album: string;
  thumbnail: string;
}

interface SpotifyApiResponse {
  success: boolean;
  message?: string;
  link?: string; // URL unduhan audio
  metadata?: SpotifyMetadata;
}

export async function getSpotifyData(url: string): Promise<{
  success: boolean;
  error?: string;
  downloadUrl?: string;
  metadata?: SpotifyMetadata;
}> {
  const apiUrl = `https://api.ryzumi.vip/api/downloader/spotify?url=${encodeURIComponent(
    url
  )}`;

  try {
    const res = await fetch(apiUrl, { method: "GET" });
    const data = (await res.json()) as SpotifyApiResponse;

    if (!res.ok) {
      return {
        success: false,
        error: `Permintaan Spotify API gagal: ${res.status} ${res.statusText}`,
      };
    }

    if (data.success && data.link && data.metadata) {
      return { success: true, downloadUrl: data.link, metadata: data.metadata };
    } else {
      return {
        success: false,
        error:
          data.message ||
          "Lagu Spotify tidak ditemukan atau format tidak didukung.",
      };
    }
  } catch (err: any) {
    console.error("Kesalahan saat fetching dari Spotify API:", err);
    return {
      success: false,
      error:
        "Gagal mengambil data dari Spotify. Periksa koneksi atau URL Anda.",
    };
  }
}
