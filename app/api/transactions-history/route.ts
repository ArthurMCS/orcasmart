import prisma from "@/lib/prisma";
import { OverviewQuerySchema } from "@/schema/overview";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { GetFormatterForCurrency } from "@/lib/helpers";

export async function GET(request: Request) {
    const user = await currentUser();

    if (!user) {
        redirect('/sign-in');
    }

    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from')
    const to = searchParams.get('to')

    const queryParams = OverviewQuerySchema.safeParse({ from, to })

    if (!queryParams.success) {
        return Response.json(queryParams.error.message, {
            status: 400,
        })
    }

    const transactions = await getTransactionsHistory(user.id, queryParams.data.from, queryParams.data.to)

    return Response.json(transactions)
}

export type GettRansactionHistoryResponseType = Awaited<ReturnType<typeof getTransactionsHistory>>

async function getTransactionsHistory(userId: string, from: Date, to: Date,) {
    const userSettings = await prisma.userSettings.findUnique({
        where: {
            id: userId,
        }
    })

    if (!userSettings) {
        throw new Error("user settings not found")
    }


    const formatter = GetFormatterForCurrency(userSettings.currency);

    const transactions = await prisma.transaction.findMany({
        where: {
            createdBy: userId,
            date: {
                gte: from,
                lte: to,
            },
        },
        include: {
            category: true,  // Isso incluirá o objeto `Category`
            responsibles: {
                include: {
                    responsible: true,  // Isso incluirá o objeto `Responsible`
                },
            },
        },
        orderBy: {
            date: "desc"
        }
    })

    return transactions.map((transaction) => ({
        ...transaction,
        formattedAmount: formatter.format(transaction.amount)
    }))
}