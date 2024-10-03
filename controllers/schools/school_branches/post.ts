import prisma from '@/lib/prisma_client';
import { authenticate } from 'middleware/authenticate';
import { logFile } from 'utilities_api/handleLogFile';

const postSchool = async (req, res, authenticate_user) => {
  try {
    const { school_id, admin_panel_id } = authenticate_user;
    console.log({ authenticate_user })

    const authenticate_user_Info = await prisma.user.findFirst({
      where: {
        id: authenticate_user.id,
        school_id
      },
      select: {
        role: true,
        school: {
          include: {
            subscription: {
              where: { is_active: true },
              include: { package: true },
              orderBy: { id: "desc" }
            },
          }
        }
      }
    });

    if (!authenticate_user_Info.school.branch_limit) throw new Error(`permission denied `);

    const getAlreadyCreateNoOfSchoolBranch = await prisma.school.count({ where: { parent_school_id: school_id } })

    if (authenticate_user_Info.school.branch_limit <= getAlreadyCreateNoOfSchoolBranch) throw new Error('branch create permission limit already over')

    if (authenticate_user_Info.role.title !== 'ADMIN') throw new Error('Your role have no permissions');

    const {
      name, phone, email, address, admin_ids, currency, domain,
      // main_balance, masking_sms_price, non_masking_sms_price,
      // masking_sms_count, non_masking_sms_count,
      // package_price, package_duration, package_student_count, is_std_cnt_wise,
      // voice_sms_balance, voice_sms_price, voice_pulse_size,
    } = req.body;

    if (!name || !phone || !email || !address) throw new Error('provide valid data');
    const admins = admin_ids.map((id) => ({ id }));

    // const response = await prisma.school.create({
    //   data: {
    //     name,
    //     phone,
    //     email,
    //     address,
    //     currency,
    //     domain,
    //     main_balance: main_balance ?? undefined,
    //     masking_sms_price: masking_sms_price ?? undefined,
    //     non_masking_sms_price: non_masking_sms_price ?? undefined,
    //     masking_sms_count: masking_sms_count ?? undefined,
    //     non_masking_sms_count: non_masking_sms_count ?? undefined,
    //     admins: { connect: admins }
    //   }
    // });



    const start_date = new Date(Date.now());
    // const end_date_provided = new Date(Date.now());
    // end_date_provided.setDate(end_date_provided.getDate() + package_duration);
    const end_date_provided = authenticate_user_Info.school.subscription[0].end_date;

    const response = await prisma.subscription.create({
      data: {
        school: {
          create: {
            name,
            phone,
            email,
            address,
            currency: authenticate_user_Info.school.currency,
            domain,
            parent_school: { connect: { id: school_id } },
            // main_balance: main_balance ?? undefined,
            // masking_sms_price: masking_sms_price ?? undefined,
            // non_masking_sms_price: non_masking_sms_price ?? undefined,
            // masking_sms_count: masking_sms_count ?? undefined,
            // non_masking_sms_count: non_masking_sms_count ?? undefined,
            // voice_sms_balance,
            // voice_sms_price,
            voice_pulse_size: authenticate_user_Info.school.voice_pulse_size,
            admins: { connect: admins },
            AutoAttendanceSentSms: {
              create: {
                present_body: 'Dear parents, your #relation_with_guardian# #first_name# #middle_name# #last_name# is present today. Punch time #submission_time#',
                absence_body: 'Dear parents, your #relation_with_guardian# #first_name# #middle_name# #last_name# is absence todday. Punch time #submission_time#',
                late_body: 'Dear parents, your #relation_with_guardian# #first_name# #middle_name# #last_name# is late today. Punch time #submission_time#',
              }
            },
            admin_panel: {
              connect: { id: admin_panel_id }
            }
          }

        },
        package: {
          create: {
            price: authenticate_user_Info.school.subscription[0].package.price,
            duration: authenticate_user_Info.school.subscription[0].package.duration,
            student_count: authenticate_user_Info.school.subscription[0].package.student_count,
            is_std_cnt_wise: authenticate_user_Info.school.subscription[0].package.is_std_cnt_wise
          }
        },
        start_date,
        end_date: end_date_provided,
        is_active: true
      }
    });

    await prisma.academicYear.create({ data: { title: String((new Date()).getFullYear()), school_id: response.school_id, curr_active: true } });
    await createClassesWithSections(response.school_id);

    await prisma.accounts.create({
      data: {
        title: "Default", account_number: "0001", description: "This is a default bank accdount", balance: 0, school_id: response.school_id, is_dafault: true,
        payment_method: {
          createMany: {
            data: [
              { title: "cash" },
              { title: "card" }
            ]
          }
        }
      }
    })

    if (!response) throw new Error('Failed to create school');
    res.status(200).json({ success: true, message: 'Successfully created school' });

  } catch (err) {
    logFile.error(err.message)
    if (err.message.includes(`schools_domain_key`)) return res.status(404).json({ error: 'This domain is already used, use another' });

    console.log(err.message);
    res.status(404).json({ error: err.message });
  }
};

export default authenticate(postSchool);


const createClassesWithSections = async (school_id) => {
  // cls sec one
  await prisma.section.create({
    data: {
      name: "default-Play",
      class: {
        create:
          { name: "Play", code: "001", has_section: false, school_id, }
      }
    }
  });
  // cls sec one
  await prisma.section.create({
    data: {
      name: "default-Nursery",
      class: {
        create:
          { name: "Nursery", code: "002", has_section: false, school_id, }
      }
    }
  });
  // cls sec one
  await prisma.section.create({
    data: {
      name: "default-KG",
      class: {
        create:
          { name: "KG", code: "003", has_section: false, school_id, }
      }
    }
  });

  // cls sec one
  await prisma.section.create({
    data: {
      name: "default-One",
      class: {
        create:
          { name: "One", code: "004", has_section: false, school_id, }
      }
    }
  });
  // cls sec two
  await prisma.section.create({
    data: {
      name: "default-Two",
      class: {
        create:
          { name: "Two", code: "005", has_section: false, school_id, }
      }
    }
  });
  // cls sec three
  await prisma.section.create({
    data: {
      name: "default-Three",
      class: {
        create:
          { name: "Three", code: "006", has_section: false, school_id, }
      }
    }
  });
  // cls sec four
  await prisma.section.create({
    data: {
      name: "default-Four",
      class: {
        create:
          { name: "Four", code: "007", has_section: false, school_id, }
      }
    }
  });
  // cls sec five
  await prisma.section.create({
    data: {
      name: "default-Five",
      class: {
        create:
          { name: "Five", code: "008", has_section: false, school_id, }
      }
    }
  });
  // cls sec six
  await prisma.section.create({
    data: {
      name: "default-Six",
      class: {
        create:
          { name: "Six", code: "009", has_section: false, school_id, }
      }
    }
  });
  // cls sec seven
  await prisma.section.create({
    data: {
      name: "default-Seven",
      class: {
        create:
          { name: "Seven", code: "010", has_section: false, school_id, }
      }
    }
  });
  // cls sec eight
  await prisma.section.create({
    data: {
      name: "default-Eight",
      class: {
        create:
          { name: "Eight", code: "011", has_section: false, school_id, }
      }
    }
  });
  // cls sec nine
  await prisma.section.create({
    data: {
      name: "default-Nine",
      class: {
        create:
          { name: "Nine", code: "012", has_section: false, school_id, }
      }
    }
  });
  // cls sec ten
  await prisma.section.create({
    data: {
      name: "default-Ten",
      class: {
        create:
          { name: "Ten", code: "013", has_section: false, school_id, }
      }
    }
  });
}