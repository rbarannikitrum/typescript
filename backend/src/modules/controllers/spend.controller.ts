import {ISpend, Spend} from '../../db/models/spend/spend.schema'
import {Request, Response} from "express";
import {Error} from "mongoose";


const createSpend = (req: Request, res: Response): void => {
  const {place, price}: ISpend = req.body
  try {
    if (price > 0) {
      const time: Date = new Date()
      const permanentTime: Date = new Date()
      const spend = new Spend({place, time, price, permanentTime})
      spend.save().then(result => res.send(result))
    } else {
      res.status(400).send('uncorrected data')
    }
  } catch (error: any) {
    if (error instanceof Error) {
      res.status(500).send( {message : error.message})
    } else {
      res.status(500).send(`server error : ${error}`)
    }
  }
}

const getAllSpends = (req: Request, res: Response): void => {
  try {
    Spend.find().then(result => {
      res.send(result)
    })
  } catch (error) {
    res.status(500).send(`server error : ${error}`)
  }
}

const updateSpend = (req: Request, res: Response): void => {
  try {
    let {_id, place, time, price, permanentTime}: ISpend = req.body
    time = new Date(time)
    permanentTime = new Date(permanentTime)
    if (price > 0 &&
        time.toString() != 'Invalid Date' &&
        Math.abs(new Date(time).getTime() - new Date(permanentTime).getTime()) / (60 * 60 * 24 * 1000) < 7
    ) {
      Spend.findByIdAndUpdate(_id, {place, time, price}).then(result => res.send(result))
    } else res.status(400).send('uncorrected data')
  }
  catch (error: any) {
    if (error instanceof Error) {
      res.status(500).send({message: error.message})
    }
    else {
      res.status(500).send(`server error : ${error}`)
    }
  }

}


const deleteSpend = (req: Request, res: Response): void => {
  try {
   Spend.findByIdAndDelete({_id: req.query._id}).then(result => res.status(200).send(result))
  } catch (error: any) {
    if (error instanceof Error) {
      res.status(500).send({message: error})
    }
    else {
      res.status(500).send(`server error : ${error}`)
    }
  }
}

export {getAllSpends, createSpend, updateSpend, deleteSpend}