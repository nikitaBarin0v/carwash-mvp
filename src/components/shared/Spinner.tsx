import { cn } from "@/lib/utils";

interface SpinnerProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function Spinner({ className, size = 'md' }: SpinnerProps) {
  return (
    <div className={cn(
      'animate-spin rounded-full border-2 border-gray-200 border-t-blue-600',
      size === 'sm' && 'w-4 h-4',
      size === 'md' && 'w-8 h-8',
      size === 'lg' && 'w-12 h-12',
      className
    )} />
  )
}

export function PageSpinner() {
  return (
    <div className='flex items-center justify-center min-h-[calc(100vh-64px)]'>
      <div className='flex flex-col items-center gap-3'>
        <Spinner size='lg' />
        <p className='text-sm text-muted-foreground'>Загрузка...</p>
      </div>
    </div>
  )
}