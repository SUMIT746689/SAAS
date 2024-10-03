import type { ReactNode } from 'react';
import AssignmentIndTwoToneIcon from '@mui/icons-material/AssignmentIndTwoTone';
import AccountTreeTwoToneIcon from '@mui/icons-material/AccountTreeTwoTone';
import AccessibilityIcon from '@mui/icons-material/Accessibility';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import SchoolIcon from '@mui/icons-material/School';
import AllInboxIcon from '@mui/icons-material/AllInbox';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import SettingsInputCompositeIcon from '@mui/icons-material/SettingsInputComposite';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ArticleIcon from '@mui/icons-material/Article';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import RoomPreferencesIcon from '@mui/icons-material/RoomPreferences';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import HolidayVillageIcon from '@mui/icons-material/HolidayVillage';
import ViewCarouselIcon from '@mui/icons-material/ViewCarousel';
import GridOnIcon from '@mui/icons-material/GridOn';
import ClassIcon from '@mui/icons-material/Class';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AutoAwesomeMotionIcon from '@mui/icons-material/AutoAwesomeMotion';
import HouseSidingIcon from '@mui/icons-material/HouseSiding';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PaidIcon from '@mui/icons-material/Paid';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import CameraFrontIcon from '@mui/icons-material/CameraFront';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import GroupsIcon from '@mui/icons-material/Groups';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import SendIcon from '@mui/icons-material/Send';
import LocalPrintshopIcon from '@mui/icons-material/LocalPrintshop';
import TextsmsIcon from '@mui/icons-material/Textsms';
import DraftsIcon from '@mui/icons-material/Drafts';
import SummarizeIcon from '@mui/icons-material/Summarize';
import DesignServicesIcon from '@mui/icons-material/DesignServices';
import AssessmentIcon from '@mui/icons-material/Assessment';
import GroupIcon from '@mui/icons-material/Group';
import HistoryIcon from '@mui/icons-material/History';
import DescriptionIcon from '@mui/icons-material/Description';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AttachMoneySharpIcon from '@mui/icons-material/AttachMoneySharp';
import MoneyOffCsredSharpIcon from '@mui/icons-material/MoneyOffCsredSharp';
import JoinFullSharpIcon from '@mui/icons-material/JoinFullSharp';
import AccountBalanceWalletSharpIcon from '@mui/icons-material/AccountBalanceWalletSharp';
import BorderBottomSharpIcon from '@mui/icons-material/BorderBottomSharp';
import GradeIcon from '@mui/icons-material/Grade';
import WifiTetheringErrorIcon from '@mui/icons-material/WifiTetheringError';
import NotesIcon from '@mui/icons-material/Notes';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import PostAddIcon from '@mui/icons-material/PostAdd';
import SettingsVoiceIcon from '@mui/icons-material/SettingsVoice';
import FenceIcon from '@mui/icons-material/Fence';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';

export interface MenuItem {
  link?: string;
  icon?: ReactNode;
  badge?: string;
  badgeTooltip?: string;

  items?: MenuItem[];
  name: string;
  value?: string;
}

export interface MenuItems {
  items: MenuItem[];
  // heading: string;
}

const module_dashboard: MenuItem = {
  name: 'Module Dashboard',
  icon: DashboardIcon,
  link: '/dashboards/modules/admin'
};

const all_users: MenuItems[] = [
  {
    items: [
      {
        name: 'Users',
        icon: AssignmentIndTwoToneIcon,
        link: '/management/users'
      },
      {
        name: 'Branch Admins',
        icon: AssignmentIndTwoToneIcon,
        link: '/management/users/branch_admins'
      }
    ]
  }
];

const online_addmission: MenuItems[] = [
  {
    items: [
      {
        name: 'Online admission',
        link: '/management/students/online-admission',
        icon: RecordVoiceOverIcon
      }
    ]
  }
];

const students: MenuItems[] = [
  {
    items: [
      {
        name: ' Classes',
        icon: ClassIcon,
        link: '/management/classes'
      },
      {
        name: 'Batches',
        link: '/management/batches',
        icon: AllInboxIcon
      },
      {
        name: 'Student Batches',
        link: '/management/student_batches',
        icon: AllInboxIcon
      },
      {
        name: ' Subjects',
        link: '/management/subjects',
        icon: MenuBookIcon
      },
      {
        name: 'Student Class Subjects',
        link: '/management/student_class_subjects',
        icon: MenuBookIcon
      },
      {
        name: ' Group',
        link: '/management/group',
        icon: GroupsIcon
      },
      {
        name: 'Addtional Marking Categories',
        link: '/management/addtional_marking_categories',
        icon: PostAddIcon
      },
      {
        name: 'Academic Years',
        link: '/management/academic_years',
        icon: CalendarMonthIcon
      },
      {
        name: 'Grading system',
        link: '/management/grade',
        icon: GradeIcon
      },
      {
        name: 'Registration Student',
        link: '/management/students/registration',
        icon: RecordVoiceOverIcon
      },
      {
        name: 'Add Student',
        link: '/management/students',
        icon: RecordVoiceOverIcon
      },
      {
        name: 'Multiple Updates',
        link: '/management/students/multiple_students_update',
        icon: RecordVoiceOverIcon
      },
      {
        name: 'Multiple Image Updates',
        link: '/multiple_student_photo_upload',
        icon: RecordVoiceOverIcon
      },
      {
        name: 'Separate Students',
        link: '/management/students/separated_students',
        icon: RecordVoiceOverIcon
      },
      {
        name: 'Separate Students List',
        link: '/management/students/separated_students/list',
        icon: RecordVoiceOverIcon
      },
      {
        name: 'Rooms',
        link: '/management/rooms',
        icon: RoomPreferencesIcon
      },
      {
        name: 'Period',
        icon: AccessTimeIcon,
        link: '/management/period'
      },
      {
        name: 'Holidays',
        link: '/management/holidays',
        icon: HolidayVillageIcon
      },
      // {
      //   name: 'Daily Notes',
      //   icon: NotesIcon,
      //   items: [
      //     {
      //       name: 'Entry Notes',
      //       link: '/daily_notes/entry_notes',
      //       icon: NoteAddIcon
      //     },
      //     {
      //       name: 'Show Notes',
      //       link: '/daily_notes/show_notes',
      //       icon: FormatListBulletedIcon
      //     }
      //   ]
      // },
      {
        name: 'Certificate',
        icon: WorkspacePremiumIcon,
        items: [
          {
            name: 'Certificate Template',
            link: '/certificate/certificate_template',
            icon: DesignServicesIcon
          },
          {
            name: 'Student Certificate',
            link: '/certificate/student_certificate',
            icon: LocalPrintshopIcon
          },
          {
            name: 'Teacher Certificate',
            link: '/certificate/teacher_certificate',
            icon: LocalPrintshopIcon
          },
          {
            name: 'Employee Certificate',
            link: '/certificate/employee_certificate',
            icon: LocalPrintshopIcon
          }
        ]
      }
    ]
  }
];

const teachers: MenuItems[] = [
  {
    items: [
      {
        name: 'Teachers',
        icon: AccountBalanceIcon,
        items: [
          {
            name: 'Manage Teacher',
            link: '/management/teachers',
            icon: RecordVoiceOverIcon
          },
          {
            name: 'Subject Wise Teacher Fees',
            icon: GridOnIcon,
            link: '/management/teacher_fees'
          },
          {
            name: ' Department',
            icon: GridOnIcon,
            link: '/management/department'
          },
          {
            name: 'Teachers recruitment',
            link: '/management/teachers/teachers-recruitment',
            icon: RecordVoiceOverIcon
          },
          {
            name: 'Teacher Exam Routine',
            link: '/management/teacher_exam_routine',
            icon: SummarizeIcon
          }
        ]
      }
    ]
  }
];

const staffs: MenuItems[] = [
  {
    items: [
      {
        name: 'Users',
        icon: AssignmentIndTwoToneIcon,
        link: '/management/users'
      },
      {
        name: 'Staffs',
        icon: AssignmentIndTwoToneIcon,
        link: '/management/users/entry_other_users'
      },
      {
        name: 'Leave Application',
        icon: WifiTetheringErrorIcon,
        link: '/management/leave'
      }
    ]
  }
];

const attendance: MenuItems[] = [
  {
    items: [
      {
        name: 'Holidays',
        link: '/management/holidays',
        icon: HolidayVillageIcon
      },
      {
        name: 'Leave Application',
        icon: WifiTetheringErrorIcon,
        link: '/management/leave'
      },

      {
        name: 'Students Attendence',
        link: '/management/attendence/normalAttendence',
        icon: AccessibilityIcon
      },
      {
        name: 'Exam Attendence',
        link: '/management/attendence/examAttendence',
        icon: ArticleIcon
      },
      {
        name: 'Employee Attendence',
        link: '/management/attendence/employeeAttendence',
        icon: GroupIcon
      },
      {
        name: 'Student Exam Attendence',
        value: 'show_student_exam_attendence',
        link: '/management/attendence/show_student_attendence',
        icon: GroupIcon
      },
      {
        name: 'Reports',
        icon: AssessmentIcon,
        items: [
          {
            name: 'Students',
            link: '/reports/attendence/student/normal',
            icon: AccessibilityIcon
          },
          {
            name: 'Exam',
            link: '/reports/attendence/student/exam',
            icon: ArticleIcon
          },
          {
            name: 'Employee',
            link: '/reports/attendence/employee',
            icon: GroupIcon
          }
        ]
      }
    ]
  }
];

const accounting: MenuItems[] = [
  {
    items: [
      {
        name: 'Discount',
        link: '/management/discount',
        icon: AccessibilityIcon
      },
      {
        name: 'Fees',
        icon: AccountBalanceIcon,
        items: [
          {
            name: 'Fees Head',
            link: '/management/fees_heads',
            icon: PaidIcon
          },
          {
            name: 'Fees',
            link: '/management/fees',
            icon: PaidIcon
          },
          {
            name: 'Payment',
            link: '/management/fees/student_payment',
            icon: PaidIcon
          },
          {
            name: 'Payment History',
            icon: AccountTreeTwoToneIcon,
            link: '/management/fees/student_payment_history'
          },
          {
            name: 'Collect Fee',
            icon: AccountTreeTwoToneIcon,
            link: '/management/student_fees_collection'
          }
        ]
      },
      {
        name: 'Office Accounting',
        icon: AccountBalanceIcon,
        items: [
          {
            name: 'Account',
            link: '/management/accounting/account',
            icon: PaidIcon
          },
          {
            name: 'Voucher Head',
            link: '/management/accounting/voucher_head',
            icon: PaidIcon
          },

          {
            name: 'New Deposit',
            link: '/management/accounting/voucher_deposit',
            icon: PaidIcon
          },
          {
            name: 'New Expense',
            link: '/management/accounting/voucher_expense',
            icon: PaidIcon
          },
          {
            name: 'All transactions',
            link: '/management/accounting/all_transactions',
            icon: PaidIcon
          },
          {
            name: 'Profit and loss',
            link: '/management/accounting/profit_and_loss',
            icon: PaidIcon
          }
        ]
      },
      {
        name: 'Reports',
        icon: AssessmentIcon,
        items: [
          // {
          //   name: 'Payment history',
          //   link: '/reports/fees/payment_history',
          //   icon: HistoryIcon
          // },
          {
            name: 'Recipt report',
            link: '/reports/fees/recipt_report',
            icon: HistoryIcon
          },
          {
            name: 'Income',
            link: '/reports/income_report',
            icon: HistoryIcon
          },
          {
            name: 'Expense',
            link: '/reports/expense_report',
            icon: HistoryIcon
          },
          {
            name: 'Student Collections',
            link: '/reports/student_collection_report',
            icon: HistoryIcon
          },
          {
            name: 'Head Wise Collection',
            link: '/reports/head_wise_collection_report',
            icon: HistoryIcon
          },
          {
            name: 'Head Wise Due',
            link: '/reports/head_wise_due_report',
            icon: HistoryIcon
          },
          {
            name: 'Student Due',
            link: '/reports/student_due_report',
            icon: HistoryIcon
          },
          {
            name: 'Class Wise Income',
            link: '/reports/class_wise_income',
            icon: HistoryIcon
          },
          {
            name: 'Income Summary',
            link: '/reports/income_summary',
            icon: HistoryIcon
          },
          {
            name: 'Expense Summary',
            link: '/reports/expense_summary',
            icon: HistoryIcon
          },
          {
            name: 'Teacher Salary',
            link: '/reports/teacher_salary_report',
            icon: HistoryIcon
          }
        ]
      },
      {
        name: 'Pending Buy Sms',
        icon: ShoppingBagIcon,
        link: '/pending_sms_requests'
      }
    ]
  }
];

const notice: MenuItems[] = [
  {
    items: [
      {
        name: 'Notice',
        icon: WifiTetheringErrorIcon,
        link: '/front_end/notice'
      }
    ]
  }
];

const routine: MenuItems[] = [
  {
    items: [
      {
        name: 'Class Routine',
        link: '/management/routine/class_routine',
        icon: AccessibilityIcon
      },
      {
        name: 'Exam Routine',
        link: '/management/routine/exam_routine',
        icon: AccessibilityIcon
      }
    ]
  }
];

const sms: MenuItems[] = [
  {
    items: [
      {
        name: 'Pending Buy Sms',
        icon: ShoppingBagIcon,
        link: '/pending_sms_requests'
      },
      {
        name: 'Send Sms / Email',
        icon: NotificationsActiveIcon,
        items: [
          {
            name: 'Send SMS ',
            link: '/bulk_sms_and_email/send_sms',
            icon: SendIcon
          },
          {
            name: 'Send EMAIL',
            link: '/bulk_sms_and_email/send_email',
            icon: SendIcon
          },
          {
            name: 'SMS / EMAIL Report',
            link: '/bulk_sms_and_email/sent_sms_or_email_report',
            icon: LocalPrintshopIcon
          },
          {
            name: 'SMS Template',
            link: '/bulk_sms_and_email/sms_template',
            icon: TextsmsIcon
          },
          {
            name: 'EMAIL Template',
            link: '/bulk_sms_and_email/email_template',
            icon: DraftsIcon
          }
        ]
      },
      {
        name: 'Voice Msg',
        icon: SettingsVoiceIcon,
        items: [
          {
            name: 'Send Voice',
            link: '/voice_msg/send_voice_msg',
            icon: RecordVoiceOverIcon
          },
          {
            name: 'Gateway',
            link: '/voice_msg/gateways',
            icon: FenceIcon
          },
          {
            name: 'Template',
            link: '/voice_msg/templates',
            icon: ContentPasteIcon
          }
        ]
      },
      {
        name: 'System',
        icon: SettingsSuggestIcon,
        items: [
          {
            name: 'Package Request',
            link: '/settings/package_request',
            icon: RequestQuoteIcon
          },
          {
            name: 'Sms Request',
            link: '/settings/sms_request',
            icon: RequestQuoteIcon
          },
          {
            name: 'Payment Gateway',
            link: '/settings/payment-gateway-credential-configuration',
            icon: RequestQuoteIcon
          },
          {
            name: 'SMS',
            link: '/settings/sms',
            icon: RequestQuoteIcon
          },
          {
            name: 'Fees Collection SMS',
            link: '/settings/fees_collection_sms',
            icon: RequestQuoteIcon
          },
          {
            name: 'Student Auto Sent Sms',
            link: '/settings/student_autometic_sent_sms',
            icon: RequestQuoteIcon
          }
        ]
      }
    ]
  }
];

const study_materials: MenuItems[] = [
  {
    items: [
      {
        name: 'Home work',
        link: '/management/homework',
        icon: SummarizeIcon
      }
    ]
  }
];

const card_generate: MenuItems[] = [
  {

    items: [
      {
        name: 'Student Id Card',
        link: '/management/students',
        icon: SummarizeIcon
      },
      {
        name: 'Admit Card',
        link: '/admit_card',
        icon: DesignServicesIcon
      },
      {
        name: 'Certificate',
        icon: WorkspacePremiumIcon,
        items: [
          {
            name: 'Certificate Template',
            link: '/certificate/certificate_template',
            icon: DesignServicesIcon
          },
          {
            name: 'Student Certificate',
            link: '/certificate/student_certificate',
            icon: LocalPrintshopIcon
          },
          {
            name: 'Teacher Certificate',
            link: '/certificate/teacher_certificate',
            icon: LocalPrintshopIcon
          },
          {
            name: 'Employee Certificate',
            link: '/certificate/employee_certificate',
            icon: LocalPrintshopIcon
          }
        ]
      }
    ]
  }
];


const website_settings: MenuItems[] = [
  {
    items: [
      {
        name: 'Front End',
        icon: CameraFrontIcon,
        link: '/front_end'
      },
      {
        name: 'Gallery',
        icon: CameraFrontIcon,
        link: '/front_end/galleries'
      },
      {
        name: 'Menu',
        icon: CameraFrontIcon,
        link: '/front_end/menus'
      },
      {
        name: 'Pages',
        icon: CameraFrontIcon,
        link: '/front_end/website_dynamic_pages'
      },
      {
        name: 'Video Gallary',
        icon: CameraFrontIcon,
        link: '/front_end/video_gallary'
      }
    ]
  }
];

const report: MenuItems[] = [
  {
    items: [
      {
        name: 'Attendence',
        icon: CheckCircleOutlineIcon,
        items: [
          {
            name: 'Students',
            link: '/reports/attendence/student/normal',
            icon: AccessibilityIcon
          },
          {
            name: 'Exam',
            link: '/reports/attendence/student/exam',
            icon: ArticleIcon
          },
          {
            name: 'Employee',
            link: '/reports/attendence/employee',
            icon: GroupIcon
          }
        ]
      },
      {
        name: 'Fees',
        icon: PaidIcon,
        items: [
          // {
          //   name: 'Payment history',
          //   link: '/reports/fees/payment_history',
          //   icon: HistoryIcon
          // },
          {
            name: 'Recipt report',
            link: '/reports/fees/recipt_report',
            icon: HistoryIcon
          }
        ]
      },
      {
        name: 'Exam',
        icon: ArticleIcon,
        items: [
          {
            name: 'Report card',
            link: '/reports/exam/report_card',
            icon: DescriptionIcon
          },
          {
            name: 'Tabulation sheet',
            link: '/reports/exam/tabulation_sheet',
            icon: DescriptionIcon
          },
          {
            name: 'Merit List',
            link: '/reports/exam/merit_list',
            icon: DescriptionIcon
          },
          {
            name: 'Progress Report',
            link: '/reports/exam/progress_report',
            icon: DescriptionIcon
          },
          {
            name: 'Result sheet',
            link: '/reports/exam/result_sheet',
            icon: DescriptionIcon
          }
        ]
      }
    ]
  }
];

const examination: MenuItems[] = [
  {
    items: [
      {
        name: 'Exam',
        icon: AssignmentIcon,
        items: [
          {
            name: 'Manage Exam Term',
            link: '/management/exam/exam_terms',
            icon: AssignmentIcon
          },
          {
            name: 'Manage Exam',
            link: '/management/exam',
            icon: AssignmentIcon
          },
          {
            name: 'Addtional Marks',
            link: '/management/exam/addtional_marks',
            icon: AssignmentIcon
          },
          {
            name: 'Exam seat plan',
            link: '/management/exam/seat-plan',
            icon: AssignmentIcon
          },
          {
            name: 'Exam Question',
            link: '/management/exam/question',
            icon: AssignmentIcon
          }
        ]
      },{
        name: 'Admit Card',
        link: '/admit_card',
        icon: DesignServicesIcon
      },
      {
        name: 'Grading system',
        link: '/management/grade',
        icon: GradeIcon
      }, {
        name: 'Exam Routine',
        link: '/management/routine/exam_routine',
        icon: AccessibilityIcon
      },
      {
        name: 'Report card',
        link: '/reports/exam/report_card',
        icon: DescriptionIcon
      },
      {
        name: 'Tabulation sheet',
        link: '/reports/exam/tabulation_sheet',
        icon: DescriptionIcon
      },
      {
        name: 'Merit List',
        link: '/reports/exam/merit_list',
        icon: DescriptionIcon
      },
      {
        name: 'Progress Report',
        link: '/reports/exam/progress_report',
        icon: DescriptionIcon
      },
      {
        name: 'Result sheet',
        link: '/reports/exam/result_sheet',
        icon: DescriptionIcon
      },
      {
        name: 'Result',
        icon: AssignmentTurnedInIcon,
        items: [
          {
            name: 'Section Wise Result',
            link: '/management/result',
            icon: AssignmentIcon
          },
          {
            name: 'Exam Addtional Marks',
            link: '/management/result/addtional_result',
            icon: AutoAwesomeMotionIcon
          },
          {
            name: 'Student Wise Result',
            link: '/management/result/single',
            icon: AutoAwesomeMotionIcon
          },
          {
            name: 'Student Result',
            link: '/management/result/student_result',
            icon: AutoAwesomeMotionIcon
          }
        ]
      },
      {
        name: 'Reports',
        icon: AssessmentIcon,
        items: [
          {
            name: 'Report card',
            link: '/reports/exam/report_card',
            icon: DescriptionIcon
          },
          {
            name: 'Tabulation sheet',
            link: '/reports/exam/tabulation_sheet',
            icon: DescriptionIcon
          },
          {
            name: 'Merit List',
            link: '/reports/exam/merit_list',
            icon: DescriptionIcon
          },
          {
            name: 'Progress Report',
            link: '/reports/exam/progress_report',
            icon: DescriptionIcon
          },
          {
            name: 'Result sheet',
            link: '/reports/exam/result_sheet',
            icon: DescriptionIcon
          }
        ]
      }
      // {
      //   name: 'Result sheet',
      //   link: '/reports/exam/result_sheet',
      //   icon: DescriptionIcon
      // },
    ]
  }
];

export default {
  all_users,
  online_addmission,
  students,
  teachers,
  staffs,
  attendance,
  accounting,
  notice,
  routine,
  sms,
  study_materials,
  card_generate,
  website_settings,
  report,
  examination,
  module_dashboard
};
// export default adminItems
