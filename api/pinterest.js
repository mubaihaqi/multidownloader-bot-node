export async function getPinterestData(url) {
  const apiUrl = `https://api.ryzumi.vip/api/downloader/pinterest?url=${encodeURIComponent(
    url
  )}`;

  try {
    const res = await fetch(apiUrl, { method: "GET" });
    const data = await res.json();

    if (!res.ok) {
      return {
        success: false,
        error: `Permintaan Pinterest API gagal: ${res.status} ${res.statusText}`,
      };
    }

    if (data.success && data.media && data.media.length > 0) {
      let previewImage = undefined;
      const imageExtensions = ["jpg", "jpeg", "png", "gif"];

      const originalImage = data.media.find(
        (m) =>
          m.quality === "original" &&
          imageExtensions.includes(m.extension.toLowerCase())
      );
      if (originalImage) {
        previewImage = originalImage.url;
      } else {
        const firstImage = data.media.find((m) =>
          imageExtensions.includes(m.extension.toLowerCase())
        );
        if (firstImage) {
          previewImage = firstImage.url;
        }
      }

      return { success: true, media: data.media, previewImage };
    } else {
      return {
        success: false,
        error:
          data.message ||
          "Media Pinterest tidak ditemukan atau format tidak didukung.",
      };
    }
  } catch (err) {
    console.error("Kesalahan saat fetching dari Pinterest API:", err);
    return {
      success: false,
      error:
        "Gagal mengambil data dari Pinterest. Periksa koneksi atau URL Anda.",
    };
  }
}
