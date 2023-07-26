const chars = [
  "\n",
  " ",
  "#",
  "+",
  "-",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "=",
  "B",
  "K",
  "N",
  "O",
  "Q",
  "R",
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
  "x",
]
function encode(c) {
  return chars.indexOf(c)
}
function decode(n) {
  return chars[n]
}
export function encodeString(str) {
  return str.split("").map(encode)
}
export function decodeArray(arr) {
  return arr.map(decode).join("")
}
