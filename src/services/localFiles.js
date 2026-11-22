// 从睡典钟楼公开前端重构；角色与素材归属保留。
import { MAX_STORED_IMAGE_BYTES } from "../data/files.js";
import { createAppError } from "../domain/errors.js";
function pickLocalFile(accept) {
  return new Promise((t, i) => {
    const a = document.createElement("input");
    a.type = "file";
    a.accept = accept;
    a.style.display = "none";
    let l = false;
    const n = (e) => {
      l || ((l = true), a.remove(), e ? t(e) : i(createAppError("已取消选择", "USER_CANCELLED")));
    };
    a.addEventListener(
      "change",
      () => {
        var e;
        return n((null == (e = a.files) ? void 0 : e[0]) || null);
      },
      {
        once: true,
      },
    );
    a.addEventListener("cancel", () => n(null), {
      once: true,
    });
    document.body.appendChild(a);
    a.click();
  });
}
function readLocalFile(file, asDataUrl = false) {
  return new Promise((i, a) => {
    const l = new FileReader();
    l.onload = () => {
      const e = String(l.result || "");
      i(asDataUrl ? e : e.replace(/^\uFEFF/, ""));
    };
    l.onerror = () => a(createAppError("无法读取所选文件", "FILE_READ_FAILED"));
    asDataUrl ? l.readAsDataURL(file) : l.readAsText(file, "UTF-8");
  });
}
async function readAndCompressImage(file) {
  if (!/^image\/(png|jpeg|webp)$/i.test(file.type))
    throw createAppError("请选择 PNG、JPG 或 WebP 图片", "INVALID_IMAGE");
  if (file.size > 12582912) throw createAppError("请选择小于 12MB 的图片", "IMAGE_TOO_LARGE");
  const t = await readLocalFile(file, true);
  if (file.size <= MAX_STORED_IMAGE_BYTES) return t;
  const i = await new Promise((e, i) => {
      const a = new Image();
      a.onload = () => e(a);
      a.onerror = () => i(createAppError("无法打开所选图片", "INVALID_IMAGE"));
      a.src = t;
    }),
    a = document.createElement("canvas"),
    l = Math.min(1, 1280 / Math.max(i.naturalWidth, i.naturalHeight));
  a.width = Math.max(1, Math.round(i.naturalWidth * l));
  a.height = Math.max(1, Math.round(i.naturalHeight * l));
  for (let n = 0; n < 4; n += 1) {
    const e = a.getContext("2d");
    if (!e) break;
    e.clearRect(0, 0, a.width, a.height);
    e.drawImage(i, 0, 0, a.width, a.height);
    for (const t of [0.85, 0.65, 0.45]) {
      const e = a.toDataURL("image/webp", t);
      if (Math.ceil(0.75 * (e.length - e.indexOf(",") - 1)) <= MAX_STORED_IMAGE_BYTES) return e;
    }
    a.width = Math.max(1, Math.round(0.75 * a.width));
    a.height = Math.max(1, Math.round(0.75 * a.height));
  }
  throw createAppError("图片压缩后仍过大，请选择较小的图片", "IMAGE_TOO_LARGE");
}
function pickLocalImage() {
  return "undefined" != typeof document && "undefined" != typeof FileReader
    ? pickLocalFile("image/png,image/jpeg,image/webp").then(readAndCompressImage)
    : Promise.reject(createAppError("当前环境不支持选择本地图片", "IMAGE_PICK_UNSUPPORTED"));
}
export { pickLocalFile, readLocalFile, readAndCompressImage, pickLocalImage };
