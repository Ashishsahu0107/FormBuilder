const express = require('express')
const { z } = require('zod')

const updateVersionSchema = z.object({
  schema: z.any(),
})

const result = updateVersionSchema.safeParse({ schema: { elements: [] } })
console.log('Result:', result)
