import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import SessionContext from "./context/SessionContext";
import NextTopLoader from "nextjs-toploader";
import Navbar from "./components/Navbar/Navbar";

const geistSans = localFont({
	src: "./fonts/GeistVF.woff",
	variable: "--font-geist-sans",
	weight: "100 900",
});
const geistMono = localFont({
	src: "./fonts/GeistMonoVF.woff",
	variable: "--font-geist-mono",
	weight: "100 900",
});

export const metadata: Metadata = {
	title: "Create Next App",
	description: "Generated by create next app",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<SessionContext>
			<html lang="en">
				<body
					className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
					<NextTopLoader />
					<Navbar />
					<main className="min-h-[88vh] overflow-auto">
						<div className="w-full h-full py-10">{children}</div>
					</main>
				</body>
			</html>
		</SessionContext>
	);
}
