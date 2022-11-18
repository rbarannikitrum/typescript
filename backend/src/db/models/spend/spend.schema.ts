import mongoose, {Model, Schema} from 'mongoose'

interface ISpend {
  _id? : string
  place: string
  time: Date
  price: number
  permanentTime : Date
}

const spendScheme = new mongoose.Schema<ISpend>({
  place: String,
  time: Date,
  price: Number,
  permanentTime : Date
})

const Spend: Model<ISpend> = mongoose.model('spends', spendScheme)

export {Spend, ISpend}