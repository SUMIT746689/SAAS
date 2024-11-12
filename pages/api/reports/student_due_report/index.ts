import prisma from '@/lib/prisma_client';
import { academicYearVerify, authenticate } from 'middleware/authenticate';
import { logFile } from 'utilities_api/handleLogFile';

const index = async (req, res, refresh_token, academic_year) => {
  try {
    const { method } = req;
    const { school_id } = refresh_token;

    switch (method) {
      case 'GET':
        const { month_name, selected_class, selected_group, selected_section, selected_student } = req.query;


        const where = {};
        if (selected_group) {
          where['group_id'] = {
            in: selected_group?.split(',').map(Number)
          };
        }
        const studentDueInfo = await prisma.studentFee.findMany({
          where: {
            fee: {
              fees_month: month_name.toLowerCase(),
              class_id: parseInt(selected_class),
              school_id
            },
            student: {
              id: {
                in: selected_student?.split(',').map(Number)
              },
              batches: {
                some: {
                  id: {
                    in: selected_section?.split(',').map(Number)
                  }
                }
              },
              // section_id: {
              //   in: selected_section?.split(',').map(Number)
              // },
              ...where
            }
          },

          select: {
            on_time_discount: true,
            fee: {
              select: {
                amount: true,
                Discount: {
                  select: {
                    amt: true,
                    type: true
                  }
                }
              }
            },

            total_payable: true,
            collected_amount: true,
            student: {
              select: {
                id: true,
                academic_year: {
                  select: {
                    title: true
                  }
                },
                class_roll_no: true,
                batches: {
                  select: { name: true }
                },
                // section: {
                //   select: {
                //     name: true
                //   }
                // },
                group: {
                  select: {
                    title: true
                  }
                },
                student_info: {
                  select: {
                    student_id: true,
                    first_name: true,
                    middle_name: true,
                    last_name: true
                  }
                }
              }
            }
          }
        });

        console.log('hi...', JSON.stringify(studentDueInfo, null, 4))

        const resStd = await prisma.fee.findMany({
          where: {
            fees_month: month_name.toLowerCase(),
            school_id,
          },
          include: {
            class: {
              select: {
                Student: {
                  // include: {
                  //   discount:true,
                  // },
                  select: {
                    id: true,
                    academic_year: {
                      select: {
                        title: true
                      }
                    },
                    class_roll_no: true,
                    batches: {
                      select: {
                        name: true
                      }
                    },
                    group: {
                      select: {
                        title: true
                      }
                    },
                    student_info: {
                      select: {
                        student_id: true,
                        father_name: true,
                        middle_name: true,
                        last_name: true
                      }
                    }
                  }
                }
              }
            },
            Discount: true,
            fees_head: {
              select: {
                title: true,
              }
            },
            student_fees: {
              include: {
                student: {
                  include: {
                    discount: true
                  }
                },

              }
            }
          }
        });

        const resStd_ = await prisma.student.findMany({
          where: {
            id: selected_student?.split(',').map(Number),
            class_id: parseInt(selected_class),
          },
          // select:{
            
          // }
        });

        console.log('all Fees', JSON.stringify(resStd, null, 4))

        res.status(200).json({
          status: true,
          studentDueInfo
        });
        break;

      default:
        res.setHeader('Allow', ['GET']);
        logFile.error(`Method ${method} Not Allowed`);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (err) {
    logFile.error(err.message);
    res.status(500).json({ message: err.message });
  }
};

export default authenticate(academicYearVerify(index));
