import { useCallback, useState } from "react";

export function useReloader(): [() => void, number] {
  const [times, setTimes] = useState(0);
  return [() => setTimes(r => r + 1), times];
}