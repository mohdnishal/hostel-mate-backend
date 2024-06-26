const express = require('express');
const attdce = require('../models/attendanceSchema');
const Alloted = require('../models/AllotedSchema');
const MessBillSchema = require('../models/MessBillSchema');
const MessBillGen = require('../models/MessBillGen');

const router = express.Router();

router.post('/messbill', async (req, res) => {
  const { date, TotalEstablishmentcharge, TotalFoodCharge, Fine } = req.body;
  const month = date.substring(0, 7);

  try {
      let NoOfAttendanceTaken = await attdce.countTotalAttendanceInMonth(month);
      let NoOfUser = await Alloted.countStudents();
      console.log("NoOfUser=", NoOfUser);
      console.log("attdce taken", NoOfAttendanceTaken);
      let TotalAttendance = NoOfAttendanceTaken * NoOfUser;
      console.log("total", TotalAttendance);
      const TotalExpense = TotalEstablishmentcharge + TotalFoodCharge;
      const students = await Alloted.find();
      let TotalAbsentDays = 0;
      students.forEach(student => {
          let absentDaysInSequence = 0;
          let lastAbsentDate = null;

          for (let day = 1; day <= 30; day++) {
              const currentDate = `${month}-${day.toString().padStart(2, '0')}`;
              console.log(currentDate);
              if (student.absenceStreaks.get(currentDate) > 0) {
                  if (!lastAbsentDate || day - lastAbsentDate === 1) {
                      absentDaysInSequence++;
                  } else {
                      absentDaysInSequence = 1;
                  }
                  lastAbsentDate = day;
                  console.log(lastAbsentDate);
                  console.log("hello", absentDaysInSequence);

                  if (absentDaysInSequence >= 7 && absentDaysInSequence % 7 === 0) {
                      console.log("if");
                      TotalAbsentDays += 7;
                      TotalAttendance -= 7;
                      console.log("if", TotalAttendance);
                  }
              } else {
                  absentDaysInSequence = 0;
                  console.log("else");
              }
          }

          const messCut = (TotalAttendance - student.absentDaysInMonth);
          console.log(`Mess cut for ${student.Name} is ${messCut}`);
      });

      const esscharge = TotalEstablishmentcharge / students.length;
      const RatePerDay = (TotalFoodCharge - Fine) / TotalAttendance;

      const MessBill = new MessBillSchema({
          date,
          NumberofUser: students.length,
          TotalEstablishmentcharge,
          TotalFoodCharge,
          TotalExpense,
          esscharge,
          TotalAttendance,
          RatePerDay,
          Fine,
      });

      await MessBill.save();
      await Promise.all(students.map(student =>{  student.save()}));

      res.status(201).json({ message: 'Mess bill calculated and saved successfully' });
  } catch (error) {
      console.error('Error calculating and saving mess bill:', error);
      res.status(500).json({ error: 'Failed to calculate and save mess bill' });
  }
});

router.get('/latest-messbill', async (req, res) => {
  try {
    const latestMessBill = await MessBillSchema.findOne({}, {}, { sort: { 'date': -1 } });

    if (!latestMessBill) {
      return res.status(404).json({ error: 'Latest mess bill data not found' });
    }

    res.status(200).json({ messBillData: latestMessBill });
  } catch (error) {
    console.error('Error fetching latest mess bill data:', error);
    res.status(500).json({ error: 'Failed to fetch latest mess bill data' });
  }
});

router.post('/update-messbills', async (req, res) => {
  const { messBills } = req.body;

  try {
    await Promise.all(messBills.map(async (bill) => {
      await MessBillGen.updateOne(
        { 'messBills._id': bill._id },
        { $set: { 'messBills.$.Fine': bill.Fine, 'messBills.$.TotalAmount': bill.TotalAmount } }
      );
      await Alloted.findByIdAndUpdate(bill.student, { Fine: bill.Fine });
    }));

    res.status(200).json({ message: 'Mess bills updated successfully' });
  } catch (error) {
    console.error('Error updating mess bills:', error);
    res.status(500).json({ error: 'Failed to update mess bills' });
  }
});

router.post('/messbilll', async (req, res) => {
  const { date, TotalEstablishmentcharge, TotalFoodCharge, Fine } = req.body;
  const TotalExpense = TotalEstablishmentcharge + TotalFoodCharge;
  const month = date.substring(0, 7);

  try {
    let NoOfAttendanceTaken = await attdce.countTotalAttendanceInMonth(month);
    let NoOfUser = await Alloted.countStudents();
    console.log("NoOfUser=", NoOfUser);
    console.log("attdce taken", NoOfAttendanceTaken);
    let TotalAttendance = NoOfAttendanceTaken * NoOfUser;
    console.log("total", TotalAttendance);

    const students = await Alloted.find();
    const messGen = await MessBillSchema.findOne();

    if (messGen && messGen.RatePerDay && messGen.esscharge) {
      let messBills = [];

      for (const student of students) {
        let absentDaysInSequence = 0;
        let lastAbsentDate = null;
        let totalAbsentDays = 0;

        for (let day = 1; day <= 30; day++) {
          const currentDate = `${month}-${day.toString().padStart(2, '0')}`;
          console.log(currentDate);

          if (student.absenceStreaks.get(currentDate) > 0) {
            if (!lastAbsentDate || day - lastAbsentDate === 1) {
              absentDaysInSequence++;
            } else {
              absentDaysInSequence = 1;
            }
            lastAbsentDate = day;
            console.log(lastAbsentDate);
            console.log("hello", absentDaysInSequence);

            if (absentDaysInSequence >= 7 && absentDaysInSequence % 7 === 0) {
              console.log("if");
              totalAbsentDays += 7;
              console.log("if", totalAbsentDays);
            }
          } else {
            absentDaysInSequence = 0;
            console.log("else");
          }
        }

        const messCut = totalAbsentDays;
        const amount = (messGen.RatePerDay * (NoOfAttendanceTaken - messCut)) + messGen.esscharge;
        await Alloted.findByIdAndUpdate(student._id, { TotalAmount: amount + Fine, TotalAttendance: NoOfAttendanceTaken - messCut });
        const messBill = {
          student: student._id,
          date,
          Room_No: student.Room_No,
          Name: student.Name,
          AdmNo: student.AdmNo,
          yearOfStudy: student.yearOfStudy,
          Amount: amount,
          TotalAmount: amount + Fine,
          Fine: Fine,
          TotalAttendance: NoOfAttendanceTaken - messCut,
        };

        messBills.push(messBill);
      }

      const messBillGen = new MessBillGen({
        month: month,
        messBills: messBills,
      });
      await messBillGen.save();

      res.status(201).json({ message: 'Mess bills calculated and saved successfully' });
    } else {
      console.error('RatePerDay or esscharge is missing or invalid');
      res.status(400).json({ error: 'RatePerDay or esscharge is missing or invalid' });
    }
  } catch (error) {
    console.error('Error calculating and saving mess bills:', error);
    res.status(500).json({ error: 'Failed to calculate and save mess bills' });
  }
});

router.get('/messbillgen', async (req, res) => {
  try {
    const latestMessBill = await MessBillGen.findOne({}, {}, { sort: { 'month': -1 } });

    if (!latestMessBill) {
      return res.status(404).json({ error: 'Latest mess bill not found' });
    }

    res.status(200).json({ latestMessBill });
  } catch (error) {
    console.error('Error fetching latest mess bill:', error);
    res.status(500).json({ error: 'Failed to fetch latest mess bill' });
  }
});

module.exports = router;
