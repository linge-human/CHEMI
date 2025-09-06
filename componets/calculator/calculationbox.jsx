import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GripVertical, X } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export default function CalculationBox({ id, type, onRemove, children }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style}>
            <Card className="shadow-md border border-border bg-card break-inside-avoid-column">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xl font-bold">{type}</CardTitle>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onMouseDown={(e) => e.stopPropagation()} {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
                            <GripVertical className="h-5 w-5 text-muted-foreground" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={onRemove}>
                            <X className="h-5 w-5 text-muted-foreground" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {children}
                </CardContent>
            </Card>
        </div>
    );
}
