export default {
  fetch(request) {
    const source = new URL(request.url);
    const target = new URL("https://www.lrcpropertyllc.com/");
    target.hash = "paywall";
    if (source.search) {
      target.search = source.search;
    }
    return Response.redirect(target.toString(), 301);
  },
};
