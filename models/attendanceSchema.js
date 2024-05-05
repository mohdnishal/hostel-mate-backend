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
        type: Map, // Use Map to store absence streaks for each student
        of: Number, // Key is student ID, value is absence streak
        default: {}
    }
});

// attendanceSchema.statics.countTotalStudentsInMonth = async function (month) {
//     const [year, monthNumber] = month.split('-');
//     const startDate = new Date(year, monthNumber - 1, 1);
//     const endDate = new Date(year, monthNumber, 0);

//     const attendanceRecords = await this.find({
//         date: {
//             $gte: startDate.toISOString(),
//             $lt: endDate.toISOString()
//         }
//     });
   
//     let totalAttendance = 0;

//     attendanceRecords.forEach(record => {
//         totalAttendance += record.studentsPresent.length;
//         // Update absence streaks
//         record.absenceStreaks.forEach((streak, index) => {
//             if (streak >= 7) {
//                 totalAttendance -= Math.floor(streak / 7); // Subtract multiples of 7 days
//                 record.absenceStreaks[index] = streak % 7; // Update the streak
//             }
//         });
//     });

//     return totalAttendance;
// };
attendanceSchema.statics.countTotalAttendanceInMonth = async function (month) {
    try {
        // Extract the year and month from the input (e.g., '2024-05' for May 2024)
        const [year, monthNumber] = month.split('-');
        
        // Create a date range for the entire month
        const startDate = new Date(year, monthNumber - 1, 1); // Month is 0-based in JavaScript Date object
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
