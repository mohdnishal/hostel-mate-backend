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

//     let totalStudents = 0;
//     attendanceRecords.forEach(record => {
//         totalStudents += record.studentsPresent.length;
//     });

//     return totalStudents;
// };
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

//     let totalAttendanceDays = 0;
//     let uniqueStudentsSet = new Set();

//     attendanceRecords.forEach(record => {
//         totalAttendanceDays++;
//         record.studentsPresent.forEach(studentId => {
//             uniqueStudentsSet.add(studentId.toString());
//         });
//     });
//     const absentStudents = calculateConsecutiveAbsences(attendanceRecords);

//     const totalStudents = uniqueStudentsSet.size;

//     return {
//         totalAttendance: totalAttendance - Object.keys(absentStudents).length, // Adjust total attendance based on consecutive absences
//         totalStudents
//     };
// };
//     const totalStudents = uniqueStudentsSet.size;

//     return {
//         totalAttendanceDays,
//         totalStudents
//     };
// };
const calculateConsecutiveAbsences = (attendanceRecords) => {
    const absentStudents = {};

    attendanceRecords.forEach(record => {
        const { date, studentsPresent } = record;

        studentsPresent.forEach(studentId => {
            if (!absentStudents[studentId]) {
                absentStudents[studentId] = {
                    absentDays: new Set(), // Track the specific absent days
                    consecutiveAbsentDays: 0 // Track consecutive absent days
                };
            }

            if (!studentsPresent.includes(studentId)) {
                // If student is absent, add the date to the absentDays Set
                absentStudents[studentId].absentDays.add(date);
                absentStudents[studentId].consecutiveAbsentDays++;

                // If consecutiveAbsentDays is a multiple of 7, decrease total attendance
                if (absentStudents[studentId].consecutiveAbsentDays % 7 === 0) {
                    totalAttendance--;
                }
            } else {
                // If student is present, reset consecutiveAbsentDays
                absentStudents[studentId].consecutiveAbsentDays = 0;
            }
        });
    });

    return absentStudents;
};

// attendanceSchema.statics.countTotalAttendanceInMonth = async function (month) {
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
//     });

//     // Calculate consecutive absences and adjust total attendance
//     const absentStudents = calculateConsecutiveAbsences(attendanceRecords);

//     return totalAttendance - Object.keys(absentStudents).length; // Adjust total attendance based on consecutive absences
// };




module.exports = mongoose.model('Attendance', attendanceSchema);
