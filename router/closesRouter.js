import { deleteCloses, getCloses, postCloses } from "../controllers/closesController.js";
import express from "express";

const router = express.Router();

router
.get('/', getCloses)
.post('/', postCloses)
.delete('/:_id', deleteCloses)

export default router;