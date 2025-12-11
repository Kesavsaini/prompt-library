import * as React from "react"
import { Check, Copy } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface CopyButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
    value: string
}

export function CopyButton({
    value,
    className,
    ...props
}: CopyButtonProps) {
    const [hasCopied, setHasCopied] = React.useState(false)

    React.useEffect(() => {
        setTimeout(() => {
            setHasCopied(false)
        }, 2000)
    }, [hasCopied])

    return (
        <Button
            size="icon"
            variant="ghost"
            className={cn("relative h-8 w-8", className)}
            onClick={() => {
                navigator.clipboard.writeText(value)
                setHasCopied(true)
            }}
            {...props}
        >
            <span className="sr-only">Copy</span>
            {hasCopied ? (
                <Check className="h-4 w-4" />
            ) : (
                <Copy className="h-4 w-4" />
            )}
        </Button>
    )
}
