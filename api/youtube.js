export async function getYouTubeData(url) {
  const audioApiUrl = `https://api.ryzumi.vip/api/downloader/ytmp3?url=${encodeURIComponent(
    url
  )}`;
  const videoApiUrl = `https://api.ryzumi.vip/api/downloader/ytmp4?url=${encodeURIComponent(
    url
  )}`;

  try {
    const [audioOutcome, videoOutcome] = await Promise.allSettled([
      fetch(audioApiUrl).then(async (res) => {
        if (!res.ok)
          throw new Error(`Audio API: ${res.status} ${res.statusText}`);
        return res.json();
      }),
      fetch(videoApiUrl).then(async (res) => {
        if (!res.ok)
          throw new Error(`Video API: ${res.status} ${res.statusText}`);
        return res.json();
      }),
    ]);

    let data = {
      apiErrors: [],
    };

    if (audioOutcome.status === "fulfilled" && audioOutcome.value?.url) {
      const d = audioOutcome.value;
      data.audio = d.url;
      data.audioQuality = d.quality;
      data.title = d.title || data.title;
      data.thumbnail = d.thumbnail || data.thumbnail;
      data.author = d.author || data.author;
    } else if (audioOutcome.status === "rejected") {
      data.apiErrors.push(audioOutcome.reason.message);
    } else if (
      audioOutcome.status === "fulfilled" &&
      audioOutcome.value?.message
    ) {
      data.apiErrors.push(`Audio API: ${audioOutcome.value.message}`);
    }

    if (videoOutcome.status === "fulfilled" && videoOutcome.value?.url) {
      const d = videoOutcome.value;
      data.video = d.url;
      data.videoQuality = d.quality;
      data.title = d.title || data.title;
      data.thumbnail = d.thumbnail || data.thumbnail;
      data.author = d.author || data.author;
    } else if (videoOutcome.status === "rejected") {
      data.apiErrors.push(videoOutcome.reason.message);
    } else if (
      videoOutcome.status === "fulfilled" &&
      videoOutcome.value?.message
    ) {
      data.apiErrors.push(`Video API: ${videoOutcome.value.message}`);
    }

    if (data.audio || data.video) {
      return {
        success: true,
        title: data.title,
        thumbnail: data.thumbnail,
        author: data.author,
        audio: data.audio,
        audioQuality: data.audioQuality,
        video: data.video,
        videoQuality: data.videoQuality,
      };
    } else {
      return {
        success: false,
        error:
          data.apiErrors.join(" | ") ||
          "Tidak ada media YouTube ditemukan atau format tidak didukung.",
      };
    }
  } catch (err) {
    console.error("Kesalahan saat fetching dari YouTube API:", err);
    return {
      success: false,
      error:
        "Gagal mengambil data dari YouTube. Periksa koneksi atau URL Anda.",
    };
  }
}
