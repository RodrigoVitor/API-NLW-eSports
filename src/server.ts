import express, { response } from 'express'
import {PrismaClient} from '@prisma/client'
import { ConvertHourStringMinutes } from './utils/ConvertHourStringMinutes'
import { ConvertMinutesToHourString } from './utils/ConvertMinutesToHourString'
import cors from 'cors'
const app = express()
app.use(express.json())
app.use(cors())
const prisma = new PrismaClient()


app.get('/games', async (req, res) => {
    const games = await prisma.game.findMany({
        include: {
            _count: {
                select: {
                    ads: true
                }
            }
        }
    })
    return res.json(games)
})
app.post('/games/:id/ads', async (req, res) => {
    const gameId = req.params.id
    const body: any = req.body


    const ad = await prisma.ad.create({
        data: {
            gameId,
            name:body.name,
            yearsPlayng: body.yearsPlayng,
            discord: body.discord,
            weekDays: body.weekDays.join(','),
            hourSTart: ConvertHourStringMinutes(body.hourSTart),
            hourEnd: ConvertHourStringMinutes(body.hourEnd),
            useVoiceChannel: body.useVoiceChannel
        }
    })
    return res.send(ad)
})

app.get('/games/:id/ads', async (req, res) => {
    const gameId = req.params.id
    const ads = await prisma.ad.findMany({
        select: {
            id: true,
            name:true,
            weekDays: true,
            useVoiceChannel:true,
            yearsPlayng:true,
            hourEnd:true,
        },
        where: {
            gameId: gameId
        },
        orderBy: {
            createAt: 'desc'
        }
    })
    return res.json(ads.map(ad => {
        return {
            ...ad,
            weekDays: ad.weekDays.split(','),
            hourEnd: ConvertMinutesToHourString(ad.hourEnd)
        }
    }))
})
app.get('/ads/:id/discord', async (req, res) => {
    const adId = req.params.id
    const ad = await prisma.ad.findUniqueOrThrow({
        select: {
            discord:true
        },
        where: {
            id: adId
        }
    })
    return res.json({
        discord: ad.discord
    })
})

app.listen(8080, () => {
    console.log('Run at port 8080')
})

