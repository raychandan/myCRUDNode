const mongoose = require('mongoose');
const name = 'EmailTemplate';

// create a schema
const schema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        subject: { type: String, required: true },
        content: { type: String },
        type: { type: String, required: true, enum: ['text', 'html'] },
        status: { type: Boolean, required: true },
        app_template: { type: Boolean, required: true }
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
    }
);

const model = mongoose.model(name, schema);
module.exports = {
    name: name,
    model: model,
    schema: schema
};