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
    }],
    absenceStreaks: {
        type: Map, 
        of: Number, 
        default: {}
    }
});

attendanceSchema.statics.countTotalAttendanceInMonth = async function (month) {
    try {
        // Extract the year and month from the input (e.g., '2024-05' for May 2024)
        const [year, monthNumber] = month.split('-');
        
        // Create a date range for the entire month
        const startDate = new Date(year, monthNumber - 1, 1); // Month is 0-based 
        const endDate = new Date(year, monthNumber, 0); // Last day of the month

        // Count the total number of attendance records within the specified month
        const totalCount = await this.countDocuments({
            date: {
                $gte: startDate.toISOString(), // Greater than or equal to the start of the month
                $lte: endDate.toISOString() // Less than or equal to the end of the month
            }
        });

        return totalCount;
    } catch (error) {
        throw new Error('Error counting total attendance in the month');
    }
};

module.exports = mongoose.model('Attendance', attendanceSchema);
