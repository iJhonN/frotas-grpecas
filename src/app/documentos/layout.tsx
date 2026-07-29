import { Sidebar } from "@/components/sidebar"

export default function DocumentosLayout({
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