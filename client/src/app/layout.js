import "./globals.css";
import ClientLayout from "@/components/ClientLayout";
import Footer from "@/components/Footer";

export const metadata = {
  title: "AVARONI",
  description: "Elegance Redefined for Every Moment",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Outfit:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" />
        <link href="https://cdnjs.cloudflare.com/ajax/libs/aos/2.3.4/aos.css" rel="stylesheet" />
      </head>
      <body>
        <ClientLayout>
            {children}
        </ClientLayout>
        <Footer />
      </body>
    </html>
  );
}
