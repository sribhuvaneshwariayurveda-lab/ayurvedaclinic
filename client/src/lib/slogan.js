export const EMPTY_SLOGAN = {
  heading: "",
  english: "",
  tamil: "",
  sanskrit: "",
  meaning: "",
  description: "",
  visible: true,
  status: "draft",
  startAt: "",
  endAt: "",
  publishedAt: ""
};

/** Mirrors the server-side schedule check so static builds behave the same. */
export function isSloganActive(slogan, now = Date.now()) {
  if (!slogan || slogan.status !== "published" || slogan.visible === false) return false;
  if (!slogan.english && !slogan.tamil && !slogan.sanskrit && !slogan.meaning) return false;
  if (slogan.startAt) {
    const start = new Date(slogan.startAt).getTime();
    if (!Number.isNaN(start) && now < start) return false;
  }
  if (slogan.endAt) {
    const end = new Date(slogan.endAt).getTime();
    if (!Number.isNaN(end) && now > end) return false;
  }
  return true;
}
