export function dashboardTripTitle(title: string) {
  return title.split("|")[0]?.trim() || title;
}
