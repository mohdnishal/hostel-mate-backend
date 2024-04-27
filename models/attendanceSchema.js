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
attendanceSchema.statics.countStudentsInMonth = async function (month) {
    const startOfMonth = new Date(month);
    startOfMonth.setUTCDate(1); // Set the date to the first day of the month
    startOfMonth.setUTCHours(0, 0, 0, 0); // Set hours to 00:00:00:000
    const endOfMonth = new Date(startOfMonth);
    endOfMonth.setUTCMonth(endOfMonth.getUTCMonth() + 1); // Move to the next month
    const attendanceRecords = await this.find({
        date: {
            $gte: startOfMonth.toISOString(),
            $lt: endOfMonth.toISOString()
        }
    });
    
    // Extract and count distinct students
    const distinctStudents = new Set();
    attendanceRecords.forEach(record => {
        record.studentsPresent.forEach(studentId => {
            distinctStudents.add(studentId.toString()); // Convert ObjectId to string for uniqueness
        });
    });
    return distinctStudents.size;
};


module.exports = mongoose.model('Attendance', attendanceSchema);
