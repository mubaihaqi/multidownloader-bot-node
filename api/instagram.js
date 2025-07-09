export async function getInstagramData(url) {
  const apiUrl = "https://instagram-downloader-api-nine.vercel.app/download";

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url }),
    });

    const data = await response.json();

    if (response.ok) {
      if (data && data.download_url) {
        return {
          success: true,
          downloadUrl: data.download_url,
          thumbnailUrl: data.thumbnail_url,
          caption: data.caption,
        };
      } else {
        return {
          success: false,
          error:
            data.message ||
            "Media Instagram tidak ditemukan atau format tidak didukung.",
        };
      }
    } else {
      return {
        success: false,
        error:
          data.message ||
          `Gagal memproses permintaan Instagram: ${response.status} ${response.statusText}.`,
      };
    }
  } catch (err) {
    console.error("Kesalahan saat fetching dari Instagram API:", err);
    return {
      success: false,
      error:
        "Gagal mengambil data dari Instagram. Periksa koneksi atau URL Anda.",
    };
  }
}
