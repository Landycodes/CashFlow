export default function formatDate(dateString) {
  function getSuffixFor(day) {
    if (day % 10 === 1 && day !== 11) return "st";
    if (day % 10 === 2 && day !== 12) return "nd";
    if (day % 10 === 3 && day !== 13) return "rd";
    return "th";
  }

  const date = new Date(dateString);
  const day = date.getUTCDate();
  const month = date.toLocaleString("en-US", {
    month: "short",
    timeZone: "UTC",
  });

  return `${month} ${day}${getSuffixFor(day)}`;
}
