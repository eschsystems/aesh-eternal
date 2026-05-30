import { VT323 } from "next/font/google";
import Terminal from "./Terminal";

const vt323 = VT323({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-vt",
  display: "swap",
});

export const metadata = {
  title: "LAYER-000",
};

export default function Layer000() {
  return (
    <div className={vt323.variable}>
      <Terminal />
    </div>
  );
}
