import { ModuleQuickLinkButtonWrapper } from "@/components/DashboardQuickLinkButtonWrapper"
import { AccountingIcon, AttendanceIcon, ExamIcon, FeesCollectionIcon, NoticeIcon, OnlineAddmissionIcon, ReportIcon, RoutineIcon, SmsIcon, StudentRegIcon, TeacherIcon, TeacherRoutineIcon, WebsiteSettingsIcon } from "@/components/Icon"


const quickLinksColors = [
    { dark: "#006ADC", light: "#E1F0FF" },
    { dark: "#9C2BAD", light: "#F9E5F9" },
    { dark: "#CA3214", light: "#FFE6E2" },
]

const all_users = [
    { color: quickLinksColors[2], linkUrl: "/management/users", icon: <StudentRegIcon style={{ margin: 'auto' }} fillColor={quickLinksColors[1].dark} />, name: "All Users", },
]

const online_addmission = [
    { color: quickLinksColors[0], linkUrl: "/management/students/online-admission", icon: <OnlineAddmissionIcon style={{ margin: 'auto' }} fillColor={quickLinksColors[0].dark} />, name: "Online Admission" },
]

const students = [
    { color: quickLinksColors[1], linkUrl: "/management/students", icon: <StudentRegIcon style={{ margin: 'auto' }} fillColor={quickLinksColors[1].dark} />, name: "Students" },
    { color: quickLinksColors[0], linkUrl: "/management/students", icon: <StudentRegIcon style={{ margin: 'auto' }} fillColor={quickLinksColors[0].dark} />, name: "Multiple " },
    { color: quickLinksColors[2], linkUrl: "/management/classes", icon: <StudentRegIcon style={{ margin: 'auto' }} fillColor={quickLinksColors[2].dark} />, name: "Classes" },
    { color: quickLinksColors[0], linkUrl: "/management/batches", icon: <StudentRegIcon style={{ margin: 'auto' }} fillColor={quickLinksColors[0].dark} />, name: "Batches" },
    { color: quickLinksColors[1], linkUrl: "/management/subjects", icon: <ExamIcon style={{ margin: 'auto' }} fillColor={quickLinksColors[1].dark} />, name: "Subjects" },
    { color: quickLinksColors[2], linkUrl: "/management/rooms", icon: <WebsiteSettingsIcon style={{ margin: 'auto' }} fillColor={quickLinksColors[2].dark} />, name: "rooms" },
    { color: quickLinksColors[0], linkUrl: "/management/homework", icon: <WebsiteSettingsIcon style={{ margin: 'auto' }} fillColor={quickLinksColors[0].dark} />, name: "homework" },

]
const teachers = [
    { color: quickLinksColors[0], linkUrl: "/management/teachers", icon: <TeacherIcon style={{ margin: 'auto' }} fillColor={quickLinksColors[0].dark} />, name: "Manage Teacher" },
    { color: quickLinksColors[1], linkUrl: "/management/department", icon: <TeacherIcon style={{ margin: 'auto' }} fillColor={quickLinksColors[1].dark} />, name: "Deparment" },
    { color: quickLinksColors[2], linkUrl: "/management/teachers/teachers-recruitment", icon: <TeacherIcon style={{ margin: 'auto' }} fillColor={quickLinksColors[2].dark} />, name: "Teacher recruitment" },
]

const other_users = [
    { color: quickLinksColors[2], linkUrl: "/management/users", icon: <StudentRegIcon style={{ margin: 'auto' }} fillColor={quickLinksColors[2].dark} />, name: "Users", },
    { color: quickLinksColors[0], linkUrl: "/management/users/entry_other_users", icon: <StudentRegIcon style={{ margin: 'auto' }} fillColor={quickLinksColors[0].dark} />, name: "Other Users" },
    { color: quickLinksColors[1], linkUrl: "/management/leave", icon: < NoticeIcon style={{ margin: 'auto' }} fillColor={quickLinksColors[0].dark} />, name: "Leave Application" },

]
const attendance = [
    { color: quickLinksColors[1], linkUrl: "/management/attendence/normalAttendence", icon: < AttendanceIcon style={{ margin: 'auto' }} fillColor={quickLinksColors[1].dark} />, name: "Student Attendence" },
    { color: quickLinksColors[2], linkUrl: "/management/attendence/examAttendence", icon: < AttendanceIcon style={{ margin: 'auto' }} fillColor={quickLinksColors[2].dark} />, name: "Exam Attendence" },
    { color: quickLinksColors[0], linkUrl: "/management/attendence/employeeAttendence", icon: < AttendanceIcon style={{ margin: 'auto' }} fillColor={quickLinksColors[0].dark} />, name: "Employee Attendence" },
    { color: quickLinksColors[0], linkUrl: "/management/holidays", icon: < NoticeIcon style={{ margin: 'auto' }} fillColor={quickLinksColors[0].dark} />, name: "Holidays" },
    { color: quickLinksColors[1], linkUrl: "/management/leave", icon: <RoutineIcon style={{ margin: 'auto' }} fillColor={quickLinksColors[1].dark} />, name: "Leave Application" },
]
const accounting = [
    { color: quickLinksColors[0], linkUrl: "/management/fees", icon: <NoticeIcon style={{ margin: 'auto' }} fillColor={quickLinksColors[0].dark} />, name: "Create Fees" },
    { color: quickLinksColors[1], linkUrl: "/management/student_fees_collection", icon: <NoticeIcon style={{ margin: 'auto' }} fillColor={quickLinksColors[1].dark} />, name: "Fees Collect" },
    { color: quickLinksColors[2], linkUrl: "/management/accounting/account", icon: < AccountingIcon style={{ margin: 'auto' }} fillColor={quickLinksColors[2].dark} />, name: "Account" },
]
const notice = [
    { color: quickLinksColors[0], linkUrl: "/front_end/notice", icon: < NoticeIcon style={{ margin: 'auto' }} fillColor={quickLinksColors[0].dark} />, name: "Notice" },
]
const routine = [
    { color: quickLinksColors[1], linkUrl: "/management/routine/class_routine", icon: <RoutineIcon style={{ margin: 'auto' }} fillColor={quickLinksColors[1].dark} />, name: "Class Routine" },
    { color: quickLinksColors[0], linkUrl: "/management/routine/exam_routine", icon: <RoutineIcon style={{ margin: 'auto' }} fillColor={quickLinksColors[0].dark} />, name: "Exam Routine" },
]
const study_materials = [
    { color: quickLinksColors[0], linkUrl: "/management/homework", icon: <WebsiteSettingsIcon style={{ margin: 'auto' }} fillColor={quickLinksColors[0].dark} />, name: "homework" },
]
const card_generate = [
    { color: quickLinksColors[0], linkUrl: "/admit_card", icon: <TeacherRoutineIcon style={{ margin: 'auto' }} fillColor={quickLinksColors[0].dark} />, name: "Admit Card" },
    { color: quickLinksColors[2], linkUrl: "/certificate/certificate_template", icon: <TeacherRoutineIcon style={{ margin: 'auto' }} fillColor={quickLinksColors[2].dark} />, name: "Certificate Templates" },
    { color: quickLinksColors[1], linkUrl: "/certificate/student_certificate", icon: <TeacherRoutineIcon style={{ margin: 'auto' }} fillColor={quickLinksColors[1].dark} />, name: "Student Certificates" },
    { color: quickLinksColors[0], linkUrl: "/certificate/teacher_certificate", icon: <TeacherRoutineIcon style={{ margin: 'auto' }} fillColor={quickLinksColors[0].dark} />, name: "Teacher Certificates" },
    { color: quickLinksColors[2], linkUrl: "/certificate/employee_certificate", icon: <TeacherRoutineIcon style={{ margin: 'auto' }} fillColor={quickLinksColors[2].dark} />, name: "Employee Certificates" },
]

const sms = [
    { color: quickLinksColors[0], linkUrl: "/bulk_sms_and_email/send_sms", icon: <SmsIcon style={{ margin: 'auto' }} fillColor={quickLinksColors[0].dark} />, name: "Send Sms" },
    { color: quickLinksColors[1], linkUrl: "/voice_msg/send_voice_msg", icon: <SmsIcon style={{ margin: 'auto' }} fillColor={quickLinksColors[1].dark} />, name: "Send Voice Sms" },
    { color: quickLinksColors[2], linkUrl: "/settings/sms", icon: <SmsIcon style={{ margin: 'auto' }} fillColor={quickLinksColors[2].dark} />, name: "Sms Setting" },
    { color: quickLinksColors[1], linkUrl: "/settings/student_autometic_sent_sms", icon: <SmsIcon style={{ margin: 'auto' }} fillColor={quickLinksColors[1].dark} />, name: "Auto Attendence Sms Setting" },

]
const website_settings = [
    { color: quickLinksColors[1], linkUrl: "/front_end", icon: <WebsiteSettingsIcon style={{ margin: 'auto' }} fillColor={quickLinksColors[1].dark} />, name: "Website Settings" },
]
const report = [
    { color: quickLinksColors[2], linkUrl: "/reports/attendence/student/normal", icon: <ReportIcon style={{ margin: 'auto' }} fillColor={quickLinksColors[2].dark} />, name: "Student Attend Reports" },
    { color: quickLinksColors[1], linkUrl: "/reports/attendence/student/exam", icon: <ReportIcon style={{ margin: 'auto' }} fillColor={quickLinksColors[1].dark} />, name: "Student Exam Attend Reports" },
    { color: quickLinksColors[0], linkUrl: "/reports/attendence/student/employee", icon: <ReportIcon style={{ margin: 'auto' }} fillColor={quickLinksColors[0].dark} />, name: "Employee Attend Reports" },

    { color: quickLinksColors[1], linkUrl: "/reports/fees/payment_history", icon: <FeesCollectionIcon style={{ margin: 'auto' }} fillColor={quickLinksColors[1].dark} />, name: 'Fees Payment History' },
    { color: quickLinksColors[2], linkUrl: "/reports/fees/recipt_report", icon: <FeesCollectionIcon style={{ margin: 'auto' }} fillColor={quickLinksColors[2].dark} />, name: 'Fees Recipt Report' }

]
const examination = [
    { color: quickLinksColors[0], linkUrl: "/management/exam/exam_terms", icon: <ExamIcon style={{ margin: 'auto' }} fillColor={quickLinksColors[0].dark} />, name: "Exam Terms" },
    { color: quickLinksColors[1], linkUrl: "/management/exam", icon: <ExamIcon style={{ margin: 'auto' }} fillColor={quickLinksColors[1].dark} />, name: "Exams" },
    { color: quickLinksColors[2], linkUrl: "/management/exam/addtional_marks", icon: <ExamIcon style={{ margin: 'auto' }} fillColor={quickLinksColors[2].dark} />, name: "Exams Addtional Marks" },
    { color: quickLinksColors[1], linkUrl: "/management/exam/seat-plan", icon: <ExamIcon style={{ margin: 'auto' }} fillColor={quickLinksColors[1].dark} />, name: "Exams Seat Plan" },
    { color: quickLinksColors[0], linkUrl: "/management/exam/question", icon: <ExamIcon style={{ margin: 'auto' }} fillColor={quickLinksColors[0].dark} />, name: "Exam Questions" },
]
const school_branches = [
    { color: quickLinksColors[0], linkUrl: "/management/school_branches", icon: <ExamIcon style={{ margin: 'auto' }} fillColor={quickLinksColors[0].dark} />, name: "School Branches" },
]
// { color: quickLinksColors[1], linkUrl: "/management/students", icon: <StudentRegIcon style={{ margin: 'auto' }} fillColor={quickLinksColors[1].dark} />, name: "Students" },
// { color: quickLinksColors[2], linkUrl: "/management/teachers", icon: <TeacherIcon style={{ margin: 'auto' }} fillColor={quickLinksColors[2].dark} />, name: "Teachers" },
// { color: quickLinksColors[0], linkUrl: "/management/users/entry_other_users", icon: <StudentRegIcon style={{ margin: 'auto' }} fillColor={quickLinksColors[0].dark} />, name: "Other Users" },
// { color: quickLinksColors[1], linkUrl: "/management/attendence/normalAttendence", icon: < AttendanceIcon style={{ margin: 'auto' }} fillColor={quickLinksColors[1].dark} />, name: "Attendance" },
// { color: quickLinksColors[2], linkUrl: "/management/accounting/account", icon: < AccountingIcon style={{ margin: 'auto' }} fillColor={quickLinksColors[2].dark} />, name: "Accounting" },
// { color: quickLinksColors[0], linkUrl: "/front_end/notice", icon: < NoticeIcon style={{ margin: 'auto' }} fillColor={quickLinksColors[0].dark} />, name: "Notice" },
// { color: quickLinksColors[1], linkUrl: "/management/routine/class_routine", icon: <RoutineIcon style={{ margin: 'auto' }} fillColor={quickLinksColors[1].dark} />, name: "Routine" },
// { color: quickLinksColors[2], linkUrl: "#", icon: <StudyMaterialsIcon style={{ margin: 'auto' }} fillColor={quickLinksColors[2].dark} />, name: "Study Materials" },
// { color: quickLinksColors[0], linkUrl: "/bulk_sms_and_email/send_sms", icon: <SmsIcon style={{ margin: 'auto' }} fillColor={quickLinksColors[0].dark} />, name: "Sms" },


// { color: quickLinksColors[1], linkUrl: "/front_end", icon: <WebsiteSettingsIcon style={{ margin: 'auto' }} fillColor={quickLinksColors[1].dark} />, name: "Website Settings" },
// { color: quickLinksColors[2], linkUrl: "/reports/attendence/student/normal", icon: <ReportIcon style={{ margin: 'auto' }} fillColor={quickLinksColors[2].dark} />, name: "Reports" },
// { color: quickLinksColors[0], linkUrl: "/reports/exam/report_card", icon: <ExamIcon style={{ margin: 'auto' }} fillColor={quickLinksColors[0].dark} />, name: "Examinations" },


// { color: quickLinksColors[2], linkUrl: "#", icon: <TeacherRoutineIcon style={{ margin: 'auto' }} fillColor={quickLinksColors[2].dark} />, name: "Teacher Routine" },
// { color: quickLinksColors[0], linkUrl: "/management/exam", icon: <ExamIcon style={{ margin: 'auto' }} fillColor={quickLinksColors[0].dark} />, name: "Exam" },
// { color: quickLinksColors[2], linkUrl: "/management/student_fees_collection", icon: < FeesCollectionIcon style={{ margin: 'auto' }} fillColor={quickLinksColors[2].dark} />, name: 'Fees Colelction' }



export default {
    all_users, online_addmission, students, teachers,
    other_users, attendance, accounting, notice, routine, sms, card_generate,
    study_materials, website_settings, report, examination, school_branches
}