import "dotenv/config";
import { Telegraf, Markup } from "telegraf";

import { getInstagramData } from "../api/instagram.js";
import { getFacebookData } from "../api/facebook.js";
import { getTikTokData } from "../api/tiktok.js";
import { getPinterestData } from "../api/pinterest.js";
import { getTwitterData } from "../api/twitter.js";
import { getSpotifyData } from "../api/spotify.js";
import { getYouTubeData } from "../api/youtube.js";

const BOT_TOKEN = process.env.BOT_TELEGRAM_TOKEN;

if (!BOT_TOKEN) {
  console.error(
    "❌ ERROR: BOT_TOKEN tidak ditemukan. Pastikan sudah diatur di file .env atau environment."
  );
  process.exit(1);
}

export const bot = new Telegraf(BOT_TOKEN);

const detectDownloaderType = (url) => {
  // Hapus ': string'
  if (url.includes("tiktok.com/") || url.includes("vt.tiktok.com/")) {
    return "tiktok";
  }
  if (url.includes("facebook.com/") || url.includes("fb.watch/")) {
    return "facebook";
  }
  if (url.includes("instagram.com/") || url.includes("instagr.am/")) {
    return "instagram";
  }
  if (url.includes("pinterest.com/") || url.includes("pin.it/")) {
    return "pinterest";
  }
  if (url.includes("twitter.com/") || url.includes("x.com/")) {
    return "twitter";
  }

  if (url.includes("open.spotify.com/") || url.includes("spotify.link/")) {
    return "spotify";
  }
  if (url.includes("youtube.com/") || url.includes("youtu.be/")) {
    return "youtube";
  }
  return "unknown";
};

bot.start((ctx) => {
  ctx.reply(
    "Halo! 👋 Kirimkan saya tautan video atau audio dari platform yang didukung (misalnya TikTok, Facebook, Instagram, YouTube, Twitter, Pinterest, Spotify) untuk saya unduh."
  );
});

bot.on("text", async (ctx) => {
  const messageText = ctx.message.text.trim();

  if (messageText.startsWith("/")) {
    return;
  }

  if (!messageText.includes("http://") && !messageText.includes("https://")) {
    return ctx.reply(
      "Sepertinya itu bukan tautan URL yang valid. Tolong kirimkan tautan video/audio yang benar."
    );
  }

  const downloaderType = detectDownloaderType(messageText);

  if (downloaderType === "unknown") {
    return ctx.reply(
      "Maaf, saya tidak mengenali jenis tautan ini. Saya mendukung TikTok, Facebook, Instagram, YouTube, Twitter, Pinterest, dan Spotify."
    );
  }

  const processingMessage = await ctx.reply(
    `Mendeteksi tautan *${downloaderType}*. Mohon tunggu, saya sedang memproses...`,
    { parse_mode: "Markdown" }
  );

  try {
    let result;
    let replyMessage = `*Hasil Unduhan dari ${downloaderType.toUpperCase()}* ✨\n\n`;
    const buttons = [];

    switch (downloaderType) {
      case "tiktok":
        result = await getTikTokData(messageText);
        if (result.success) {
          const tiktokButtons = [];
          if (result.videoNoWatermark)
            tiktokButtons.push(
              Markup.button.url("🎬 Video (No WM)", result.videoNoWatermark)
            );
          if (result.videoWatermark)
            tiktokButtons.push(
              Markup.button.url("🎬 Video (WM)", result.videoWatermark)
            );
          if (result.audio)
            tiktokButtons.push(Markup.button.url("🎵 Audio", result.audio));

          if (result.cover && tiktokButtons.length > 0) {
            const caption = `*Judul:* ${
              result.title || "Tidak Diketahui"
            }\n*Oleh:* ${
              result.author || "Tidak Diketahui"
            }\n\n_Pilih opsi unduhan di bawah ini:_`;
            await ctx.deleteMessage(processingMessage.message_id);
            await ctx.replyWithPhoto(result.cover, {
              caption: caption,
              parse_mode: "Markdown",
              reply_markup: {
                inline_keyboard: tiktokButtons.map((btn) => [btn]),
              },
            });
            return;
          } else if (tiktokButtons.length > 0) {
            replyMessage += `*Judul:* ${result.title || "Tidak Diketahui"}\n`;
            replyMessage += `*Oleh:* ${result.author || "Tidak Diketahui"}\n\n`;
            tiktokButtons.forEach((btn) => buttons.push([btn]));
          }
        }
        break;

      case "facebook":
        result = await getFacebookData(messageText);
        if (result.success) {
          if (result.hd)
            buttons.push([Markup.button.url("🎬 Unduh HD", result.hd)]);
          if (result.sd)
            buttons.push([Markup.button.url("🎬 Unduh SD", result.sd)]);
        }
        break;

      case "instagram":
        result = await getInstagramData(messageText);
        if (result.success) {
          const igButtons = [];
          if (result.downloadUrl)
            igButtons.push(
              Markup.button.url("📥 Unduh Media", result.downloadUrl)
            );

          if (result.thumbnailUrl && igButtons.length > 0) {
            const caption = `*Media Instagram Ditemukan!* 📸\n\n${
              result.caption ? `*Caption:* ${result.caption}\n\n` : ""
            }_Pilih opsi unduhan di bawah ini:_`;
            await ctx.deleteMessage(processingMessage.message_id);
            await ctx.replyWithPhoto(result.thumbnailUrl, {
              caption: caption,
              parse_mode: "Markdown",
              reply_markup: { inline_keyboard: igButtons.map((btn) => [btn]) },
            });
            return;
          } else if (igButtons.length > 0) {
            if (result.caption)
              replyMessage += `*Caption:* ${result.caption}\n\n`;
            igButtons.forEach((btn) => buttons.push([btn]));
          }
        }
        break;

      case "pinterest":
        result = await getPinterestData(messageText);
        if (result.success && result.media && result.media.length > 0) {
          let mediaCount = 0;
          const pinterestButtons = [];
          for (const mediaItem of result.media) {
            if (mediaCount >= 5) break;
            const mediaType =
              mediaItem.extension === "mp4" ? "Video" : "Gambar";
            pinterestButtons.push(
              Markup.button.url(
                `⬇️ ${mediaType} (${mediaItem.quality})`,
                mediaItem.url
              )
            );
            mediaCount++;
          }
          if (result.previewImage && pinterestButtons.length > 0) {
            await ctx.deleteMessage(processingMessage.message_id);
            await ctx.replyWithPhoto(result.previewImage, {
              caption: "_Pilih opsi unduhan di bawah ini:_",
              parse_mode: "Markdown",
              reply_markup: {
                inline_keyboard: pinterestButtons.map((btn) => [btn]),
              },
            });
            return;
          } else if (pinterestButtons.length > 0) {
            pinterestButtons.forEach((btn) => buttons.push([btn]));
          }
        }
        break;

      case "twitter":
        result = await getTwitterData(messageText);
        if (result.success && result.media && result.media.length > 0) {
          for (const mediaItem of result.media) {
            buttons.push([
              Markup.button.url(
                `⬇️ Video (${mediaItem.quality})`,
                mediaItem.url
              ),
            ]);
          }
        }
        break;

      case "spotify":
        result = await getSpotifyData(messageText);
        if (result.success && result.downloadUrl) {
          replyMessage += `*Judul:* ${
            result.metadata?.title || "Tidak Diketahui"
          }\n`;
          replyMessage += `*Artis:* ${
            result.metadata?.artist || "Tidak Diketahui"
          }\n`;
          replyMessage += `*Album:* ${
            result.metadata?.album || "Tidak Diketahui"
          }\n\n`;
          const spotifyButtons = [
            Markup.button.url("🎵 Unduh Audio", result.downloadUrl),
          ];

          if (result.metadata?.thumbnail && spotifyButtons.length > 0) {
            await ctx.deleteMessage(processingMessage.message_id);
            await ctx.replyWithPhoto(result.metadata.thumbnail, {
              caption: replyMessage,
              parse_mode: "Markdown",
              reply_markup: {
                inline_keyboard: spotifyButtons.map((btn) => [btn]),
              },
            });
            return;
          } else {
            spotifyButtons.forEach((btn) => buttons.push([btn]));
          }
        }
        break;

      case "youtube":
        result = await getYouTubeData(messageText);
        if (result.success) {
          replyMessage += `*Judul:* ${result.title || "Tidak Diketahui"}\n`;
          replyMessage += `*Oleh:* ${result.author || "Tidak Diketahui"}\n\n`;
          const youtubeButtons = [];
          if (result.audio)
            youtubeButtons.push(
              Markup.button.url(
                `🎵 Audio (${result.audioQuality || "Best"})`,
                result.audio
              )
            );
          if (result.video)
            youtubeButtons.push(
              Markup.button.url(
                `🎬 Video (${result.videoQuality || "Best"})`,
                result.video
              )
            );

          if (result.thumbnail && youtubeButtons.length > 0) {
            await ctx.deleteMessage(processingMessage.message_id);
            await ctx.replyWithPhoto(result.thumbnail, {
              caption: replyMessage,
              parse_mode: "Markdown",
              reply_markup: {
                inline_keyboard: youtubeButtons.map((btn) => [btn]),
              },
            });
            return;
          } else {
            youtubeButtons.forEach((btn) => buttons.push([btn]));
          }
        }
        break;

      default:
        await ctx.deleteMessage(processingMessage.message_id).catch(() => {});
        return ctx.reply(
          "Terjadi kesalahan yang tidak terduga. Silakan coba lagi."
        );
    }

    await ctx.deleteMessage(processingMessage.message_id).catch(() => {});

    if (result.success && buttons.length > 0) {
      await ctx.reply(replyMessage, {
        parse_mode: "Markdown",
        reply_markup: { inline_keyboard: buttons },
      });
    } else if (result.success && buttons.length === 0) {
      await ctx.reply(
        "Maaf, tidak ditemukan tautan unduhan yang tersedia untuk tautan ini."
      );
    } else {
      await ctx.reply(
        `Maaf, terjadi kesalahan saat mengunduh: ${
          result.error || "Detail tidak tersedia."
        }`
      );
    }
  } catch (error) {
    console.error("Error saat memproses pesan bot:", error.message);
    console.error("Error stack:", error.stack);
    await ctx.deleteMessage(processingMessage.message_id).catch(() => {});
    await ctx.reply(
      "Maaf, terjadi kesalahan tak terduga. Silakan coba lagi nanti."
    );
  }
});
