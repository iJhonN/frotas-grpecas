import { Sidebar } from "@/components/sidebar" // Ajuste o caminho da Sidebar se necessário

export default function CooperadosLayout({
                                             children,
                                         }: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 p-8 overflow-y-auto bg-slate-50">
                {children}
            </main>
        </div>
    )
}