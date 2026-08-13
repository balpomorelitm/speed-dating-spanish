import type { Metadata } from "next";
import SpeedDatingApp from "../src/SpeedDatingApp";

export const metadata: Metadata = {
  title: "Speak Dating en español",
  description: "Una actividad táctil para hablar, elegir y divertirse en español en HKU.",
};

export default function Home() {
  return <SpeedDatingApp />;
}
