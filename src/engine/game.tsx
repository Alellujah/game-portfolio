export function calculateDamage(
  attackerLevel: number,
  attackerAttack: number,
  defenderDefense: number,
  movePower: number
): number {
  const baseDamage =
    (((2 * attackerLevel) / 5 + 2) *
      movePower *
      (attackerAttack / defenderDefense)) /
      50 +
    2;
  const randomFactor = Math.random() * (1 - 0.85) + 0.85; // Random factor between 0.85 and 1
  return Math.floor(baseDamage * randomFactor);
}

export function applyItemEffect(
  item: string,
  currentHp: number,
  maxHp: number
): number {
  switch (item) {
    case "Snickers Bar":
      return Math.min(currentHp + 20, maxHp);
    case "Beer":
      return Math.min(currentHp + 50, maxHp);
    case "Shot of Vodka":
      return Math.min(currentHp + 200, maxHp);
    case "Good Night Sleep":
      return maxHp;
    default:
      return currentHp; // No effect if item is unknown
  }
}
