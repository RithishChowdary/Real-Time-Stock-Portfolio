import { useContext } from "react";
import { RealTimeContext } from "../context/RealTimeContext";

export function useRealtime() {
  return useContext(RealTimeContext);
}