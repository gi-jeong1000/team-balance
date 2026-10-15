import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "TEAM BALANCE | 팀 밸런스 게임", description: "우리 팀의 선택이 승부를 바꾼다!" };
export default function RootLayout({children}:{children:React.ReactNode}) { return <html lang="ko"><body>{children}</body></html>; }
