// UI Components Barrel Export

// Export components used in post-creation-editor
export { Button, buttonVariants } from './button';
export { Input } from './input';
export {
   Select,
   SelectContent,
   SelectGroup,
   SelectItem,
   SelectLabel,
   SelectScrollDownButton,
   SelectScrollUpButton,
   SelectSeparator,
   SelectTrigger,
   SelectValue
} from './select';
export { Textarea } from './textarea';
export { Badge, badgeVariants } from './badge';
export {
   Card,
   CardHeader,
   CardFooter,
   CardTitle,
   CardAction,
   CardDescription,
   CardContent
} from './card';
export {
   Dialog,
   DialogClose,
   DialogContent,
   DialogDescription,
   DialogFooter,
   DialogHeader,
   DialogOverlay,
   DialogPortal,
   DialogTitle,
   DialogTrigger
} from './dialog';
export { Spinner } from './spinner';
export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants } from './tabs';
// export { Pagination } from './pagination'; // Commented out - component doesn't exist yet
export { Table } from './table';
export { Alert } from './alert';

// Create aliases for components used in post-creation-editor
// Dialog component will be used as Modal
export { Dialog as Modal } from './dialog';
export { DialogContent as ModalContent } from './dialog';
export { DialogHeader as ModalHeader } from './dialog';
export { DialogTitle as ModalTitle } from './dialog';

// Spinner will be used as Loading
export { Spinner as Loading } from './spinner';
