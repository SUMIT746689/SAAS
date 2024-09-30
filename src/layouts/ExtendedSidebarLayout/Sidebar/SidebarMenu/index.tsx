import { useEffect, useContext } from 'react';

import { ListSubheader, alpha, Box, List, styled, Grid } from '@mui/material';
import SidebarMenuItem from './item';
import menuItems, { MenuItem } from './items';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';
import { AuthConsumer, AuthProvider } from '@/contexts/JWTAuthContext';
import { permissionVerify } from '@/utils/permissionVerify';
import adminItems from './items/admin';
import teacherItems from './items/teacher';
import studentItems from './items/student';
import allUserMenuItems, { dashboardMenuItem } from './items/items';
import { ModuleContext } from '@/contexts/ModuleContext';

const MenuWrapper = styled(Box)(
  ({ theme }) => `
  .MuiList-root {
    padding: ${theme.spacing(1)};

    & > .MuiList-root {
      padding: 0 ${theme.spacing(0)} ${theme.spacing(1)};
    }
  }

    .MuiListSubheader-root {
      text-transform: uppercase;
      font-weight: bold;
      font-size: ${theme.typography.pxToRem(12)};
      color: ${theme.colors.alpha.trueWhite[50]};
      padding: ${theme.spacing(0, 2.5)};
      line-height: 1.4;
    }
`
);

const SubMenuWrapper = styled(Box)(
  ({ theme }) => `
    .MuiList-root {

      .MuiListItem-root {
        padding: 1px 0;

        .MuiBadge-root {
          position: absolute;
          right: ${theme.spacing(3.2)};

          .MuiBadge-standard {
            background: ${theme.colors.primary.main};
            font-size: ${theme.typography.pxToRem(10)};
            font-weight: bold;
            text-transform: uppercase;
            color: ${theme.palette.primary.contrastText};
          }
        }
    
        .MuiButton-root {
          display: flex;
          color: ${theme.colors.alpha.trueWhite[70]};
          background-color: transparent;
          width: 100%;
          justify-content: flex-start;
          padding: ${theme.spacing(1.2, 3)};

          .MuiButton-startIcon,
          .MuiButton-endIcon {
            transition: ${theme.transitions.create(['color'])};

            .MuiSvgIcon-root {
              font-size: inherit;
              transition: none;
            }
          }

          .MuiButton-startIcon {
            color: ${theme.colors.alpha.trueWhite[30]};
            font-size: ${theme.typography.pxToRem(20)};
            margin-right: ${theme.spacing(1)};
          }
          
          .MuiButton-endIcon {
            color: ${theme.colors.alpha.trueWhite[50]};
            margin-left: auto;
            opacity: .8;
            font-size: ${theme.typography.pxToRem(20)};
          }

          &.Mui-active,
          &:hover {
            background-color: ${alpha(theme.colors.alpha.trueWhite[100], 0.06)};
            color: ${theme.colors.alpha.trueWhite[100]};

            .MuiButton-startIcon,
            .MuiButton-endIcon {
              color: ${theme.colors.alpha.trueWhite[100]};
            }
          }
        }

        &.Mui-children {
          flex-direction: column;

          .MuiBadge-root {
            position: absolute;
            right: ${theme.spacing(7)};
          }
        }

        .MuiCollapse-root {
          width: 100%;

          .MuiList-root {
            padding: ${theme.spacing(1, 0)};
          }

          .MuiListItem-root {
            padding: 1px 0;

            .MuiButton-root {
              padding: ${theme.spacing(0.8, 3)};

              .MuiBadge-root {
                right: ${theme.spacing(3.2)};
              }

              &:before {
                content: ' ';
                background: ${theme.colors.alpha.trueWhite[100]};
                opacity: 0;
                transition: ${theme.transitions.create(['transform', 'opacity'])};
                width: 6px;
                height: 6px;
                transform: scale(0);
                transform-origin: center;
                border-radius: 20px;
                margin-right: ${theme.spacing(1.8)};
              }

              &.Mui-active,
              &:hover {

                &:before {
                  transform: scale(1);
                  opacity: 1;
                }
              }
            }
          }
        }
      }
    }
`
);

const renderSidebarMenuItems = ({ permissions = [], items, path }: { permissions: any; items: MenuItem[]; path: string }): JSX.Element => (
  <SubMenuWrapper>
    <List component="div">{items?.reduce((ev, item) => reduceChildRoutes({ permissions, ev, item, path }), [])}</List>
  </SubMenuWrapper>
);

const reduceChildRoutes = ({
  permissions,
  ev,
  path,
  item
}: {
  permissions: any;
  ev: JSX.Element[];
  path: string;
  item: MenuItem;
}): Array<JSX.Element> => {
  const key = item.name;
  const partialMatch = path.includes(item.link);
  const exactMatch = path === item.link;
  // console.log({permissions});

  const sub_menu = () => {
    ev.push(
      <SidebarMenuItem
        key={key}
        active={exactMatch}
        name={item.name}
        link={item.link}
        badge={item.badge}
        badgeTooltip={item.badgeTooltip}
        icon={item.icon}
      />
    );
  };
  if (item.items) {
    if (item.name === 'Academic') {
      if (permissions.findIndex((i) => i.group == 'academic') > -1)
        ev.push(
          <SidebarMenuItem
            key={key}
            active={partialMatch}
            open={partialMatch}
            name={item.name}
            icon={item.icon}
            link={item.link}
            badge={item.badge}
            badgeTooltip={item.badgeTooltip}
          >
            {/* @ts-ignore */}
            {renderSidebarMenuItems({
              permissions,
              path,
              items: item.items
            })}
          </SidebarMenuItem>
        );
    } else if (item.name === 'Administrator') {
      if (permissions.findIndex((i) => i.group == 'administrator') > -1)
        ev.push(
          <SidebarMenuItem
            key={key}
            active={partialMatch}
            open={partialMatch}
            name={item.name}
            icon={item.icon}
            link={item.link}
            badge={item.badge}
            badgeTooltip={item.badgeTooltip}
          >
            {/* @ts-ignore */}
            {renderSidebarMenuItems({
              permissions,
              path,
              items: item.items
            })}
          </SidebarMenuItem>
        );
    } else if (item.name === 'Exam') {
      if (permissions.findIndex((i) => i.group == 'exam') > -1)
        ev.push(
          <SidebarMenuItem
            key={key}
            active={partialMatch}
            open={partialMatch}
            name={item.name}
            icon={item.icon}
            link={item.link}
            badge={item.badge}
            badgeTooltip={item.badgeTooltip}
          >
            {/* @ts-ignore */}
            {renderSidebarMenuItems({
              permissions,
              path,
              items: item.items
            })}
          </SidebarMenuItem>
        );
    } else if (item.name === 'Teachers') {
      if (permissions.findIndex((i) => i.group == 'teacher') > -1)
        ev.push(
          <SidebarMenuItem
            key={key}
            active={partialMatch}
            open={partialMatch}
            name={item.name}
            icon={item.icon}
            link={item.link}
            badge={item.badge}
            badgeTooltip={item.badgeTooltip}
          >
            {/* @ts-ignore */}
            {renderSidebarMenuItems({
              permissions,
              path,
              items: item.items
            })}
          </SidebarMenuItem>
        );
    } else if (item.name === 'Office Accounting') {
      if (permissions.findIndex((i) => i.group == 'accounts') > -1)
        ev.push(
          <SidebarMenuItem
            key={key}
            active={partialMatch}
            open={partialMatch}
            name={item.name}
            icon={item.icon}
            link={item.link}
            badge={item.badge}
            badgeTooltip={item.badgeTooltip}
          >
            {/* @ts-ignore */}
            {renderSidebarMenuItems({
              permissions,
              path,
              items: item.items
            })}
          </SidebarMenuItem>
        );
    } else if (item.name === 'Attendence') {
      if (permissions.findIndex((i) => i.group == 'attendence') > -1 || permissionVerify(permissions, ['show_student_exam_attendence']))
        ev.push(
          <SidebarMenuItem
            key={key}
            active={partialMatch}
            open={partialMatch}
            name={item.name}
            icon={item.icon}
            link={item.link}
            badge={item.badge}
            badgeTooltip={item.badgeTooltip}
          >
            {/* @ts-ignore */}
            {renderSidebarMenuItems({
              permissions,
              path,
              items: item.items
            })}
          </SidebarMenuItem>
        );
    } else if (item.name === 'Certificate') {
      if (
        permissionVerify(permissions, [
          'create_certificate_template',
          'show_student_certificate',
          'show_teacher_certificate',
          'show_employee_certificate'
        ])
      )
        ev.push(
          <SidebarMenuItem
            key={key}
            active={partialMatch}
            open={partialMatch}
            name={item.name}
            icon={item.icon}
            link={item.link}
            badge={item.badge}
            badgeTooltip={item.badgeTooltip}
          >
            {/* @ts-ignore */}
            {renderSidebarMenuItems({
              permissions,
              path,
              items: item.items
            })}
          </SidebarMenuItem>
        );
    } else if (item.name === 'Send Sms / Email') {
      if (permissions.findIndex((i) => i.group === 'bulk_sms_&_email') > -1)
        ev.push(
          <SidebarMenuItem
            key={key}
            active={partialMatch}
            open={partialMatch}
            name={item.name}
            icon={item.icon}
            link={item.link}
            badge={item.badge}
            badgeTooltip={item.badgeTooltip}
          >
            {/* @ts-ignore */}
            {renderSidebarMenuItems({
              permissions,
              path,
              items: item.items
            })}
          </SidebarMenuItem>
        );
    } else if (item.name === 'Result') {
      if (permissionVerify(permissions, ['create_result', 'show_section_wise_result', 'show_student_wise_result', 'show_student_result']))
        ev.push(
          <SidebarMenuItem
            key={key}
            active={partialMatch}
            open={partialMatch}
            name={item.name}
            icon={item.icon}
            link={item.link}
            badge={item.badge}
            badgeTooltip={item.badgeTooltip}
          >
            {/* @ts-ignore */}
            {renderSidebarMenuItems({
              permissions,
              path,
              items: item.items
            })}
          </SidebarMenuItem>
        );
    } else if (item.name === 'Reports') {
      if (permissions.findIndex((i) => i.group == 'report') > -1)
        ev.push(
          <SidebarMenuItem
            key={key}
            active={partialMatch}
            open={partialMatch}
            name={item.name}
            icon={item.icon}
            link={item.link}
            badge={item.badge}
            badgeTooltip={item.badgeTooltip}
          >
            {/* @ts-ignore */}
            {renderSidebarMenuItems({
              permissions,
              path,
              items: item.items
            })}
          </SidebarMenuItem>
        );
    } else if (item.name === 'System') {
      if (
        permissionVerify(permissions, [
          'package_request',
          'add_payment_gateway_credentials',
          'create_sms_gateway',
          'request_buy_sms',
          'modify_student_auto_sent_sms'
        ])
      )
        ev.push(
          <SidebarMenuItem
            key={key}
            active={partialMatch}
            open={partialMatch}
            name={item.name}
            icon={item.icon}
            link={item.link}
            badge={item.badge}
            badgeTooltip={item.badgeTooltip}
          >
            {/* @ts-ignore */}
            {renderSidebarMenuItems({
              permissions,
              path,
              items: item.items
            })}
          </SidebarMenuItem>
        );
    } else if (item.name === 'Students') {
      if (permissions.findIndex((i) => i.group == 'student') > -1)
        ev.push(
          <SidebarMenuItem
            key={key}
            active={partialMatch}
            open={partialMatch}
            name={item.name}
            icon={item.icon}
            link={item.link}
            badge={item.badge}
            badgeTooltip={item.badgeTooltip}
          >
            {/* @ts-ignore */}
            {renderSidebarMenuItems({
              permissions,
              path,
              items: item.items
            })}
          </SidebarMenuItem>
        );
    } else if (item.name === 'Fees') {
      if (permissionVerify(permissions, ['create_fee', 'show_fee', 'collect_fee', 'student_fee_payment', 'student_fee_payment_history']))
        ev.push(
          <SidebarMenuItem
            key={key}
            active={partialMatch}
            open={partialMatch}
            name={item.name}
            icon={item.icon}
            link={item.link}
            badge={item.badge}
            badgeTooltip={item.badgeTooltip}
          >
            {/* @ts-ignore */}
            {renderSidebarMenuItems({
              permissions,
              path,
              items: item.items
            })}
          </SidebarMenuItem>
        );
    } else if (item.name === 'Routine') {
      if (permissionVerify(permissions, ['show_class_routine', 'show_exam_routine']))
        ev.push(
          <SidebarMenuItem
            key={key}
            active={partialMatch}
            open={partialMatch}
            name={item.name}
            icon={item.icon}
            link={item.link}
            badge={item.badge}
            badgeTooltip={item.badgeTooltip}
          >
            {/* @ts-ignore */}
            {renderSidebarMenuItems({
              permissions,
              path,
              items: item.items
            })}
          </SidebarMenuItem>
        );
    } else if (item.name === 'Daily Notes') {
      if (permissionVerify(permissions, ['create_note', 'update_note', 'show_note']))
        ev.push(
          <SidebarMenuItem
            key={key}
            active={partialMatch}
            open={partialMatch}
            name={item.name}
            icon={item.icon}
            link={item.link}
            badge={item.badge}
            badgeTooltip={item.badgeTooltip}
          >
            {/* @ts-ignore */}
            {renderSidebarMenuItems({
              permissions,
              path,
              items: item.items
            })}
          </SidebarMenuItem>
        );
    } else if (item.name === 'Voice Msg') {
      if (
        permissionVerify(permissions, [
          'create_voice_sms_gateway',
          'show_voice_sms_gateway',
          'send_voice_sms',
          'show_voice_sms_templates',
          'create_voice_sms_template'
        ])
      )
        ev.push(
          <SidebarMenuItem
            key={key}
            active={partialMatch}
            open={partialMatch}
            name={item.name}
            icon={item.icon}
            link={item.link}
            badge={item.badge}
            badgeTooltip={item.badgeTooltip}
          >
            {/* @ts-ignore */}
            {renderSidebarMenuItems({
              permissions,
              path,
              items: item.items
            })}
          </SidebarMenuItem>
        );
    } else {
      ev.push(
        <SidebarMenuItem
          key={key}
          active={partialMatch}
          open={partialMatch}
          name={item.name}
          icon={item.icon}
          link={item.link}
          badge={item.badge}
          badgeTooltip={item.badgeTooltip}
        >
          {/* @ts-ignore */}
          {renderSidebarMenuItems({
            permissions,
            path,
            items: item.items
          })}
        </SidebarMenuItem>
      );
    }
  } else {
    if (
      item.name === 'Sections' ||
      item.name === 'Subjects' ||
      item.name === 'Schools' ||
      item.name === 'Teachers' ||
      item.name === 'Students' ||
      item.name === 'Sessions' ||
      item.name === 'Period' ||
      item.name === 'Discount' ||
      item.name === 'Classes' ||
      item.name === 'Class Routine' ||
      item.name === 'Exam Routine' ||
      item.name === 'Fees' ||
      item.name === 'Collect Fee' ||
      item.name === 'Payment' ||
      item.name === 'Payment History' ||
      item.name === 'Rooms' ||
      item.name === 'Grading system' ||
      item.name === 'Exam' ||
      item.name === 'CollectFee' ||
      item.name === 'Holidays' ||
      item.name === 'Section Wise Result' ||
      item.name === 'Student Wise Result' ||
      item.name === 'Student Result' ||
      item.name === 'Exam Addtional Marks' ||
      item.name === 'Academic Years' ||
      item.name === 'Leave Application' ||
      item.name === 'Department' ||
      item.name === 'Package' ||
      item.name === 'Front End' ||
      item.name === 'Pending Package' ||
      item.name === 'Pending Buy Sms' ||
      item.name === 'Users' ||
      item.name === 'Staffs' ||
      item.name === 'Students Attendence' ||
      item.name === 'Exam Attendence' ||
      item.name === 'Employee Attendence' ||
      item.name === 'Student Exam Attendence' ||
      item.name === 'Notice' ||
      item.name === 'Certificate Template' ||
      item.name === 'Student Certificate' ||
      item.name === 'Teacher Certificate' ||
      item.name === 'Employee Certificate' ||
      item.name === 'Daily Notes' ||
      item.name === 'Entry Notes' ||
      item.name === 'Show Notes' ||
      item.name === 'Syllabus' ||
      item.name === 'Home work' ||
      item.name === 'Teacher Exam Routine' ||
      item.name === 'Banners' ||
      item.name === 'Package payment history' ||
      item.name === 'Package Request' ||
      item.name === 'Payment Gateway' ||
      item.name === 'Sms Request' ||
      item.name === 'SMS' ||
      item.name === 'Student Auto Sent Sms' ||
      item.name === 'All SMS Gateways' ||
      item.name === 'Send Voice' ||
      item.name === 'Gateway' ||
      item.name === 'Template'
    ) {
      // switch(item.name){
      //   case 'Sections':
      //     sub_menu();
      //     break;
      // }
      if (item.name === 'Sections' && permissions?.findIndex((i) => i.group == 'section') > -1) sub_menu();
      if (item.name === 'Leave Application' && permissions?.findIndex((i) => i.group == 'leave') > -1) sub_menu();
      if (item.name === 'Subjects' && permissions?.findIndex((i) => i.group == 'subject') > -1) sub_menu();
      if (item.name === 'Schools' && permissions?.findIndex((i) => i.group == 'school') > -1) sub_menu();
      if (item.name === 'Teachers' && permissions?.findIndex((i) => i.group == 'teacher') > -1) sub_menu();
      if (item.name === 'Students' && permissions?.findIndex((i) => i.group == 'student') > -1) sub_menu();
      if (item.name === 'Sessions' && permissions?.findIndex((i) => i.group == 'session') > -1) sub_menu();
      if (item.name === 'Period' && permissions?.findIndex((i) => i.group == 'period') > -1) sub_menu();
      if (item.name === 'Discount' && permissions?.findIndex((i) => i.group == 'discount') > -1) sub_menu();

      // if (item.name === 'Routine' && permissions?.findIndex(i => i.group == 'routine') > -1) sub_menu();

      if (item.name === 'Classes' && permissions?.findIndex((i) => i.group == 'class') > -1) sub_menu();
      if (item.name === 'Rooms' && permissions?.findIndex((i) => i.group == 'room') > -1) sub_menu();
      if (item.name === 'Grading system' && permissions?.findIndex((i) => i.group == 'grade') > -1) sub_menu();
      if (item.name === 'Exam' && permissions?.findIndex((i) => i.group == 'exam') > -1) sub_menu();
      if (item.name === 'CollectFee' && permissions?.findIndex((i) => i.group == 'collect_fee') > -1) sub_menu();
      if (item.name === 'Holidays' && permissions?.findIndex((i) => i.group == 'holiday') > -1) sub_menu();
      if (item.name === 'Academic Years' && permissions?.findIndex((i) => i.group == 'academic_years') > -1) sub_menu();
      if (item.name === 'Department' && permissions?.findIndex((i) => i.group == 'department') > -1) sub_menu();
      if (item.name === 'Users' && permissions?.findIndex((i) => i.group == 'user') > -1) sub_menu();
      if (item.name === 'Package' && permissions?.findIndex((i) => i.group == 'package') > -1) sub_menu();
      if (item.name === 'Front End' && permissions?.findIndex((i) => i.group == 'front_end') > -1) sub_menu();
      if (item.name === 'Notice' && permissions?.findIndex((i) => i.group === 'notice') > -1) sub_menu();
      if (item.name === 'Pending Package' && permissions?.findIndex((i) => i.group == 'pending_package') > -1) sub_menu();

      if (item.name === 'Students Attendence' && permissions?.findIndex((i) => i.value == 'create_student_attendence') > -1) sub_menu();
      if (item.name === 'Exam Attendence' && permissions?.findIndex((i) => i.value == 'create_exam_attendence') > -1) sub_menu();
      if (item.name === 'Employee Attendence' && permissions?.findIndex((i) => i.value == 'create_employee_attendence') > -1) sub_menu();

      //validate using permissions values

      // admistrator
      if (item.name === 'Staffs' && permissionVerify(permissions, ['create_staff', 'create_accountant', 'create_librarian', 'create_receptionist']))
        sub_menu();

      //buy sms
      if (item.name === 'Pending Buy Sms' && permissionVerify(permissions, ['pending_buy_sms'])) sub_menu();

      // attendence
      if (item.name === 'Student Exam Attendence' && permissionVerify(permissions, [item.value])) sub_menu();

      //Routine
      if (item.name === 'Class Routine' && permissionVerify(permissions, ['show_class_routine'])) sub_menu();
      if (item.name === 'Exam Routine' && permissionVerify(permissions, ['show_exam_routine'])) sub_menu();

      //result section
      if (item.name === 'Section Wise Result' && permissionVerify(permissions, ['create_result', 'show_section_wise_result'])) sub_menu();
      if (item.name === 'Exam Addtional Marks' && permissionVerify(permissions, ['create_result', 'show_section_wise_result'])) sub_menu();
      if (item.name === 'Student Wise Result' && permissionVerify(permissions, ['show_student_wise_result'])) sub_menu();
      if (item.name === 'Student Result' && permissionVerify(permissions, ['show_student_result'])) sub_menu();

      //fees
      if (item.name === 'Fees' && permissionVerify(permissions, ['create_fee', 'show_fee'])) sub_menu();
      if (item.name === 'Collect Fee' && permissionVerify(permissions, ['collect_fee'])) sub_menu();
      if (item.name === 'Payment' && permissionVerify(permissions, ['student_fee_payment'])) sub_menu();
      if (item.name === 'Payment History' && permissionVerify(permissions, ['student_fee_payment_history'])) sub_menu();

      // certificates
      if (item.name === 'Certificate Template' && permissionVerify(permissions, ['create_certificate_template'])) sub_menu();
      if (item.name === 'Student Certificate' && permissionVerify(permissions, ['show_student_certificate'])) sub_menu();
      if (item.name === 'Teacher Certificate' && permissionVerify(permissions, ['show_teacher_certificate'])) sub_menu();
      if (item.name === 'Employee Certificate' && permissionVerify(permissions, ['show_employee_certificate'])) sub_menu();

      // student class notes
      if (item.name === 'Entry Notes' && permissionVerify(permissions, ['create_note', 'update_note'])) sub_menu();
      if (item.name === 'Show Notes' && permissionVerify(permissions, ['show_note'])) sub_menu();

      // syllebus
      if (item.name === 'Syllabus' && permissionVerify(permissions, ['show_syllabus'])) sub_menu();

      //teacher
      if (item.name === 'Teacher Exam Routine' && permissionVerify(permissions, ['show_teacher_exam_routine'])) sub_menu();
      // homework
      if (item.name === 'Home work' && permissionVerify(permissions, ['homework'])) sub_menu();
      // banners
      if (item.name === 'Banners' && permissionVerify(permissions, ['create_banner'])) sub_menu();

      //package
      if (item.name === 'Package payment history' && permissionVerify(permissions, ['package_payment_history'])) sub_menu();

      //settings
      if (item.name === 'Package Request' && permissionVerify(permissions, ['package_request'])) sub_menu();
      if (item.name === 'Payment Gateway' && permissionVerify(permissions, ['add_payment_gateway_credentials'])) sub_menu();
      if (item.name === 'Sms Request' && permissionVerify(permissions, ['request_buy_sms'])) sub_menu();
      if (item.name === 'SMS' && permissionVerify(permissions, ['create_sms_gateway'])) sub_menu();
      if (item.name === 'Student Auto Sent Sms' && permissionVerify(permissions, ['modify_student_auto_sent_sms'])) sub_menu();

      // all sms gateways
      if (item.name === 'All SMS Gateways' && permissionVerify(permissions, ['add_all_sms_gateways'])) sub_menu();

      // voice sms
      if (item.name === 'Send Voice' && permissionVerify(permissions, ['send_voice_sms'])) sub_menu();
      if (item.name === 'Gateway' && permissionVerify(permissions, ['create_voice_sms_gateway', 'show_voice_sms_gateway'])) sub_menu();
      if (item.name === 'Template' && permissionVerify(permissions, ['show_voice_sms_templates', 'create_voice_sms_template'])) sub_menu();
    } else sub_menu();
    // {
    // if (!permissions?.includes('create_admin')) sub_menu();
    // } else sub_menu();
  }

  return ev;
};

function SidebarMenu() {
  const { t }: { t: any } = useTranslation();
  const router = useRouter();
  const { selectModule } = useContext(ModuleContext);

  const handlePathChange = () => {
    if (!router.isReady) {
      return;
    }
  };

  useEffect(handlePathChange, [router.isReady, router.asPath]);

  return (
    <>
      <AuthConsumer>
        {({ user }) => {
          const permissions = [];
          if (user?.permissions?.length > 0) {
            user.permissions.map((permission: any) => permissions.push(permission));
          }
          // @ts-ignore
          const roleTitle = user?.role?.title;
          const roleLower = roleTitle?.toLowerCase();
          // select role wise module lists
          const allItems = {
            adminItems,
            teacherItems,
            studentItems
          };
          const selectRoleWiseMenuItems = allItems[`${roleLower}Items`];
          const selectModuleFromRoleWiseMenuItems = selectRoleWiseMenuItems ? selectRoleWiseMenuItems[selectModule] : [{ items: [] }];
          const showMenuItems = [{ items: [] }];
          if (
            Array.isArray(selectModuleFromRoleWiseMenuItems) &&
            selectModuleFromRoleWiseMenuItems[0]?.items &&
            selectRoleWiseMenuItems?.module_dashboard
          ) {
            showMenuItems[0].items = [selectRoleWiseMenuItems.module_dashboard, ...selectModuleFromRoleWiseMenuItems[0]?.items];
          }
          if (!['ADMIN', 'TEACHER', 'STUDENT'].includes(roleTitle))
            return (
              <>
                {allUserMenuItems?.map((section: any) => (
                  <MenuWrapper key={section.heading}>
                    <List
                      component="div"
                      subheader={
                        <ListSubheader component="div" disableSticky>
                          {t(section.heading)}
                        </ListSubheader>
                      }
                    >
                      {renderSidebarMenuItems({
                        permissions: permissions,
                        items: section.items,
                        path: router.asPath
                      })}
                    </List>
                  </MenuWrapper>
                ))}
              </>
            );

          return (
            <>
              {dashboardMenuItem.map((section: any) => (
                <MenuWrapper key={section.heading}>
                  <List
                    component="div"
                    subheader={
                      <ListSubheader component="div" disableSticky>
                        {t(section.heading)}
                      </ListSubheader>
                    }
                  >
                    {renderSidebarMenuItems({
                      permissions: permissions,
                      items: section.items,
                      path: router.asPath
                    })}
                  </List>
                </MenuWrapper>
              ))}
              <Grid textTransform={'uppercase'} pl={2} fontWeight={700} sx={{ color: (theme) => theme.colors.alpha.white[70] }}>
                {selectModule && `${selectModule.split('_').join(' ')} Module :`}
              </Grid>
              {/* selected nav for users */}
              {showMenuItems?.map((section: any) => (
                <MenuWrapper key={section.heading}>
                  <List
                    component="div"
                    subheader={
                      <ListSubheader component="div" disableSticky>
                        {t(section.heading)}
                      </ListSubheader>
                    }
                  >
                    {renderSidebarMenuItems({
                      permissions: permissions,
                      items: section.items,
                      path: router.asPath
                    })}
                  </List>
                </MenuWrapper>
              ))}
            </>
          );
        }}
      </AuthConsumer>
    </>
  );
}

export default SidebarMenu;
