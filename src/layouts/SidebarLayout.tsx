import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"

export default function SidebarLayout({ children, prompts, pathname }: { children: React.ReactNode; prompts: any[]; pathname: string }) {
    return (
        <SidebarProvider>
            <AppSidebar prompts={prompts} pathname={pathname} />
            <SidebarInset>
                <div className="flex items-center p-4 pb-0 md:hidden">
                    <SidebarTrigger />
                </div>
                {children}
            </SidebarInset>
        </SidebarProvider>
    )
}