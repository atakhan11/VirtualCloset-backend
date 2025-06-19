import mongoose from "mongoose";


const closesSchema = mongoose.Schema({
    img:{type: String, required: true},
    name: {type: String, required: true}
})

const closesModel = mongoose.model("closes", closesSchema);
export default closesModel;