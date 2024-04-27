const mongoose = require('mongoose');
const { Schema } = mongoose;

const attendanceSchema = new Schema({
    date: { 
        type: String,
        required: true,
        unique: true 
    },
    studentsPresent: [{ 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
    }]
});
attendanceSchema.statics.countTotalStudentsInMonth = async function (month) {
    const [year, monthNumber] = month.split('-');
    const startDate = new Date(year, monthNumber - 1, 1); // Create a start date for the month
    const endDate = new Date(year, monthNumber, 0); // Create an end date for the month

    const attendanceRecords = await this.find({
        date: {
            $gte: startDate.toISOString(),
            $lt: endDate.toISOString()
        }
    });

    let totalStudents = 0;
    attendanceRecords.forEach(record => {
        totalStudents += record.studentsPresent.length;
    });

    return totalStudents;
};


module.exports = mongoose.model('Attendance', attendanceSchema);
