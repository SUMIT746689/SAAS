import prisma from "@/lib/prisma_client";

export default async function patchSchool(req, res, refresh_token) {
  try {
    const { id } = req.query;
    const { name, subscription_id, phone, email, address,
      admin_ids, currency, domain, main_balance,
      masking_sms_count, non_masking_sms_count,
      masking_sms_price, non_masking_sms_price,
      package_price, package_duration, package_student_count, is_std_cnt_wise
    } = req.body;
    console.log({ subscription_id });

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
    })

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

    // console.log({package_data,subscription_query,data});


    // const response = await prisma.school.update({
    //   where: { id: Number(id) },
    //   data
    // });
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
    // const userSddSchool = await prisma.user.update({
    //   where: { id: admin_id },
    //   data: { school_id: response.id }
    // });
    // if (userSddSchool)
    res.json({ school: response, success: true });
    // else throw new Error('Invalid to create school');

  } catch (err) {
    console.log(err);

    res.status(404).json({ error: err.message });
  }
}
