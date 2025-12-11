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

export function AppSidebar({ prompts }: { prompts: Prompt[] }) {
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

    const renderTree = (nodes: Record<string, CategoryNode>, depth = 0) => {
        const sortedNodes = Object.values(nodes).sort((a, b) => a.name.localeCompare(b.name));
        return sortedNodes.map((node) => {
            const hasChildren = Object.keys(node.children).length > 0;
            const href = `/prompt-library/prompts/${node.path}`;

            if (depth === 0) {
                return (
                    <Collapsible key={node.path} asChild defaultOpen={false} className="group/collapsible">
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