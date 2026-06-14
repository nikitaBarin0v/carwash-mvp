import { useAuthContext } from "@/contexts/AuthContext"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProfileTab } from "./ProfileTab"
import { HistoryTab } from "./HistoryTab"


export function CabinetPage() {
  const { profile, user } = useAuthContext();

  return (
    <div className='max-w-4xl mx-auto px-4 py-10'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-gray-900'>Личный кабинет</h1>
        <p className='text-muted-foreground mt-1'>{user?.email}</p>
      </div>

      <Tabs defaultValue='history'>
        <TabsList className='mb-6'>
          <TabsTrigger value='history'>Мои записи</TabsTrigger>
          <TabsTrigger value='profile'>Профиль</TabsTrigger>
        </TabsList>

        <TabsContent value='history'>
          <HistoryTab />
        </TabsContent>

        <TabsContent value='profile'>
          <ProfileTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}