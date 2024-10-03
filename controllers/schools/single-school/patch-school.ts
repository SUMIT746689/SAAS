import prisma from "@/lib/prisma_client";
import { logFile } from "utilities_api/handleLogFile";

export default async function patchSchool(req, res, refresh_token) {
  try {
    const { id: user_id, name: user_name, } = refresh_token;
    const { id } = req.query;
    const { name, subscription_id, phone, email, address,
      admin_ids, currency, domain, main_balance,
      masking_sms_count, non_masking_sms_count,
      masking_sms_price, non_masking_sms_price,
      package_price, package_duration, package_student_count, is_std_cnt_wise,
      voice_sms_balance,
      voice_sms_price,
      voice_pulse_size,
      branch_limit
    } = req.body;

    let data = {};
    if (name) data['name'] = name;
    if (phone) data['phone'] = phone;
    if (email) data['email'] = email;
    if (address) data['address'] = address;
    if (currency) data['currency'] = currency;
    if (domain) data['domain'] = domain;
    if (main_balance) data['main_balance'] = main_balance;
    if (masking_sms_count) data['masking_sms_count'] = masking_sms_count;
    if (non_masking_sms_count) data['non_masking_sms_count'] = non_masking_sms_count;

    if (masking_sms_price) data['masking_sms_price'] = masking_sms_price;
    if (non_masking_sms_price) data['non_masking_sms_price'] = non_masking_sms_price;

    if (voice_sms_balance) data['voice_sms_balance'] = voice_sms_balance;
    if (voice_sms_price) data['voice_sms_price'] = voice_sms_price;
    if (voice_pulse_size) data['voice_pulse_size'] = voice_pulse_size;
    if (branch_limit) data['branch_limit'] = branch_limit

    const existingSchoolIdList = await prisma.user.findMany({
      where: {
        school_id: Number(id),
        user_role: {
          title: 'ADMIN'
        },
      },
      select: {
        id: true
      }
    });
    const resSchoolInfo = await prisma.school.findFirst({ where: { id: Number(id) } })

    const connectIdList = []
    const disconnectIdList = []

    for (const i of admin_ids) {
      const found = existingSchoolIdList.find(j => j.id == i);
      if (!found) {
        connectIdList.push({ id: i })
      }
    }
    for (const i of existingSchoolIdList) {
      const found = admin_ids.find(j => j == i.id);
      if (!found) {
        disconnectIdList.push({ id: i.id })
      }
    }
    const query = {}
    if (connectIdList.length) {
      query['connect'] = connectIdList
    }
    if (disconnectIdList.length) {
      query['disconnect'] = disconnectIdList
    }
    if (admin_ids)
      data['admins'] = {
        ...query
      };

    const package_data = {}
    const subscription_query = {}
    if (package_price) package_data['price'] = Number(package_price)
    if (package_duration) {
      const prev_sub = await prisma.subscription.findFirst({
        where: { id: Number(subscription_id), school_id: Number(id), },
        select: { start_date: true }
      })
      package_data['duration'] = Number(package_duration)
      const end_date_provided = new Date(prev_sub.start_date);
      end_date_provided.setDate(end_date_provided.getDate() + package_duration);
      subscription_query['end_date'] = end_date_provided

    }
    if (package_student_count) package_data['student_count'] = Number(package_student_count)
    if (is_std_cnt_wise === true || is_std_cnt_wise === false) package_data['is_std_cnt_wise'] = is_std_cnt_wise

    const response = await prisma.subscription.update({
      where: {
        id: Number(subscription_id),
        school_id: Number(id),
      },
      data: {
        school: {
          update: {
            ...data,
          }
        },
        ...subscription_query,
        Subscription_history: {
          create: {
            edited_at: new Date(),
            edited_by: refresh_token?.id
          }
        },
        package: {
          update: {
            ...package_data
          }
        },
      }
    });

    if (!response) throw new Error('Failed to update school');

    // create transaction fot track the changes
    await prisma.tbl_schools_transactions.create({
      data: {
        school_id: resSchoolInfo.id,
        school_name: resSchoolInfo.name,
        updated_by_user_id: user_id,
        updated_by_user_name: user_name,

        main_balance: main_balance || undefined,
        prev_main_balance: main_balance ? resSchoolInfo.main_balance : undefined,

        masking_sms_count: masking_sms_count || undefined,
        prev_masking_sms_count: masking_sms_count ? resSchoolInfo.masking_sms_count : undefined,

        non_masking_sms_count: resSchoolInfo.non_masking_sms_count || undefined,
        prev_non_masking_sms_count: non_masking_sms_count ? resSchoolInfo.non_masking_sms_count : undefined,

        masking_sms_price: masking_sms_price || undefined,
        prev_masking_sms_price: masking_sms_price ? resSchoolInfo.masking_sms_price : undefined,

        non_masking_sms_price: non_masking_sms_price || undefined,
        prev_non_masking_sms_price: non_masking_sms_price ? resSchoolInfo.non_masking_sms_price : undefined,

        voice_sms_balance: voice_sms_balance || undefined,
        prev_voice_sms_balance: voice_sms_balance ? resSchoolInfo.voice_sms_balance : undefined,

        voice_sms_price: voice_sms_price || undefined,
        prev_voice_sms_price: voice_sms_balance ? resSchoolInfo.voice_sms_price : undefined,

        voice_pulse_size: voice_pulse_size || undefined,
        prev_voice_pulse_size: voice_pulse_size ? resSchoolInfo.voice_pulse_size : undefined,

      }
    })

    res.json({ school: response, success: true });

  } catch (err) {
    logFile.error(err.message)
    res.status(404).json({ error: err.message });
  }
}
