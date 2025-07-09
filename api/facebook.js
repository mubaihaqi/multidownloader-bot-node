export async function getFacebookData(url) {
  const apiUrl = `https://fbdown.vercel.app/api/get?url=${encodeURIComponent(
    url
  )}`;

  try {
    const res = await fetch(apiUrl, { method: "GET" });
    const data = await res.json();

    if (res.ok) {
      if (data.hd || data.sd) {
        return { success: true, hd: data.hd, sd: data.sd };
      } else {
        return {
          success: false,
          error:
            data.error ||
            "Media Facebook tidak ditemukan atau format tidak didukung.",
        };
      }
    } else {
      return {
        success: false,
        error:
          data.error ||
          `Gagal memproses permintaan Facebook: ${res.status} ${res.statusText}.`,
      };
    }
  } catch (err) {
    console.error("Kesalahan saat fetching dari Facebook API:", err);
    return {
      success: false,
      error:
        "Gagal mengambil data dari Facebook. Periksa koneksi atau URL Anda.",
    };
  }
}
