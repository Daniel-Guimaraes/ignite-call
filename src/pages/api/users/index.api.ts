import type { NextApiRequest, NextApiResponse } from 'next'

import { prisma } from '../../../lib/prisma'

import { setCookie } from 'nookies'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    return res.status(405).end()
  }

  const { name, username } = req.body

  const userExisting = await prisma.user.findUnique({
    where: {
      username,
    },
  })

  if (userExisting) {
    return res.status(400).json({
      message: ' Username already existing.',
    })
  }

  const user = await prisma.user.create({
    data: {
      name,
      username,
    },
  })

  setCookie({ res }, '@ignitecall:userId', user.id, {
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })

  return res.status(201).json(user)
}
