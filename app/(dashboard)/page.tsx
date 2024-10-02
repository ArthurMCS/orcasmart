import { Button } from '@/components/ui/button';
import prisma from '@/lib/prisma';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import React from 'react'
import CreateTransactionDialog from './_components/CreateTransactionDialog';
import OverView from './_components/OverView';
import History from './_components/History';

async function page() {
  const user = await currentUser();
  
  if (!user) {
    redirect("/sign-in");
  }

  const userSettings = await prisma.userSettings.findUnique(({
    where: {
      userId: user.id
    }
  }))

  if(!userSettings){
    redirect('/wizard')
  }


  return (
    <div className='h-full'>
      <div className='border-b bg-card'>
        <div className='flex w-full flex-wrap items-center justify-between gap-6 py-8 px-8'>
          <p className='text-3xl font-bold'>
            Olá, {user.firstName}! 👋
          </p>

          <div className='flex items-center gap-3'>
            <CreateTransactionDialog 
                trigger={
                  <Button variant="outline" className='border-emerald-500 bg-emerald-950 text-white hover:bg-emerald-700 hover:text-white'>
                    Nova renda 🤑
                  </Button>
                }
                type="income"
            />

            <CreateTransactionDialog 
                trigger={
                  <Button variant="outline" className='border-rose-500 bg-rose-950 text-white hover:bg-rose-700 hover:text-white'>
                    Novo gasto 🙁
                  </Button>
                }
                type="expense"
            />
          </div>
        </div>
      </div>
      <OverView userSettings={userSettings} />
      <History userSettings={userSettings} />
    </div>
  )
}

export default page