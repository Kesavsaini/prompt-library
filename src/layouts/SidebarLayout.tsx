import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"

export default function SidebarLayout({ children, prompts }: { children: React.ReactNode; prompts: any[] }) {
    return (
        <SidebarProvider>
            <AppSidebar prompts={prompts} />
            <main>
                <SidebarTrigger />
                {children}
            </main>
        </SidebarProvider>
    )
}