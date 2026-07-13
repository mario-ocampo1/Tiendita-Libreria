import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Caja del día | Con-Texto POS',
  description: 'Gestión de caja del día',
};

export default function CajaLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
