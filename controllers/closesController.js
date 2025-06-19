import closesModel from "../models/closesModel.js";



const getCloses = async (req, res) => {
    const closes = await closesModel.find();
    res.json(closes)
}

const postCloses = async (req, res) => {
    const { img, name} = req.body
    const closes = {img, name}
    await closesModel.create(closes)
    res.json(closes)
}


const deleteCloses = async (req, res) =>{
    const {_id} = req.params
    await closesModel.findByIdAndDelete(_id)
    res.json({_id})
} 

export { getCloses, postCloses, deleteCloses }