export function getAdultCheckKey(
  partyId: string | number,
  userId: string | number,
) {
  return `submate:adult-check:${partyId}:${userId}`;
}
