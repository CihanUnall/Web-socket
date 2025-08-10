import Footer from "./components/Footer";
import "./globals.css";
export const metadata = {
  title: "Chat App",
  description: "Real-time chat application",
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body className="font-family-sans m-0 p-5">
        <header>
          <h1 className="text-zinc-700 font-bold text-5xl mb-10">Chat App</h1>
        </header>
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
