const express = require('express')
const router = express.Router()

import {getAllSpends, createSpend, updateSpend, deleteSpend} from '../controllers/spend.controller'

router.get('/allSpends', getAllSpends)
router.post('/create', createSpend)
router.patch('/update', updateSpend)
router.delete('/delete', deleteSpend)

export {router}