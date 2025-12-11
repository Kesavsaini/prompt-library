import * as React from "react"
import { ChevronRight } from "lucide-react"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@radix-ui/react-collapsible"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuAction,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from "@/components/ui/sidebar"

interface Prompt {
    id: string;
}

interface CategoryNode {
    name: string;
    path: string;
    children: Record<string, CategoryNode>;
}

export function AppSidebar({ prompts, pathname }: { prompts: Prompt[]; pathname: string }) {
    // Build tree from prompt IDs
    const tree: Record<string, CategoryNode> = {};

    if (prompts) {
        prompts.forEach(prompt => {
            const parts = prompt.id.split('/');
            parts.pop(); // remove filename

            // If file is at root of prompts dir, parts is empty. handle that?
            // But user put everything in folders.
            if (parts.length === 0) return;

            let currentLevel = tree;
            let currentPath = "";

            parts.forEach((part) => {
                currentPath = currentPath ? `${currentPath}/${part}` : part;
                if (!currentLevel[part]) {
                    currentLevel[part] = {
                        name: part.charAt(0).toUpperCase() + part.slice(1),
                        path: currentPath,
                        children: {}
                    };
                }
                currentLevel = currentLevel[part].children;
            });
        });
    }

    // Helper to extract active paths from current pathname
    const getActivePaths = (path: string) => {
        const prefix = "/prompt-library/prompts/";
        const active: Record<string, boolean> = {};
        if (path && path.startsWith(prefix)) {
            const parts = path.slice(prefix.length).split('/');
            let current = "";
            parts.forEach((part) => {
                if (!part) return;
                current = current ? `${current}/${part}` : part;
                active[current] = true;
            });
        }
        return active;
    };

    // Initialize state with active paths (SSR friendly) + localStorage (Client)
    const [openStates, setOpenStates] = React.useState<Record<string, boolean>>(() => {
        const active = getActivePaths(pathname);
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem("sidebar-state");
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    // Merge saved state with active state. 
                    // Active state takes precedence for "ensure open", but we keep other saved opens.
                    return { ...parsed, ...active };
                } catch (e) {
                    console.error("Failed to parse sidebar state", e);
                }
            }
        }
        return active;
    });

    // Update state when pathname changes (for client-side navigation)
    React.useEffect(() => {
        setOpenStates(prev => {
            const newActive = getActivePaths(pathname);
            // Only update if there are new active paths that aren't open
            const next = { ...prev };
            let changed = false;
            Object.keys(newActive).forEach(key => {
                if (!next[key]) {
                    next[key] = true;
                    changed = true;
                }
            });

            if (changed) {
                // We typically don't persist "auto-opened" things to localStorage immediately
                // to avoid polluting user prefs, but for simplicity/consistency we can.
                // Or just update local state.
                return next;
            }
            return prev;
        });
    }, [pathname]);

    const handleOpenChange = (path: string, isOpen: boolean) => {
        setOpenStates(prev => {
            const next = { ...prev, [path]: isOpen };
            localStorage.setItem("sidebar-state", JSON.stringify(next));
            return next;
        });
    };

    const renderTree = (nodes: Record<string, CategoryNode>, depth = 0) => {
        const sortedNodes = Object.values(nodes).sort((a, b) => a.name.localeCompare(b.name));
        return sortedNodes.map((node) => {
            const hasChildren = Object.keys(node.children).length > 0;
            const href = `/prompt-library/prompts/${node.path}`;

            if (depth === 0) {
                return (
                    <Collapsible
                        key={node.path}
                        asChild
                        open={!!openStates[node.path]}
                        onOpenChange={(isOpen) => handleOpenChange(node.path, isOpen)}
                        className="group/collapsible"
                    >
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild tooltip={node.name}>
                                <a href={href}>
                                    <span>{node.name}</span>
                                </a>
                            </SidebarMenuButton>
                            {hasChildren && (
                                <>
                                    <CollapsibleTrigger asChild>
                                        <SidebarMenuAction className="data-[state=open]:rotate-90 transition-transform">
                                            <ChevronRight />
                                            <span className="sr-only">Toggle {node.name}</span>
                                        </SidebarMenuAction>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <SidebarMenuSub>
                                            {renderTree(node.children, depth + 1)}
                                        </SidebarMenuSub>
                                    </CollapsibleContent>
                                </>
                            )}
                        </SidebarMenuItem>
                    </Collapsible>
                );
            }

            // Depth > 0 (Sub-items)
            return (
                <SidebarMenuSubItem key={node.path}>
                    <SidebarMenuSubButton asChild>
                        <a href={href}>
                            <span>{node.name}</span>
                        </a>
                    </SidebarMenuSubButton>
                </SidebarMenuSubItem>
            );
        });
    };

    return (
        <Sidebar>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <a href="/prompt-library">
                                <span className="font-semibold">Prompt Library</span>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                            <a href="/prompt-library/prompts">
                                <span>All Prompts</span>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Categories</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {renderTree(tree)}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter />
        </Sidebar>
    )
}