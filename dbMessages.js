import mongoose from 'mongoose'

const whatsappSchema = mongoose.Schema({
    message : String,
    name : String,
    timestamp : String,
    received : Boolean
})

// messagecontent - collection
export default mongoose.model('messagecontent', whatsappSchema);