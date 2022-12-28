const urlPattern = /^(https?:\/\/.)[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&/=]*)$/i;

export function isUrl(url) {
  return urlPattern.test(url);
}
