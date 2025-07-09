export async function getTikTokData(url) {
  const apiUrl = `https://api.ryzumi.vip/api/downloader/ttdl?url=${encodeURIComponent(
    url
  )}`;

  try {
    const res = await fetch(apiUrl, { method: "GET" });
    const data = await res.json();

    if (!res.ok) {
      return {
        success: false,
        error: `Permintaan TikTok API gagal: ${res.status} ${res.statusText}`,
      };
    }

    if (data.success && data.data?.data) {
      const videoData = data.data.data;
      return {
        success: true,
        title: videoData.title,
        cover: videoData.cover,
        videoNoWatermark: videoData.hdplay || videoData.play,
        videoWatermark: videoData.wmplay,
        hdVideo: videoData.hdplay,
        audio: videoData.music,
        author: videoData.author?.nickname,
        authorAvatar: videoData.author?.avatar,
      };
    } else {
      return {
        success: false,
        error:
          data.message ||
          data.error ||
          (data.data && data.data.msg !== "success"
            ? data.data.msg
            : "Video TikTok tidak ditemukan atau format tidak didukung."),
      };
    }
  } catch (err) {
    console.error("Kesalahan saat fetching dari TikTok API:", err);
    return {
      success: false,
      error: "Gagal mengambil data dari TikTok. Periksa koneksi atau URL Anda.",
    };
  }
}
