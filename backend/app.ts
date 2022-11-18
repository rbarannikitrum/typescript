import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import {router} from './src/modules/routes/routes'
const app = express()
dotenv.config()
app.use(cors())
app.use(express.json())
app.use('/', router)

const URI: string = process.env.URI_SPEND ?? ''
if (URI) {
  mongoose.connect(URI)
}

app.listen(process.env.PORT, () => {
  console.log('hello')
})