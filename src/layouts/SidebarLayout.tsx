import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"

export default function SidebarLayout({ children, prompts }: { children: React.ReactNode; prompts: any[] }) {
    return (
        <SidebarProvider>
            <AppSidebar prompts={prompts} />
            <SidebarInset>
                <div className="flex items-center p-4 pb-0 md:hidden">
                    <SidebarTrigger />
                </div>
                {children}
            </SidebarInset>
        </SidebarProvider>
    )
}