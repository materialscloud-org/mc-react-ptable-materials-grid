// Shade, Blend, Convert colors. From https://stackoverflow.com/a/13542669
export const RGB_Log_Blend = (p, c0, c1) => {
  var i = parseInt,
    r = Math.round,
    P = 1 - p,
    [a, b, c, d] = c0.split(","),
    [e, f, g, h] = c1.split(","),
    x = d || h,
    j = x
      ? "," +
        (!d
          ? h
          : !h
          ? d
          : r((parseFloat(d) * P + parseFloat(h) * p) * 1000) / 1000 + ")")
      : ")";
  return (
    "rgb" +
    (x ? "a(" : "(") +
    r(
      (P * i(a[3] == "a" ? a.slice(5) : a.slice(4)) ** 2 +
        p * i(e[3] == "a" ? e.slice(5) : e.slice(4)) ** 2) **
        0.5
    ) +
    "," +
    r((P * i(b) ** 2 + p * i(f) ** 2) ** 0.5) +
    "," +
    r((P * i(c) ** 2 + p * i(g) ** 2) ** 0.5) +
    j
  );
};
