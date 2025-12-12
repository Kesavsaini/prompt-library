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
import { Button } from "./ui/button";

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
                        <SidebarMenuButton className="mb-12" size="lg" asChild>
                            <div className="flex items-baseline gap-2">
                                <img src="/prompt-library/logo.png" alt="Logo" width={32} height={32} />
                                <span className="text-lg font-bold">Prompts</span>
                            </div>
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
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                            <Button asChild className="flex items-center gap-2 p-2 bg-secondary">
                                <a
                                    href="https://github.com/Kesavsaini/prompt-library/issues/new?template=prompt_submission.yml"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <svg viewBox="0 0 1024 1024" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M8 0C3.58 0 0 3.58 0 8C0 11.54 2.29 14.53 5.47 15.59C5.87 15.66 6.02 15.42 6.02 15.21C6.02 15.02 6.01 14.39 6.01 13.72C4 14.09 3.48 13.23 3.32 12.78C3.23 12.55 2.84 11.84 2.5 11.65C2.22 11.5 1.82 11.13 2.49 11.12C3.12 11.11 3.57 11.7 3.72 11.94C4.44 13.15 5.59 12.81 6.05 12.6C6.12 12.08 6.33 11.73 6.56 11.53C4.78 11.33 2.92 10.64 2.92 7.58C2.92 6.71 3.23 5.99 3.74 5.43C3.66 5.23 3.38 4.41 3.82 3.31C3.82 3.31 4.49 3.1 6.02 4.13C6.66 3.95 7.34 3.86 8.02 3.86C8.7 3.86 9.38 3.95 10.02 4.13C11.55 3.09 12.22 3.31 12.22 3.31C12.66 4.41 12.38 5.23 12.3 5.43C12.81 5.99 13.12 6.7 13.12 7.58C13.12 10.65 11.25 11.33 9.47 11.53C9.76 11.78 10.01 12.26 10.01 13.01C10.01 14.08 10 14.94 10 15.21C10 15.42 10.15 15.67 10.55 15.59C13.71 14.53 16 11.53 16 8C16 3.58 12.42 0 8 0Z" transform="scale(64)" fill="#ffff" /></svg>
                                    <span className="font-semibold text-white">Submit Prompt</span>
                                </a>
                            </Button>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar >
    )
}