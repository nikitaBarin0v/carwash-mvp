import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function NotFoundPage() {
  return (
    <div className='flex flex-col items-center justify-center min-h-[calc(100vh-64px)] px-4 text-center'>
      <p className='text-8xl font-bold text-blue-600 mb-4'>404</p>
      <h1 className='text-2xl font-bold text-gray-900 mb-2'>
        Страница не найдена
      </h1>
      <p className='text-gray-500 mb-8 max-w-sm'>
        Возможно, страница была удалена или вы перешли по неверной ссылке
      </p>
      <div className='flex gap-3'>
        <Link to='/'>
          <Button>На главную</Button>
        </Link>
        <Link to='/booking'>
          <Button variant='outline'>На главную</Button>
        </Link>
      </div>
    </div>
  )
}