const getBrowserLocale = (options = {}) => {
  const defaultOptions = { countryCodeOnly: false }

  const opt = { ...defaultOptions, ...options }

  const navigatorLocale =
    navigator.languages !== undefined
      ? navigator.languages[0]
      : navigator.language

  if (!navigatorLocale) {
    return undefined
  }

  if (navigatorLocale == "zh-CN" || navigatorLocale == "zh-TW") {
    return navigatorLocale
  }

  const trimmedLocale = opt.countryCodeOnly
    ? navigatorLocale.trim().split(/-|_/)[0]
    : navigatorLocale.trim()
  console.error(trimmedLocale);
  return trimmedLocale
}

export default getBrowserLocale
